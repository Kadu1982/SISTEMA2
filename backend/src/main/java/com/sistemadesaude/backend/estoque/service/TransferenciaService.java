package com.sistemadesaude.backend.estoque.service;

import com.sistemadesaude.backend.estoque.dto.AceiteTransferenciaDTO;
import com.sistemadesaude.backend.estoque.dto.EntradaDTO;
import com.sistemadesaude.backend.estoque.dto.TransferenciaDTO;
import com.sistemadesaude.backend.estoque.entity.Lote;
import com.sistemadesaude.backend.estoque.entity.Transferencia;
import com.sistemadesaude.backend.estoque.entity.TransferenciaItem;
import com.sistemadesaude.backend.estoque.enums.StatusTransferencia;
import com.sistemadesaude.backend.estoque.repository.LocalArmazenamentoRepository;
import com.sistemadesaude.backend.estoque.repository.LoteRepository;
import com.sistemadesaude.backend.estoque.repository.TransferenciaItemRepository;
import com.sistemadesaude.backend.estoque.repository.TransferenciaRepository;
import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.unidadesaude.repository.UnidadeSaudeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Serviço de Transferências de estoque (entre unidades/locais).
 * - criar: debita estoque de origem
 * - receber/aceitar: registra quantidades recebidas e gera Entrada no destino
 *
 * Observações:
 * - Não depende de builders; usa setters/reflection para tolerar variações do seu modelo.
 * - Entrada no destino é gerada no "receber/aceitar".
 * - Usa EstoqueMovimentoService para débitos/créditos conforme seu módulo real.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TransferenciaService {

    private final UnidadeSaudeRepository unidadeRepo;
    private final LocalArmazenamentoRepository localRepo;
    private final LoteRepository loteRepo;
    private final TransferenciaRepository transfRepo;
    private final TransferenciaItemRepository transfItemRepo;

    private final EntradaService entradaService;
    private final EstoqueMovimentoService movService;

    /** Cria a transferência e DEBITA o estoque da origem. */
    @Transactional
    public ApiResponse<Long> criar(TransferenciaDTO dto) {
        Objects.requireNonNull(dto, "TransferenciaDTO não pode ser nulo");
        Objects.requireNonNull(dto.getUnidadeOrigemId(), "Unidade de origem é obrigatória");
        Objects.requireNonNull(dto.getLocalOrigemId(), "Local de origem é obrigatório");
        Objects.requireNonNull(dto.getUnidadeDestinoId(), "Unidade de destino é obrigatória");
        Objects.requireNonNull(dto.getLocalDestinoId(), "Local de destino é obrigatório");
        if (dto.getItens() == null || dto.getItens().isEmpty()) {
            return new ApiResponse<>(false, "Nenhum item informado para transferência.", null);
        }

        var uo = unidadeRepo.findById(dto.getUnidadeOrigemId()).orElseThrow();
        var lo = localRepo.findById(dto.getLocalOrigemId()).orElseThrow();
        var ud = unidadeRepo.findById(dto.getUnidadeDestinoId()).orElseThrow();
        var ld = localRepo.findById(dto.getLocalDestinoId()).orElseThrow();

        // --- cria Transferencia sem builder ---
        Transferencia t = new Transferencia();
        callSetterIfExists(t, "setUnidadeOrigem", uo);
        callSetterIfExists(t, "setLocalOrigem", lo);
        callSetterIfExists(t, "setUnidadeDestino", ud);
        callSetterIfExists(t, "setLocalDestino", ld);
        callSetterIfExists(t, "setDataHora", LocalDateTime.now());
        callSetterIfExists(t, "setStatus", StatusTransferencia.PENDENTE);
        callSetterIfExists(t, "setObservacoes", dto.getObservacoes());
        ensureItemsList(t);

        // --- itens + debita origem ---
        dto.getItens().forEach(it -> {
            Lote lote = loteRepo.findById(it.getLoteId()).orElseThrow();

            TransferenciaItem ti = new TransferenciaItem();
            callSetterIfExists(ti, "setTransferencia", t);
            callSetterIfExists(ti, "setLote", lote);
            callSetterIfExists(ti, "setQuantidadeEnviada", it.getQuantidade());

            addItemToTransfer(t, ti);
            movService.debitar(lo, lote, toBigDecimal(it.getQuantidade()));
        });

        Transferencia salvo = transfRepo.save(t);
        return new ApiResponse<>(true, "Transferência criada com sucesso.", getIdIfExists(salvo));
    }

    // -------------------------------------------------------------------------
    // ALIAS para compatibilidade com o controller/rotas existentes
    // O seu TransferenciaController chama service.aceitar(dto).
    // Mantemos esse nome e delegamos para receber(dto).
    // -------------------------------------------------------------------------
    @Transactional
    public ApiResponse<Long> aceitar(AceiteTransferenciaDTO dto) {
        return receber(dto);
    }

    /** Recebimento/aceite da transferência (pode ser total ou parcial). Gera entrada no destino. */
    @Transactional
    public ApiResponse<Long> receber(AceiteTransferenciaDTO dto) {
        Objects.requireNonNull(dto, "AceiteTransferenciaDTO não pode ser nulo");
        Objects.requireNonNull(dto.getTransferenciaId(), "transferenciaId é obrigatório");

        Transferencia t = transfRepo.findById(dto.getTransferenciaId()).orElseThrow();

        // Map de itens do aceite por ID do TransferenciaItem
        Map<Long, AceiteTransferenciaDTO.Item> porItem =
                dto.getItens() == null ? Collections.emptyMap()
                        : dto.getItens().stream().collect(Collectors.toMap(
                        AceiteTransferenciaDTO.Item::getTransferenciaItemId, i -> i));

        // Atualiza quantidade recebida em cada item
        for (Object obj : getItemsOfTransfer(t)) {
            TransferenciaItem it = (TransferenciaItem) obj;
            Long itemId = getIdIfExists(it);
            if (itemId == null) continue;

            AceiteTransferenciaDTO.Item ace = porItem.get(itemId);
            if (ace != null) {
                callSetterIfExists(it, "setQuantidadeRecebida", ace.getQuantidadeRecebida());
                transfItemRepo.save(it);
            }
        }

        // Gera entrada no destino com base nas quantidades recebidas (se nulas, usa enviadas)
        gerarEntradaNoDestino(t);

        // Define status final
        boolean todosZero = getItemsOfTransfer(t).stream().allMatch(i -> {
            BigDecimal rec = (BigDecimal) invokeGetter(i, "getQuantidadeRecebida", BigDecimal.class);
            return rec == null || rec.signum() == 0;
        });

        boolean todosTotais = getItemsOfTransfer(t).stream().allMatch(i -> {
            BigDecimal rec = (BigDecimal) invokeGetter(i, "getQuantidadeRecebida", BigDecimal.class);
            BigDecimal env = (BigDecimal) invokeGetter(i, "getQuantidadeEnviada", BigDecimal.class);
            if (rec == null || env == null) return false;
            return rec.compareTo(env) == 0;
        });

        if (todosZero) {
            callSetterIfExists(t, "setStatus", StatusTransferencia.CANCELADA);
        } else if (todosTotais) {
            callSetterIfExists(t, "setStatus", StatusTransferencia.RECEBIDA);
        } else {
            callSetterIfExists(t, "setStatus", StatusTransferencia.PARCIAL);
        }

        transfRepo.save(t);
        return new ApiResponse<>(true, "Transferência recebida/atualizada.", getIdIfExists(t));
    }

    // =========================== Entrada no destino ===========================

    private void gerarEntradaNoDestino(Transferencia t) {
        try {
            Object localDestino = invokeGetter(t, "getLocalDestino", Object.class);
            Long localId = getIdIfExists(localDestino);
            if (localId == null) {
                log.warn("⚠️ Local destino sem ID ao gerar entrada por transferência.");
                return;
            }

            EntradaDTO entrada = new EntradaDTO();
            callSetterIfExists(entrada, "setLocalId", localId);

            Long operacaoId = buscarOperacaoEntradaTransferenciaId();
            if (operacaoId != null) {
                callSetterIfExists(entrada, "setOperacaoId", operacaoId);
            }

            List<EntradaDTO.Item> itensEntrada = new ArrayList<>();
            for (Object obj : getItemsOfTransfer(t)) {
                TransferenciaItem ti = (TransferenciaItem) obj;

                Lote lote = (Lote) invokeGetter(ti, "getLote", Lote.class);
                if (lote == null) continue;

                Long loteId = getIdIfExists(lote);
                BigDecimal qtdRec = (BigDecimal) invokeGetter(ti, "getQuantidadeRecebida", BigDecimal.class);
                BigDecimal qtdEnv = (BigDecimal) invokeGetter(ti, "getQuantidadeEnviada", BigDecimal.class);
                BigDecimal quantidade = (qtdRec != null ? qtdRec : qtdEnv);

                if (loteId == null || quantidade == null || quantidade.signum() == 0) continue;

                EntradaDTO.Item item = new EntradaDTO.Item();
                callSetterIfExists(item, "setLoteId", loteId);
                callSetterIfExists(item, "setQuantidade", quantidade);
                // extras (se existirem no seu DTO de entrada):
                callSetterIfExists(item, "setCodigoBarras", invokeGetter(lote, "getCodigoBarras", String.class));
                callSetterIfExists(item, "setLoteFabricante", invokeGetter(lote, "getLoteFabricante", String.class));
                callSetterIfExists(item, "setDataVencimento", invokeGetter(lote, "getDataVencimento", java.time.LocalDate.class));
                callSetterIfExists(item, "setLocalizacaoFisica", invokeGetter(lote, "getLocalizacaoFisica", String.class));

                itensEntrada.add(item);
            }

            callSetterIfExists(entrada, "setItens", List.class, itensEntrada);
            entradaService.criar(entrada);

        } catch (Exception e) {
            log.error("❌ Falha ao gerar entrada por transferência: {}", e.getMessage(), e);
        }
    }

    /** Se existir uma Operação específica “ENTRADA - Transferência”, retorne o ID correto aqui. */
    private Long buscarOperacaoEntradaTransferenciaId() {
        return null; // sem operação padrão; ajuste conforme sua regra
    }

    // ============================== Helpers ==================================

    private void ensureItemsList(Transferencia t) {
        try {
            Object list = invokeGetter(t, "getItens", List.class);
            if (list == null) {
                Field f = t.getClass().getDeclaredField("itens");
                f.setAccessible(true);
                if (f.get(t) == null) f.set(t, new ArrayList<>());
            }
        } catch (NoSuchFieldException nf) {
            // ok se a entidade gerenciar internamente
        } catch (Exception e) {
            log.debug("ensureItemsList: {}", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private Collection<Object> getItemsOfTransfer(Transferencia t) {
        try {
            Object list = invokeGetter(t, "getItens", List.class);
            if (list instanceof Collection<?>) return (Collection<Object>) list;
            Field f = t.getClass().getDeclaredField("itens");
            f.setAccessible(true);
            Object val = f.get(t);
            if (val instanceof Collection<?>) return (Collection<Object>) val;
        } catch (Exception ignored) {}
        return Collections.emptyList();
    }

    private void addItemToTransfer(Transferencia t, TransferenciaItem ti) {
        try {
            Collection<Object> items = getItemsOfTransfer(t);
            if (items instanceof List) {
                ((List<Object>) items).add(ti);
            } else if (items instanceof Set) {
                ((Set<Object>) items).add(ti);
            } else {
                Field f = t.getClass().getDeclaredField("itens");
                f.setAccessible(true);
                Object val = f.get(t);
                if (val == null) {
                    List<Object> nova = new ArrayList<>();
                    nova.add(ti);
                    f.set(t, nova);
                } else if (val instanceof Collection) {
                    ((Collection<Object>) val).add(ti);
                }
            }
        } catch (Exception e) {
            log.debug("addItemToTransfer: {}", e.getMessage());
        }
    }

    private Long getIdIfExists(Object entity) {
        if (entity == null) return null;
        try {
            Method m = entity.getClass().getMethod("getId");
            Object v = m.invoke(entity);
            if (v instanceof Number) return ((Number) v).longValue();
        } catch (Exception ignored) {
            try {
                Field f = entity.getClass().getDeclaredField("id");
                f.setAccessible(true);
                Object v = f.get(entity);
                if (v instanceof Number) return ((Number) v).longValue();
            } catch (Exception ignored2) { }
        }
        return null;
    }

    private BigDecimal toBigDecimal(Object v) {
        if (v == null) return null;
        if (v instanceof BigDecimal) return (BigDecimal) v;
        if (v instanceof Number) return new BigDecimal(((Number) v).toString());
        return new BigDecimal(v.toString());
    }

    // invocadores genéricos (getter/setter) ---------------------

    private Object invokeGetter(Object target, String methodName, Class<?> expected) {
        if (target == null) return null;
        try {
            Method m = target.getClass().getMethod(methodName);
            Object v = m.invoke(target);
            if (expected.isInstance(v) || v == null) return v;
        } catch (Exception ignored) { }
        return null;
    }

    private boolean callSetterIfExists(Object target, String setter, Object value) {
        if (target == null) return false;
        try {
            Method m = Arrays.stream(target.getClass().getMethods())
                    .filter(mm -> mm.getName().equals(setter) && mm.getParameterCount() == 1)
                    .findFirst().orElse(null);
            if (m == null) return false;
            Class<?> pt = m.getParameterTypes()[0];
            Object val = value;
            if (value != null && !pt.isAssignableFrom(value.getClass())) {
                if (pt == Long.class || pt == long.class) {
                    val = (value instanceof Number) ? ((Number) value).longValue() : Long.parseLong(value.toString());
                } else if (pt == Integer.class || pt == int.class) {
                    val = (value instanceof Number) ? ((Number) value).intValue() : Integer.parseInt(value.toString());
                } else if (pt == BigDecimal.class) {
                    val = toBigDecimal(value);
                }
            }
            m.invoke(target, val);
            return true;
        } catch (Exception e) {
            log.debug("callSetterIfExists {}: {}", setter, e.getMessage());
            return false;
        }
    }

    private boolean callSetterIfExists(Object target, String setter, Class<?> paramType, Object value) {
        if (target == null) return false;
        try {
            Method m = target.getClass().getMethod(setter, paramType);
            m.invoke(target, value);
            return true;
        } catch (NoSuchMethodException e) {
            return false;
        } catch (Exception e) {
            log.debug("callSetterIfExists {}: {}", setter, e.getMessage());
            return false;
        }
    }
}
