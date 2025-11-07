package com.sistemadesaude.backend.unidadesaude.controller;

import com.sistemadesaude.backend.unidadesaude.dto.UnidadeSaudeDTO;
import com.sistemadesaude.backend.unidadesaude.service.UnidadeSaudeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/unidades")
public class UnidadeSaudeController {

    @Autowired
    private UnidadeSaudeService unidadeService;

    @GetMapping
    public ResponseEntity<?> listar() {
        try {
            List<UnidadeSaudeDTO> unidades = unidadeService.listarTodas();
            return ResponseEntity.ok(unidades);
        } catch (Exception e) {
            System.err.println("❌ Erro ao listar unidades: " + e.getMessage());
            System.err.println("Causa: " + (e.getCause() != null ? e.getCause().getMessage() : "N/A"));
            e.printStackTrace();
            
            // Retorna erro detalhado para debug
            String mensagem = e.getMessage() != null ? e.getMessage() : "Erro desconhecido ao listar unidades";
            if (e.getCause() != null && e.getCause().getMessage() != null) {
                mensagem += ". Causa: " + e.getCause().getMessage();
            }
            
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Erro ao listar unidades",
                "message", mensagem,
                "data", null
            ));
        }
    }

    @GetMapping("/{id}")
    public UnidadeSaudeDTO buscar(@PathVariable Long id) {
        return unidadeService.buscarPorId(id);
    }

    @PostMapping
    public UnidadeSaudeDTO criar(@RequestBody UnidadeSaudeDTO dto) {
        try {
            return unidadeService.criar(dto);
        } catch (Exception e) {
            // Log do erro para debug
            System.err.println("Erro ao criar unidade: " + e.getMessage());
            System.err.println("DTO recebido: " + dto);
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/{id}")
    public UnidadeSaudeDTO atualizar(@PathVariable Long id, @RequestBody UnidadeSaudeDTO dto) {
        return unidadeService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        unidadeService.deletar(id);
    }
}
