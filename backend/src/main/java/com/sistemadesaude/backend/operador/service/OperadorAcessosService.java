package com.sistemadesaude.backend.operador.service;

import com.sistemadesaude.backend.operador.dto.AuditoriaLoginDTO;
import com.sistemadesaude.backend.operador.dto.HorarioAcessoDTO;
import com.sistemadesaude.backend.operador.dto.RestricaoAcessoDTO;
import com.sistemadesaude.backend.operador.dto.TermoUsoDTO;
import com.sistemadesaude.backend.operador.entity.OperadorHorarioAcesso;
import com.sistemadesaude.backend.operador.entity.OperadorLoginAuditoria;
import com.sistemadesaude.backend.operador.entity.OperadorRestricaoAcesso;
import com.sistemadesaude.backend.operador.repository.OperadorHorarioAcessoRepository;
import com.sistemadesaude.backend.operador.repository.OperadorLoginAuditoriaRepository;
import com.sistemadesaude.backend.operador.repository.OperadorRestricaoAcessoRepository;
import com.sistemadesaude.backend.operador.repository.OperadorTermoUsoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Serviço central de "Acessos" do Operador:
 *  - Horários de acesso (CRUD)
 *  - Restrições (CRUD)
 *  - Termo de Uso (listar e checar aceite por versão)
 *  - Auditoria de login (listar)
 *
 * ⚙️ Para garantir compilação em qualquer ambiente:
 *  - Evitamos depender de métodos customizados dos repositórios.
 *    Usamos findAll() + filtro/ordenação em memória.
 *  - Para TERMO DE USO, mapeamos campos por reflexão (getters com nomes alternativos).
 */
@Service
@RequiredArgsConstructor
public class OperadorAcessosService {

    private final OperadorHorarioAcessoRepository horarioRepo;
    private final OperadorRestricaoAcessoRepository restrRepo;
    private final OperadorTermoUsoRepository termoRepo;
    private final OperadorLoginAuditoriaRepository auditRepo;

    /* =========================================================
       HORÁRIOS
       ========================================================= */

    public List<HorarioAcessoDTO> listarHorarios(Long operadorId) {
        var list = horarioRepo.findAll().stream()
                .filter(h -> Objects.equals(h.getOperadorId(), operadorId))
                .sorted(Comparator
                        .comparing((OperadorHorarioAcesso h) -> h.getDiaSemana() == null ? 0 : h.getDiaSemana().intValue())
                        .thenComparing(h -> h.getHoraInicio() == null ? LocalTime.MIN : h.getHoraInicio()))
                .collect(Collectors.toList());

        List<HorarioAcessoDTO> out = new ArrayList<>(list.size());
        for (OperadorHorarioAcesso e : list) out.add(mapHorario(e));
        return out;
    }

    @Transactional
    public HorarioAcessoDTO adicionarHorario(Long operadorId, HorarioAcessoDTO in, String usuario) {
        validarHorarioDTO(in);

        OperadorHorarioAcesso e = new OperadorHorarioAcesso();
        e.setOperadorId(operadorId);
        // Sua entidade usa Short para diaSemana
        e.setDiaSemana(in.getDiaSemana());
        e.setHoraInicio(parseTimeOrNull(in.getHoraInicio()));
        e.setHoraFim(parseTimeOrNull(in.getHoraFim()));
        if (in.getAtivo() != null) e.setAtivo(in.getAtivo());
        // entidade pode ter "atualizadoPor"; DTO não precisa disso

        return mapHorario(horarioRepo.save(e));
    }

    @Transactional
    public HorarioAcessoDTO atualizarHorario(Long operadorId, Long id, HorarioAcessoDTO in, String usuario) {
        validarHorarioDTO(in);

        OperadorHorarioAcesso e = horarioRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Horário não encontrado"));

        if (!Objects.equals(e.getOperadorId(), operadorId))
            throw new IllegalArgumentException("Horário não pertence ao operador.");

        e.setDiaSemana(in.getDiaSemana()); // Short → Short
        e.setHoraInicio(parseTimeOrNull(in.getHoraInicio()));
        e.setHoraFim(parseTimeOrNull(in.getHoraFim()));
        if (in.getAtivo() != null) e.setAtivo(in.getAtivo());

        return mapHorario(horarioRepo.save(e));
    }

    @Transactional
    public void removerHorario(Long operadorId, Long id) {
        OperadorHorarioAcesso e = horarioRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Horário não encontrado"));
        if (!Objects.equals(e.getOperadorId(), operadorId))
            throw new IllegalArgumentException("Horário não pertence ao operador.");
        horarioRepo.delete(e);
    }

    private void validarHorarioDTO(HorarioAcessoDTO in) {
        if (in == null) throw new IllegalArgumentException("Dados do horário são obrigatórios.");
        Short d = in.getDiaSemana(); // o DTO do seu projeto expõe Short
        int dia = d == null ? 0 : d.intValue();
        if (dia < 1 || dia > 7) throw new IllegalArgumentException("diaSemana inválido (esperado 1..7).");
        // horaInicio/horaFim opcionais — valida formato se existirem
        if (in.getHoraInicio() != null) parseTimeOrNull(in.getHoraInicio());
        if (in.getHoraFim() != null) parseTimeOrNull(in.getHoraFim());
    }

    private LocalTime parseTimeOrNull(String s) {
        if (s == null || s.isBlank()) return null;
        return LocalTime.parse(s.trim()); // "HH:mm" ou "HH:mm:ss"
    }

    private HorarioAcessoDTO mapHorario(OperadorHorarioAcesso e) {
        HorarioAcessoDTO d = new HorarioAcessoDTO();
        d.setId(e.getId());
        d.setOperadorId(e.getOperadorId());
        d.setDiaSemana(e.getDiaSemana()); // Short ← Short (evita o erro do print)
        d.setHoraInicio(e.getHoraInicio() == null ? null : e.getHoraInicio().toString());
        d.setHoraFim(e.getHoraFim() == null ? null : e.getHoraFim().toString());
        d.setAtivo(e.getAtivo());
        // ⚠️ DTO não possui setAtualizadoPor → não setamos
        return d;
    }

    /* =========================================================
       RESTRIÇÕES
       ========================================================= */

    public List<RestricaoAcessoDTO> listarRestricoes(Long operadorId) {
        var list = restrRepo.findAll().stream()
                .filter(r -> Objects.equals(r.getOperadorId(), operadorId))
                .sorted(Comparator.comparing(OperadorRestricaoAcesso::getId, Comparator.nullsLast(Long::compareTo)))
                .collect(Collectors.toList());

        List<RestricaoAcessoDTO> out = new ArrayList<>(list.size());
        for (OperadorRestricaoAcesso e : list) out.add(mapRestricao(e));
        return out;
    }

    @Transactional
    public RestricaoAcessoDTO adicionarRestricao(Long operadorId, RestricaoAcessoDTO in, String usuario) {
        validarRestricaoDTO(in);

        OperadorRestricaoAcesso e = new OperadorRestricaoAcesso();
        e.setOperadorId(operadorId);
        e.setTipo(in.getTipo());
        e.setValor(in.getValor());
        e.setObservacao(in.getObservacao());
        if (in.getAtivo() != null) e.setAtivo(in.getAtivo());
        // entidade pode registrar "atualizadoPor"; o DTO não expõe isso

        return mapRestricao(restrRepo.save(e));
    }

    @Transactional
    public RestricaoAcessoDTO atualizarRestricao(Long operadorId, Long id, RestricaoAcessoDTO in, String usuario) {
        validarRestricaoDTO(in);

        OperadorRestricaoAcesso e = restrRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Restrição não encontrada"));

        if (!Objects.equals(e.getOperadorId(), operadorId))
            throw new IllegalArgumentException("Restrição não pertence ao operador.");

        e.setTipo(in.getTipo());
        e.setValor(in.getValor());
        e.setObservacao(in.getObservacao());
        if (in.getAtivo() != null) e.setAtivo(in.getAtivo());

        return mapRestricao(restrRepo.save(e));
    }

    @Transactional
    public void removerRestricao(Long operadorId, Long id) {
        OperadorRestricaoAcesso e = restrRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Restrição não encontrada"));
        if (!Objects.equals(e.getOperadorId(), operadorId))
            throw new IllegalArgumentException("Restrição não pertence ao operador.");
        restrRepo.delete(e);
    }

    private void validarRestricaoDTO(RestricaoAcessoDTO in) {
        if (in == null) throw new IllegalArgumentException("Dados da restrição são obrigatórios.");
        if (in.getTipo() == null || in.getTipo().isBlank())
            throw new IllegalArgumentException("Tipo da restrição é obrigatório.");
        if (in.getValor() == null || in.getValor().isBlank())
            throw new IllegalArgumentException("Valor da restrição é obrigatório.");
    }

    private RestricaoAcessoDTO mapRestricao(OperadorRestricaoAcesso e) {
        RestricaoAcessoDTO d = new RestricaoAcessoDTO();
        d.setId(e.getId());
        d.setOperadorId(e.getOperadorId());
        d.setTipo(e.getTipo());
        d.setValor(e.getValor());
        d.setObservacao(e.getObservacao());
        d.setAtivo(e.getAtivo());
        // ⚠️ DTO não possui setAtualizadoPor → não setamos
        return d;
    }

    /* =========================================================
       TERMO DE USO (reflexão para nomes diferentes de getters)
       ========================================================= */

    public List<TermoUsoDTO> listarAceitesTermo(Long operadorId) {
        var list = termoRepo.findAll().stream()
                .filter(t -> Objects.equals(extractLong(t, "getOperadorId", "getIdOperador", "getOperadorCodigo"), operadorId))
                .sorted(Comparator.comparing(
                        (Object t) -> extractOffsetDateTime(t, "getAceitoEm", "getDataAceite", "getAceiteEmData"),
                        Comparator.nullsLast(Comparator.reverseOrder()) // DESC
                ))
                .collect(Collectors.toList());

        List<TermoUsoDTO> out = new ArrayList<>(list.size());
        for (Object t : list) out.add(mapTermo(t));
        return out;
    }

    /** Checa se já existe aceite para a versão informada (versão não vazia). */
    public boolean possuiAceiteDaVersao(Long operadorId, String versao) {
        if (versao == null || versao.isBlank()) return false;
        return termoRepo.findAll().stream()
                .anyMatch(t ->
                        Objects.equals(extractLong(t, "getOperadorId", "getIdOperador", "getOperadorCodigo"), operadorId)
                                && versao.equals(extractString(t, "getVersao", "getVersaoTermo", "getTermoVersao"))
                );
    }

    private TermoUsoDTO mapTermo(Object t) {
        TermoUsoDTO d = new TermoUsoDTO();
        d.setId(extractLong(t, "getId", "getIdTermo", "getIdAceite"));
        d.setOperadorId(extractLong(t, "getOperadorId", "getIdOperador", "getOperadorCodigo"));
        d.setVersao(extractString(t, "getVersao", "getVersaoTermo", "getTermoVersao"));
        // ✅ Agora converto para OffsetDateTime (evita o erro do print)
        d.setAceitoEm(extractOffsetDateTime(t, "getAceitoEm", "getDataAceite", "getAceiteEmData"));
        // Campos opcionais — somente se existirem na sua entidade; manter setIp/setUserAgent no DTO
        String ip = extractString(t, "getIp", "getEnderecoIp", "getIpAddress");
        if (ip != null) d.setIp(ip);
        String ua = extractString(t, "getUserAgent", "getAgenteUsuario", "getNavegador");
        if (ua != null) d.setUserAgent(ua);
        return d;
    }

    /* =========================================================
       AUDITORIA DE LOGIN
       ========================================================= */

    public List<AuditoriaLoginDTO> listarAuditoriaLogin(Long operadorId) {
        var list = auditRepo.findAll().stream()
                .filter(a -> Objects.equals(a.getOperadorId(), operadorId))
                .sorted(Comparator.comparing(OperadorLoginAuditoria::getDataHora, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        List<AuditoriaLoginDTO> out = new ArrayList<>(list.size());
        for (OperadorLoginAuditoria a : list) out.add(mapAuditoria(a));
        return out;
    }

    private AuditoriaLoginDTO mapAuditoria(OperadorLoginAuditoria a) {
        AuditoriaLoginDTO d = new AuditoriaLoginDTO();
        d.setId(a.getId());
        d.setOperadorId(a.getOperadorId());
        d.setDataHora(a.getDataHora());
        d.setIp(a.getIp());
        d.setUserAgent(a.getUserAgent());
        d.setSucesso(a.getSucesso());
        d.setMotivo(a.getMotivo());
        return d;
    }

    /* =========================================================
       Helpers de reflexão (para o Termo)
       ========================================================= */

    private static Object call(Object alvo, String nome) {
        if (alvo == null || nome == null) return null;
        try {
            Method m = alvo.getClass().getMethod(nome);
            return m.invoke(alvo);
        } catch (Exception e) {
            return null;
        }
    }

    private static Long extractLong(Object alvo, String... getters) {
        for (String g : getters) {
            Object v = call(alvo, g);
            if (v instanceof Number n) return n.longValue();
            if (v != null) {
                try { return Long.valueOf(v.toString()); } catch (Exception ignored) {}
            }
        }
        return null;
    }

    private static String extractString(Object alvo, String... getters) {
        for (String g : getters) {
            Object v = call(alvo, g);
            if (v != null) return String.valueOf(v);
        }
        return null;
    }

    private static OffsetDateTime extractOffsetDateTime(Object alvo, String... getters) {
        for (String g : getters) {
            Object v = call(alvo, g);
            if (v == null) continue;
            if (v instanceof OffsetDateTime odt) return odt;
            if (v instanceof LocalDateTime ldt) {
                return ldt.atZone(ZoneId.systemDefault()).toOffsetDateTime();
            }
            if (v instanceof Instant i) {
                return i.atZone(ZoneId.systemDefault()).toOffsetDateTime();
            }
            if (v instanceof Date d) {
                return d.toInstant().atZone(ZoneId.systemDefault()).toOffsetDateTime();
            }
        }
        return null;
    }
}
