package com.sistemadesaude.backend.operador.service;

import com.sistemadesaude.backend.operador.dto.TermoUsoDTO;
import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.operador.entity.OperadorTermoUso;
import com.sistemadesaude.backend.operador.repository.OperadorTermoUsoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.time.*;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Serviço para gestão de Termos de Uso do Operador.
 *
 * Observações de compatibilidade:
 * - NÃO usamos métodos customizados de repositório (como registrarAceite). Apenas save/findByOperadorId.
 * - Ordenação é feita em memória para evitar acoplamento com nomes de campos que podem variar.
 * - Para campos opcionais (ip, userAgent) e, se necessário, a data, usamos reflexão defensiva.
 */
@Service
@RequiredArgsConstructor
public class TermoUsoService {

    private final OperadorTermoUsoRepository termoRepo;

    /** Lista todos os aceites do operador, mais recentes primeiro. */
    public List<TermoUsoDTO> listarAceites(Long operadorId) {
        return termoRepo.findByOperadorId(operadorId).stream()
                .sorted(Comparator.comparing(
                        // ordena DESC pela data de aceite (se nula, vai para o fim)
                        (OperadorTermoUso t) -> extractOffsetDateTime(t, "getAceitoEm", "getDataAceite", "getAceiteEmData"),
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Verifica se o termo de uso é obrigatório e não foi aceito pelo operador.
     * Por enquanto, retorna sempre false (termo não obrigatório).
     * TODO: Implementar lógica de verificação de termo obrigatório quando necessário.
     */
    public boolean isTermoObrigatorioENaoAceito(Operador operador) {
        // Por enquanto, assume que o termo não é obrigatório
        return false;
    }

    /**
     * Registra (ou retorna) o aceite de uma versão do termo para o operador.
     * Se já existir aceite dessa versão, devolve o mais recente sem criar novo.
     */
    @Transactional
    public TermoUsoDTO aceitar(Long operadorId, String versao, String ip, String userAgent) {
        if (versao == null || versao.isBlank()) {
            throw new IllegalArgumentException("Versão do termo é obrigatória.");
        }

        // Caso já exista aceite desta versão, retornamos o mais recente
        if (termoRepo.existsByOperadorIdAndVersao(operadorId, versao)) {
            OperadorTermoUso ultimo = termoRepo.findByOperadorId(operadorId).stream()
                    .filter(t -> versao.equals(t.getVersao()))
                    .max(Comparator.comparing(
                            (OperadorTermoUso t) -> extractOffsetDateTime(t, "getAceitoEm", "getDataAceite", "getAceiteEmData"),
                            Comparator.nullsLast(Comparator.naturalOrder())))
                    .orElse(null);
            return toDTO(ultimo);
        }

        // Cria um novo aceite
        OperadorTermoUso ent = new OperadorTermoUso();
        ent.setOperadorId(operadorId);
        ent.setVersao(versao);

        // Tenta setar OffsetDateTime diretamente; se a entidade não tiver o setter exato,
        // tentamos por reflexão (nomes alternativos).
        boolean setOk = trySet(ent, "setAceitoEm", OffsetDateTime.now(), OffsetDateTime.class);
        if (!setOk) {
            // fallback para entidades que usam LocalDateTime/Instant/Date
            LocalDateTime ldt = LocalDateTime.now();
            if (!trySet(ent, "setDataAceite", ldt, LocalDateTime.class)) {
                trySet(ent, "setAceiteEmData",
                        ldt.atZone(ZoneId.systemDefault()).toInstant(), java.time.Instant.class);
            }
        }

        // Campos opcionais (só setamos se existirem na entidade)
        if (ip != null) {
            trySet(ent, "setIp", ip, String.class);
        }
        if (userAgent != null) {
            trySet(ent, "setUserAgent", userAgent, String.class);
        }

        OperadorTermoUso salvo = termoRepo.save(ent);
        return toDTO(salvo);
    }

    /* ==============================
       Mapeamento Entidade -> DTO
       ============================== */

    private TermoUsoDTO toDTO(OperadorTermoUso e) {
        if (e == null) return null;
        TermoUsoDTO d = new TermoUsoDTO();
        d.setId(e.getId());
        d.setOperadorId(e.getOperadorId());
        d.setVersao(e.getVersao());

        // Converte a data da entidade para OffsetDateTime no DTO
        OffsetDateTime odt = extractOffsetDateTime(e, "getAceitoEm", "getDataAceite", "getAceiteEmData");
        d.setAceitoEm(odt);

        // ip e userAgent são opcionais no DTO; só setamos se os setters existirem
        String ip = extractString(e, "getIp", "getEnderecoIp", "getIpAddress");
        if (ip != null) {
            trySetDTO(d, "setIp", ip, String.class);
        }
        String ua = extractString(e, "getUserAgent", "getAgenteUsuario", "getNavegador");
        if (ua != null) {
            trySetDTO(d, "setUserAgent", ua, String.class);
        }
        return d;
    }

    /* ==============================
       Helpers de reflexão
       ============================== */

    /** Tenta invocar um setter tipado na ENTIDADE. */
    private static <T> boolean trySet(Object alvo, String setter, T valor, Class<T> tipo) {
        try {
            Method m = alvo.getClass().getMethod(setter, tipo);
            m.invoke(alvo, valor);
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }

    /** Tenta invocar um setter tipado no DTO (ele pode não ter ip/userAgent). */
    private static <T> void trySetDTO(Object dto, String setter, T valor, Class<T> tipo) {
        try {
            Method m = dto.getClass().getMethod(setter, tipo);
            m.invoke(dto, valor);
        } catch (Exception ignored) { }
    }

    /** Extrai String tentando vários getters possíveis. */
    private static String extractString(Object alvo, String... getters) {
        for (String g : getters) {
            try {
                Object v = alvo.getClass().getMethod(g).invoke(alvo);
                if (v != null) return String.valueOf(v);
            } catch (Exception ignored) {}
        }
        return null;
    }

    /** Extrai OffsetDateTime a partir de vários tipos suportados/nomes de getters. */
    private static OffsetDateTime extractOffsetDateTime(Object alvo, String... getters) {
        for (String g : getters) {
            try {
                Object v = alvo.getClass().getMethod(g).invoke(alvo);
                if (v == null) continue;
                if (v instanceof OffsetDateTime odt) return odt;
                if (v instanceof LocalDateTime ldt)
                    return ldt.atZone(ZoneId.systemDefault()).toOffsetDateTime();
                if (v instanceof Instant i)
                    return i.atZone(ZoneId.systemDefault()).toOffsetDateTime();
                if (v instanceof java.util.Date d)
                    return d.toInstant().atZone(ZoneId.systemDefault()).toOffsetDateTime();
            } catch (Exception ignored) {}
        }
        return null;
    }
}
