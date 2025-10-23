package com.sistemadesaude.backend.estoque.controller;

import com.sistemadesaude.backend.estoque.dto.AceiteTransferenciaDTO;
import com.sistemadesaude.backend.estoque.dto.TransferenciaDTO;
import com.sistemadesaude.backend.estoque.service.TransferenciaService;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estoque/transferencias")
@RequiredArgsConstructor
public class TransferenciaController {
    private final TransferenciaService service;

    @PostMapping
    public ApiResponse<Long> criar(@RequestBody TransferenciaDTO dto) {
        return service.criar(dto);
    }

    /** Equivale ao “aceite” na Verificação de Transferências. */
    @PostMapping("/{id}/aceitar")
    public ApiResponse<Long> aceitar(@PathVariable Long id, @RequestBody AceiteTransferenciaDTO dto) {
        dto.setTransferenciaId(id);
        return service.aceitar(dto);
    }
}
