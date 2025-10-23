package com.sistemadesaude.backend.operador.controller;

import com.sistemadesaude.backend.operador.entity.OperadorHorarioAcesso;
import com.sistemadesaude.backend.operador.repository.OperadorHorarioAcessoRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Method;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Endpoints da aba "Horários" do Operador.
 *
 * GET  /api/operadores/{operadorId}/horarios
 * PUT  /api/operadores/{operadorId}/horarios   { "horarios": HorarioDTO[] }
 *
 * Ajustes para o seu modelo:
 *  - Sua entidade usa diaSemana do tipo Short → convertemos Integer → Short ao salvar.
 *  - Sua entidade não expõe unidadeId → o campo é opcional; só setamos/lemos se existir
 *    algum dos métodos (get/set) esperados por reflexão: UnidadeId / IdUnidade / UnidadeCodigo.
 */
@RestController
@RequestMapping("/api/operadores/{operadorId}")
@RequiredArgsConstructor
public class OperadorHorariosController {

    private static final Logger log = LoggerFactory.getLogger(OperadorHorariosController.class);
    private static final DateTimeFormatter T = DateTimeFormatter.ISO_LOCAL_TIME; // "HH:mm" ou "HH:mm:ss"

    private final OperadorHorarioAcessoRepository repo;

    /* =======================
       GET: listar horários
       ======================= */

    @GetMapping("/horarios")
    public ResponseEntity<List<HorarioDTO>> listar(@PathVariable Long operadorId) {
        var list = repo.findByOperadorIdOrderByDiaSemanaAscHoraInicioAsc(operadorId);
        List<HorarioDTO> out = new ArrayList<>(list.size());
        for (OperadorHorarioAcesso h : list) {
            out.add(fromEntity(h));
        }
        return ResponseEntity.ok(out);
    }

    private static HorarioDTO fromEntity(OperadorHorarioAcesso h) {
        HorarioDTO d = new HorarioDTO();

        // diaSemana pode ser Short na entidade
        Integer dia = null;
        try {
            Object v = h.getDiaSemana(); // getter tipado existe na entidade
            if (v instanceof Number n) dia = n.intValue();
        } catch (Exception ignored) { /* caso raro */ }
        d.setDiaSemana(dia);

        d.setHoraInicio(h.getHoraInicio() == null ? null : h.getHoraInicio().toString());
        d.setHoraFim(h.getHoraFim() == null ? null : h.getHoraFim().toString());

        // unidadeId é opcional; tentamos alguns getters comuns
        Long unidade = tryGetLong(h, "getUnidadeId", "getIdUnidade", "getUnidadeCodigo");
        d.setUnidadeId(unidade);

        return d;
    }

    /* =======================
       PUT: salvar horários
       ======================= */

    @PutMapping("/horarios")
    @Transactional
    public ResponseEntity<Void> salvar(@PathVariable Long operadorId, @RequestBody HorariosPayload payload) {
        // se payload vazio → apaga tudo
        if (payload == null || payload.getHorarios() == null) {
            var atuais = repo.findByOperadorIdOrderByDiaSemanaAscHoraInicioAsc(operadorId);
            repo.deleteAll(atuais);
            log.info("Operador {}: horários limpos (payload vazio).", operadorId);
            return ResponseEntity.noContent().build();
        }

        // converte/valida itens
        List<OperadorHorarioAcesso> novos = new ArrayList<>();
        for (HorarioDTO dto : payload.getHorarios()) {
            validarDiaSemana(dto.getDiaSemana());

            LocalTime inicio = parseTimeOrNull(dto.getHoraInicio());
            LocalTime fim    = parseTimeOrNull(dto.getHoraFim());

            OperadorHorarioAcesso h = new OperadorHorarioAcesso();
            // campos comuns — estes setters existem no seu modelo
            h.setOperadorId(operadorId);
            // sua entidade exige Short:
            h.setDiaSemana(dto.getDiaSemana() == null ? null : dto.getDiaSemana().shortValue());
            h.setHoraInicio(inicio);
            h.setHoraFim(fim);

            // unidade é opcional; só setamos se existir algum setter compatível
            trySet(h, dto.getUnidadeId(),
                    new String[]{"setUnidadeId", "setIdUnidade", "setUnidadeCodigo"},
                    new Class[]{Long.class, long.class, Number.class});

            novos.add(h);
        }

        // substituição completa: apaga atuais e salva novos
        var atuais = repo.findByOperadorIdOrderByDiaSemanaAscHoraInicioAsc(operadorId);
        repo.deleteAll(atuais);
        repo.saveAll(novos);

        log.info("Operador {}: horários atualizados. {} registro(s).", operadorId, novos.size());
        return ResponseEntity.noContent().build();
    }

    /* =======================
       Utilitários
       ======================= */

    private static void validarDiaSemana(Integer d) {
        if (d == null || d < 1 || d > 7) {
            throw new IllegalArgumentException("diaSemana inválido (esperado 1..7).");
        }
    }

    private static LocalTime parseTimeOrNull(String s) {
        if (s == null || s.isBlank()) return null;
        // Aceita "HH:mm" ou "HH:mm:ss"
        return LocalTime.parse(s.trim(), T);
    }

    /** Tenta configurar um Long em possíveis setters (por nome e tipo). Ignora falhas silenciosamente. */
    private static void trySet(Object alvo, Long valor, String[] nomes, Class<?>[] tiposAceitos) {
        if (valor == null || alvo == null || nomes == null) return;
        for (String nome : nomes) {
            for (Class<?> tipo : tiposAceitos) {
                try {
                    Method m = alvo.getClass().getMethod(nome, tipo);
                    if (tipo == Long.class) {
                        m.invoke(alvo, valor);
                    } else if (tipo == long.class) {
                        m.invoke(alvo, valor.longValue());
                    } else if (tipo == Number.class) {
                        m.invoke(alvo, (Number) valor);
                    }
                    return; // conseguiu setar, encerra
                } catch (Exception ignored) { }
            }
        }
    }

    /** Tenta ler um Long a partir de possíveis getters. */
    private static Long tryGetLong(Object alvo, String... getters) {
        if (alvo == null || getters == null) return null;
        for (String g : getters) {
            try {
                Method m = alvo.getClass().getMethod(g);
                Object v = m.invoke(alvo);
                if (v instanceof Number n) return n.longValue();
                if (v != null) return Long.valueOf(v.toString());
            } catch (Exception ignored) { }
        }
        return null;
    }

    /* =======================
       DTOs do endpoint
       ======================= */

    @Getter @Setter
    public static class HorariosPayload {
        private List<HorarioDTO> horarios;
    }

    @Getter @Setter
    public static class HorarioDTO {
        private Integer diaSemana;  // 1..7 (Integer no payload; convertemos para Short na entidade)
        private String  horaInicio; // "HH:mm" ou "HH:mm:ss" (opcional)
        private String  horaFim;    // "HH:mm" ou "HH:mm:ss" (opcional)
        private Long    unidadeId;  // opcional — só usado se sua entidade suportar
    }
}
