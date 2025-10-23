package com.sistemadesaude.backend.estoque.controller;

import com.sistemadesaude.backend.estoque.dto.SaidaDTO;
import com.sistemadesaude.backend.estoque.service.SaidaService;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estoque/saidas")
@RequiredArgsConstructor
public class SaidaController {
    private final SaidaService service;

    @PostMapping
    public ApiResponse<Long> criar(@RequestBody SaidaDTO dto) {
        return service.criar(dto);
    }
}
