package com.sistemadesaude.backend.operador.controller;

import com.sistemadesaude.backend.operador.dto.AuditoriaLoginDTO;
import com.sistemadesaude.backend.operador.entity.OperadorPerfil;
import com.sistemadesaude.backend.operador.entity.key.OperadorPerfilKey;
import com.sistemadesaude.backend.operador.repository.OperadorPerfilRepository;
import com.sistemadesaude.backend.operador.service.OperadorAcessosService;
import jakarta.transaction.Transactional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller de ACESSOS do Operador.
 *
 * 🔧 IMPORTANTE:
 * - Para eliminar "Ambiguous mapping", este controller NÃO expõe mais:
 *   • /horarios  → permanece no OperadorHorariosController
 *   • /termo     → permanece no OperadorTermoController
 *
 * ✅ Aqui ficam apenas:
 *   • /perfis (GET/PUT)
 *   • /auditoria-login (GET)
 */
@RestController
@RequestMapping("/api/operadores/{operadorId}")
@RequiredArgsConstructor
public class OperadorAcessosController {

    private final OperadorAcessosService service;      // usado para auditoria
    private final OperadorPerfilRepository perfilRepo; // usado para perfis

    /* =========================================================
       PERFIS DO OPERADOR (GET/PUT)
       ========================================================= */

    /** Lista os perfis (roles) associados ao operador. */
    @GetMapping("/perfis")
    public ResponseEntity<List<String>> listarPerfis(@PathVariable Long operadorId) {
        return ResponseEntity.ok(perfilRepo.findPerfis(operadorId));
    }

    /**
     * Substitui a lista de perfis do operador.
     * Estratégia simples: apaga os atuais e recria os enviados.
     * 
     * Regra de negócio: Operador deve ter pelo menos 1 perfil.
     */
    @PutMapping("/perfis")
    @Transactional
    public ResponseEntity<Void> salvarPerfis(@PathVariable Long operadorId, @RequestBody PerfisPayload payload) {
        // Validação: pelo menos 1 perfil é obrigatório
        if (payload == null || payload.getPerfis() == null || payload.getPerfis().isEmpty()) {
            throw new IllegalArgumentException("Operador deve ter pelo menos 1 perfil");
        }
        
        // Filtrar perfis válidos (não nulos e não vazios)
        List<String> perfisValidos = payload.getPerfis().stream()
                .filter(p -> p != null && !p.isBlank())
                .toList();
        
        if (perfisValidos.isEmpty()) {
            throw new IllegalArgumentException("Operador deve ter pelo menos 1 perfil válido");
        }
        
        perfilRepo.deleteByOperadorId(operadorId);

        for (String perfil : perfisValidos) {
                OperadorPerfilKey key = new OperadorPerfilKey();
                key.setOperadorId(operadorId);
                key.setPerfil(perfil);

                OperadorPerfil ent = new OperadorPerfil();
                ent.setId(key);

                perfilRepo.save(ent);
        }
        return ResponseEntity.noContent().build();
    }

    /* =========================================================
       AUDITORIA DE LOGIN
       ========================================================= */

    /** Lista eventos de auditoria de login do operador (mais recentes primeiro). */
    @GetMapping("/auditoria-login")
    public ResponseEntity<List<AuditoriaLoginDTO>> listarAuditoria(@PathVariable Long operadorId) {
        return ResponseEntity.ok(service.listarAuditoriaLogin(operadorId));
    }

    /* =======================
       Payloads
       ======================= */

    @Getter @Setter
    public static class PerfisPayload {
        private List<String> perfis;
    }
}
