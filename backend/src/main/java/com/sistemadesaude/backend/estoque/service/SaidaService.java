package com.sistemadesaude.backend.estoque.service;

import com.sistemadesaude.backend.estoque.dto.SaidaDTO;
import com.sistemadesaude.backend.estoque.entity.LocalArmazenamento;
import com.sistemadesaude.backend.estoque.entity.Lote;
import com.sistemadesaude.backend.estoque.entity.Saida;
import com.sistemadesaude.backend.estoque.entity.SaidaItem;
import com.sistemadesaude.backend.estoque.repository.LocalArmazenamentoRepository;
import com.sistemadesaude.backend.estoque.repository.LoteRepository;
import com.sistemadesaude.backend.estoque.repository.SaidaItemRepository;
import com.sistemadesaude.backend.estoque.repository.SaidaRepository;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Objects;

/**
 * Serviço de Saída de estoque.
 * - Não depende de builders nas entidades (usa setters; se ausentes, reflection segura).
 * - Tolerante a variações de nomes no SaidaDTO (responsavel/responsavelNome, motivo/motivoSaida, etc.).
 * - Usa o serviço real do módulo para debitar estoque: {@link EstoqueMovimentoService}.
 *
 * IMPORTANTE:
 * - Adicionado método alias {@code criar(SaidaDTO)} para compatibilidade com o SaidaController.
 *   Ele apenas delega para {@link #registrarSaida(SaidaDTO)}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SaidaService {

    private final LocalArmazenamentoRepository localRepo;
    private final LoteRepository loteRepo;
    private final SaidaRepository saidaRepo;
    private final SaidaItemRepository saidaItemRepo;
    private final EstoqueMovimentoService movService; // serviço real do seu módulo

    // -------------------------------------------------------------------------
    // ALIAS de compatibilidade para o controller: service.criar(dto)
    // -------------------------------------------------------------------------
    @Transactional
    public ApiResponse<Long> criar(SaidaDTO dto) {
        // mantém o contrato do controller atual
        return registrarSaida(dto);
    }

    /**
     * Implementação principal do registro de saída.
     */
    @Transactional
    public ApiResponse<Long> registrarSaida(SaidaDTO dto) {
        // ---- validações defensivas ----
        if (dto == null) {
            return new ApiResponse<>(false, "Dados da saída não informados.", null);
        }

        Long localId = getLongProp(dto, "localId", "idLocal", "local");
        if (localId == null) {
            return new ApiResponse<>(false, "Local de armazenamento não informado.", null);
        }

        Collection<?> itens = getCollectionProp(dto, "itens", "items", "itensSaida");
        if (itens == null || itens.isEmpty()) {
            return new ApiResponse<>(false, "Nenhum item informado para saída.", null);
        }

        // ---- carrega Local ----
        LocalArmazenamento local = localRepo.findById(localId)
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado (id=" + localId + ")."));

        // ---- cria entidade Saida sem builder ----
        Saida saida = new Saida();
        callSetterIfExists(saida, "setDataHora", LocalDateTime.class, LocalDateTime.now());
        callSetterIfExists(saida, "setLocal", LocalArmazenamento.class, local);

        // campos opcionais a partir do DTO (tenta várias alternativas de nomes)
        String responsavel = getStringProp(dto, "responsavel", "responsavelNome", "nomeResponsavel");
        String motivo = getStringProp(dto, "motivo", "motivoSaida");
        String observacoes = getStringProp(dto, "observacoes", "observacoesSaida", "obs");

        setFieldOrSetter(saida, "responsavel", responsavel);
        setFieldOrSetter(saida, "motivo", motivo);
        setFieldOrSetter(saida, "observacoes", observacoes);

        // ---- processa itens ----
        for (Object it : itens) {
            Long loteId = getLongProp(it, "loteId", "idLote", "lote");
            BigDecimal qtd = getBigDecimalProp(it, "quantidade", "qtd", "qtde");

            if (loteId == null || qtd == null) {
                throw new IllegalArgumentException("Item inválido: informe 'loteId' e 'quantidade'.");
            }

            Lote lote = loteRepo.findById(loteId)
                    .orElseThrow(() -> new IllegalArgumentException("Lote não encontrado (id=" + loteId + ")."));

            // cria SaidaItem (sem depender de builder)
            SaidaItem item = new SaidaItem();
            callSetterIfExists(item, "setSaida", Saida.class, saida);
            callSetterIfExists(item, "setLote", Lote.class, lote);
            setQuantidadeItem(item, qtd);

            saidaItemRepo.save(item); // evita depender de cascade

            // debita estoque
            movService.debitar(local, lote, qtd);
        }

        Saida salvo = saidaRepo.save(saida);
        return new ApiResponse<>(true, "Saída registrada com sucesso.", getIdIfExists(salvo));
    }

    // ============================ Helpers DTO/Entity ===========================

    private String getStringProp(Object target, String... candidates) {
        for (String name : candidates) {
            String v = invokeStringGetter(target, name);
            if (v != null) return v;
        }
        return null;
    }

    private Long getLongProp(Object target, String... candidates) {
        for (String name : candidates) {
            Number n = invokeNumberGetter(target, name);
            if (n != null) return n.longValue();
        }
        return null;
    }

    private BigDecimal getBigDecimalProp(Object target, String... candidates) {
        for (String name : candidates) {
            BigDecimal v = invokeBigDecimalGetter(target, name);
            if (v != null) return v;
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Collection<?> getCollectionProp(Object target, String... candidates) {
        for (String name : candidates) {
            try {
                Method m = getterMethod(target, name);
                if (m != null) {
                    Object res = m.invoke(target);
                    if (res instanceof Collection<?>) return (Collection<?>) res;
                }
                Field f = field(target, name);
                if (f != null) {
                    Object res = f.get(target);
                    if (res instanceof Collection<?>) return (Collection<?>) res;
                }
            } catch (Exception ignored) {}
        }
        return null;
    }

    private void setQuantidadeItem(SaidaItem item, BigDecimal qtd) {
        if (callSetterIfExists(item, "setQuantidade", BigDecimal.class, qtd)) return;
        if (callSetterIfExists(item, "setQuantidade", Integer.class, qtd.intValue())) return;
        if (setFieldDirect(item, "quantidade", qtd)) return;
        if (setFieldDirect(item, "qtd", qtd)) return;
        if (setFieldDirect(item, "qtde", qtd)) return;
        throw new IllegalStateException("Não foi possível definir a quantidade no SaidaItem (ajuste nomes dos campos).");
    }

    private Long getIdIfExists(Object entity) {
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

    // ------------------ reflexão utilitária ------------------

    private Method getterMethod(Object target, String prop) {
        String base = prop.substring(0,1).toUpperCase() + prop.substring(1);
        String[] methods = new String[] { "get" + base, "is" + base };
        for (String m : methods) {
            try {
                return target.getClass().getMethod(m);
            } catch (NoSuchMethodException ignored) {}
        }
        return null;
    }

    private Field field(Object target, String name) {
        try {
            Field f = target.getClass().getDeclaredField(name);
            f.setAccessible(true);
            return f;
        } catch (NoSuchFieldException ignored) {
            return null;
        }
    }

    private String invokeStringGetter(Object target, String prop) {
        try {
            Method m = getterMethod(target, prop);
            if (m != null) {
                Object v = m.invoke(target);
                return v != null ? v.toString() : null;
            }
            Field f = field(target, prop);
            if (f != null) {
                Object v = f.get(target);
                return v != null ? v.toString() : null;
            }
        } catch (Exception ignored) { }
        return null;
    }

    private Number invokeNumberGetter(Object target, String prop) {
        try {
            Method m = getterMethod(target, prop);
            if (m != null) {
                Object v = m.invoke(target);
                if (v instanceof Number) return (Number) v;
                if (v != null) return Long.parseLong(v.toString());
            }
            Field f = field(target, prop);
            if (f != null) {
                Object v = f.get(target);
                if (v instanceof Number) return (Number) v;
                if (v != null) return Long.parseLong(v.toString());
            }
        } catch (Exception ignored) { }
        return null;
    }

    private BigDecimal invokeBigDecimalGetter(Object target, String prop) {
        try {
            Method m = getterMethod(target, prop);
            if (m != null) {
                Object v = m.invoke(target);
                return toBigDecimal(v);
            }
            Field f = field(target, prop);
            if (f != null) {
                Object v = f.get(target);
                return toBigDecimal(v);
            }
        } catch (Exception ignored) { }
        return null;
    }

    private BigDecimal toBigDecimal(Object v) {
        if (v == null) return null;
        if (v instanceof BigDecimal) return (BigDecimal) v;
        if (v instanceof Number) return new BigDecimal(((Number) v).toString());
        return new BigDecimal(v.toString());
    }

    private boolean callSetterIfExists(Object target, String method, Class<?> paramType, Object value) {
        try {
            Method m = target.getClass().getMethod(method, paramType);
            m.invoke(target, value);
            return true;
        } catch (NoSuchMethodException e) {
            return false;
        } catch (Exception e) {
            log.debug("Falha chamando {}: {}", method, e.getMessage());
            return false;
        }
    }

    private void setFieldOrSetter(Object target, String prop, Object value) {
        if (value == null) return;
        String setter = "set" + prop.substring(0,1).toUpperCase() + prop.substring(1);
        if (callSetterIfExists(target, setter, value.getClass(), value)) return;
        if (!(value instanceof String) && callSetterIfExists(target, setter, String.class, Objects.toString(value))) return;
        setFieldDirect(target, prop, value);
    }

    private boolean setFieldDirect(Object target, String fieldName, Object value) {
        try {
            Field f = target.getClass().getDeclaredField(fieldName);
            f.setAccessible(true);
            f.set(target, value);
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }
}
