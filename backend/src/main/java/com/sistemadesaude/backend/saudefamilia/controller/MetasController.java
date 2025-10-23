package com.sistemadesaude.backend.saudefamilia.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saude-familia/metas")
@RequiredArgsConstructor
public class MetasController {

    // ✅ ENDPOINT DE TESTE
    @GetMapping("/test")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> test() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "MetasController funcionando!",
                "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }

    // Listar todas as metas
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> listarMetas() {
        return ResponseEntity.ok(Map.of(
                "metas", List.of(
                        Map.of(
                                "id", 1L,
                                "tipo", "FAMILIAS",
                                "descricao", "Meta de Famílias Cadastradas",
                                "valorMeta", 300,
                                "valorRealizado", 240,
                                "percentual", 80.0,
                                "status", "EM_ANDAMENTO"
                        ),
                        Map.of(
                                "id", 2L,
                                "tipo", "INTEGRANTES",
                                "descricao", "Meta de Integrantes Cadastrados",
                                "valorMeta", 900,
                                "valorRealizado", 720,
                                "percentual", 80.0,
                                "status", "EM_ANDAMENTO"
                        ),
                        Map.of(
                                "id", 3L,
                                "tipo", "ACOMPANHAMENTO",
                                "descricao", "Meta de Acompanhamentos Realizados",
                                "valorMeta", 120,
                                "valorRealizado", 95,
                                "percentual", 79.2,
                                "status", "EM_ANDAMENTO"
                        )
                ),
                "total", 3,
                "metasAtingidas", 0,
                "metasEmAndamento", 3,
                "percentualGeral", 79.7
        ));
    }

    // Buscar meta por ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of(
                "id", id,
                "tipo", "FAMILIAS",
                "descricao", "Meta de Famílias Cadastradas",
                "valorMeta", 300,
                "valorRealizado", 240,
                "percentual", 80.0,
                "status", "EM_ANDAMENTO",
                "detalhes", Map.of(
                        "dataInicio", "2025-01-01",
                        "dataFim", "2025-12-31",
                        "responsavel", "Coordenação ACS",
                        "observacoes", "Meta baseada no número de famílias da área"
                )
        ));
    }

    // Criar nova meta
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB')")
    public ResponseEntity<Map<String, Object>> criar(@RequestBody Map<String, Object> novaMeta) {
        Map<String, Object> metaCriada = Map.of(
                "id", 4L,
                "tipo", novaMeta.getOrDefault("tipo", "GERAL"),
                "descricao", novaMeta.getOrDefault("descricao", "Nova meta"),
                "valorMeta", novaMeta.getOrDefault("valorMeta", 0),
                "valorRealizado", 0,
                "percentual", 0.0,
                "status", "INICIADA"
        );
        return ResponseEntity.ok(metaCriada);
    }

    // Atualizar meta
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB')")
    public ResponseEntity<Map<String, Object>> atualizar(@PathVariable Long id, @RequestBody Map<String, Object> dadosAtualizacao) {
        Map<String, Object> metaAtualizada = Map.of(
                "id", id,
                "tipo", dadosAtualizacao.getOrDefault("tipo", "FAMILIAS"),
                "descricao", dadosAtualizacao.getOrDefault("descricao", "Meta atualizada"),
                "valorMeta", dadosAtualizacao.getOrDefault("valorMeta", 300),
                "valorRealizado", dadosAtualizacao.getOrDefault("valorRealizado", 250),
                "percentual", 83.3,
                "status", "EM_ANDAMENTO"
        );
        return ResponseEntity.ok(metaAtualizada);
    }

    // Excluir meta
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }

    // Relatório de metas por período
    @GetMapping("/relatorio")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR_SISTEMA','GESTOR_AB','ACS')")
    public ResponseEntity<Map<String, Object>> relatorio(@RequestParam(required = false) String dataInicio,
                                                         @RequestParam(required = false) String dataFim) {
        return ResponseEntity.ok(Map.of(
                "periodo", Map.of("inicio", dataInicio, "fim", dataFim),
                "resumo", Map.of(
                        "totalMetas", 3,
                        "metasAtingidas", 0,
                        "metasEmAndamento", 3,
                        "percentualGeralPeriodo", 79.7
                ),
                "detalhePorTipo", List.of(
                        Map.of("tipo", "FAMILIAS", "percentual", 80.0),
                        Map.of("tipo", "INTEGRANTES", "percentual", 80.0),
                        Map.of("tipo", "ACOMPANHAMENTO", "percentual", 79.2)
                )
        ));
    }
}
