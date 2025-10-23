package com.sistemadesaude.backend.operador.controller;

import com.sistemadesaude.backend.operador.dto.TermoUsoDTO;
import com.sistemadesaude.backend.operador.entity.OperadorTermoUso;
import com.sistemadesaude.backend.operador.repository.OperadorTermoUsoRepository;
import com.sistemadesaude.backend.operador.service.TermoUsoService;
import jakarta.transaction.Transactional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/**
 * Controller de Termo de Uso do Operador.
 *
 * ➤ Endpoints expostos (compatíveis com o frontend):
 *  - GET  /api/operadores/{operadorId}/termo           → lista aceites do operador (mais recentes primeiro)
 *  - POST /api/operadores/{operadorId}/termo/aceite    → registra aceite para uma versão
 *  - GET  /api/operadores/{operadorId}/termo/vigente   → retorna versão "vigente" + se o operador já aceitou
 *
 * Observação importante:
 *  - Se você já tiver as mesmas rotas no OperadorAcessosController, remova-as de um dos dois
 *    para evitar "Ambiguous mapping" no startup do Spring.
 */
@RestController
@RequestMapping("/api/operadores/{operadorId}/termo")
@RequiredArgsConstructor
public class OperadorTermoController {

    private final TermoUsoService termoUsoService;
    private final OperadorTermoUsoRepository termoRepo;

    /* =========================================
       LISTAR ACEITES DO OPERADOR
       ========================================= */
    @GetMapping
    public ResponseEntity<List<TermoUsoDTO>> listar(@PathVariable Long operadorId) {
        return ResponseEntity.ok(termoUsoService.listarAceites(operadorId));
    }

    /* =========================================
       ACEITAR UMA VERSÃO DO TERMO
       ========================================= */
    @PostMapping("/aceite")
    @Transactional
    public ResponseEntity<TermoUsoDTO> aceitar(@PathVariable Long operadorId,
                                               @RequestBody AceitePayload payload) {
        if (payload == null || payload.getVersao() == null || payload.getVersao().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        TermoUsoDTO dto = termoUsoService.aceitar(
                operadorId,
                payload.getVersao(),
                payload.getIp(),
                payload.getUserAgent()
        );
        return ResponseEntity.ok(dto);
    }

    /* =========================================
       VERSÃO "VIGENTE" + STATUS DO OPERADOR
       =========================================
       Estratégia simples: considera "vigente" a versão do aceite global mais recente,
       ordenando por data (AceitoEm/DataAceite). Se você tiver uma fonte oficial
       da versão vigente (ex.: tabela/config), me diga que eu troco para ler de lá.
       ========================================= */
    @GetMapping("/vigente")
    public ResponseEntity<TermoVigenteDTO> obterVigente(@PathVariable Long operadorId) {
        // pega o aceite mais recente globalmente (independente do operador)
        OperadorTermoUso maisRecente = termoRepo.findAll().stream()
                .max(Comparator.comparing(
                        this::extractAceitoEm,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .orElse(null);

        if (maisRecente == null) {
            // não há nenhum termo/aceite registrado no sistema
            return ResponseEntity.ok(new TermoVigenteDTO(null, false));
        }

        String versaoVigente = maisRecente.getVersao();
        boolean operadorJaAceitou = termoUsoService.listarAceites(operadorId).stream()
                .anyMatch(t -> Objects.equals(versaoVigente, t.getVersao()));

        return ResponseEntity.ok(new TermoVigenteDTO(versaoVigente, operadorJaAceitou));
    }

    /* =======================
       Payloads/DTOs internos
       ======================= */

    @Getter @Setter
    public static class AceitePayload {
        private String versao;
        private String ip;         // opcional
        private String userAgent;  // opcional
    }

    @Getter
    public static class TermoVigenteDTO {
        private final String versao;
        private final boolean aceito;

        public TermoVigenteDTO(String versao, boolean aceito) {
            this.versao = versao;
            this.aceito = aceito;
        }
    }

    /* =======================
       Helpers locais
       ======================= */

    /** Extrai a data de aceite como OffsetDateTime, tolerando diferentes tipos/campos. */
    private OffsetDateTime extractAceitoEm(OperadorTermoUso e) {
        try {
            var m = e.getClass().getMethod("getAceitoEm");
            Object v = m.invoke(e);
            if (v instanceof OffsetDateTime odt) return odt;
            if (v instanceof java.time.LocalDateTime ldt)
                return ldt.atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime();
            if (v instanceof java.time.Instant i)
                return i.atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime();
            if (v instanceof java.util.Date d)
                return d.toInstant().atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime();
        } catch (Exception ignored) { }

        // tenta outros nomes comuns
        try {
            var m = e.getClass().getMethod("getDataAceite");
            Object v = m.invoke(e);
            if (v instanceof java.time.LocalDateTime ldt)
                return ldt.atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime();
            if (v instanceof java.util.Date d)
                return d.toInstant().atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime();
        } catch (Exception ignored) { }

        try {
            var m = e.getClass().getMethod("getAceiteEmData");
            Object v = m.invoke(e);
            if (v instanceof java.time.Instant i)
                return i.atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime();
            if (v instanceof java.util.Date d)
                return d.toInstant().atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime();
        } catch (Exception ignored) { }

        return null;
    }
}
