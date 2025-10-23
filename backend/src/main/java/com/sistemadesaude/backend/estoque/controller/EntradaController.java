package com.sistemadesaude.backend.estoque.controller;

import com.sistemadesaude.backend.estoque.dto.EntradaDTO;
import com.sistemadesaude.backend.estoque.service.EntradaService;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estoque/entradas")
@RequiredArgsConstructor
public class EntradaController {
    private final EntradaService service;

    @PostMapping
    public ApiResponse<Long> criar(@RequestBody EntradaDTO dto) {
        return service.criar(dto);
    }
}
