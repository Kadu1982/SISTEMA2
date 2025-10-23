package com.sistemadesaude.backend.operador.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistemadesaude.backend.operador.entity.OperadorRestricoesJson;
import com.sistemadesaude.backend.operador.repository.OperadorRestricoesJsonRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger; import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Endpoints da aba "RESTRICOES" (estrutura livre em JSON por operador).
 *
 * GET  /api/operadores/{operadorId}/restricoes  → retorna JSON atual (ou {})
 * PUT  /api/operadores/{operadorId}/restricoes  → grava JSON (substitui por completo)
 *
 * Segurança:
 * - Validate JSON: se o corpo não for JSON válido, retorna 400.
 * - Não impõe schema aqui (fase 1). Regras específicas serão validadas em serviços downstream.
 */
@RestController
@RequestMapping("/api/operadores/{operadorId}")
@RequiredArgsConstructor
public class OperadorRestricoesController {

    private static final Logger log = LoggerFactory.getLogger(OperadorRestricoesController.class);

    private final OperadorRestricoesJsonRepository repo;
    private final ObjectMapper om;

    @GetMapping("/restricoes")
    public ResponseEntity<JsonNode> obter(@PathVariable Long operadorId) {
        var ent = repo.findById(operadorId).orElse(null);
        if (ent == null || ent.getConteudoJson() == null || ent.getConteudoJson().isBlank()) {
            // Retorna {} quando não houver registro
            return ResponseEntity.ok(om.createObjectNode());
        }
        try {
            return ResponseEntity.ok(om.readTree(ent.getConteudoJson()));
        } catch (Exception e) {
            // Em caso de dado antigo inválido, retornamos {} para não quebrar a UI
            log.warn("Conteúdo JSON inválido em operador_restricoes_json.operador_id={}: {}", operadorId, e.getMessage());
            return ResponseEntity.ok(om.createObjectNode());
        }
    }

    @PutMapping("/restricoes")
    @Transactional
    public ResponseEntity<Void> salvar(@PathVariable Long operadorId, @RequestBody JsonNode json) {
        // 1) valida se é JSON válido (Jackson já garantiu por deserialização)
        //    Apenas garantimos que não é null:
        if (json == null) {
            return ResponseEntity.badRequest().build();
        }

        // 2) serializa bonito
        final String pretty;
        try {
            pretty = om.writerWithDefaultPrettyPrinter().writeValueAsString(json);
        } catch (JsonProcessingException e) {
            return ResponseEntity.badRequest().build();
        }

        // 3) upsert no registro do operador
        var ent = repo.findById(operadorId).orElseGet(() ->
                OperadorRestricoesJson.builder().operadorId(operadorId).build()
        );
        ent.setConteudoJson(pretty);
        ent.setUpdatedAt(LocalDateTime.now());
        repo.save(ent);

        log.info("Operador {}: restrições JSON atualizadas ({} bytes).", operadorId, pretty.length());
        return ResponseEntity.noContent().build();
    }
}
