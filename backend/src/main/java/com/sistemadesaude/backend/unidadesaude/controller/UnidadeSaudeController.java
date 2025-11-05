package com.sistemadesaude.backend.unidadesaude.controller;

import com.sistemadesaude.backend.unidadesaude.dto.UnidadeSaudeDTO;
import com.sistemadesaude.backend.unidadesaude.service.UnidadeSaudeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/unidades")
public class UnidadeSaudeController {

    @Autowired
    private UnidadeSaudeService unidadeService;

    @GetMapping
    public List<UnidadeSaudeDTO> listar() {
        return unidadeService.listarTodas();
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
            log.error("Erro ao criar unidade. DTO recebido: {}", dto, e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        unidadeService.deletar(id);
    }
}
