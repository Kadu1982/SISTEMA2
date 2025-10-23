package com.sistemadesaude.backend.estoque.controller;

import com.sistemadesaude.backend.estoque.dto.CentroCustoDTO;
import com.sistemadesaude.backend.estoque.dto.CentroCustoRequest;
import com.sistemadesaude.backend.estoque.service.CentroCustoCrudService;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CRUD de Centros de Custo (alias de LocalArmazenamento)
 *
 * Rotas preferenciais:  /api/estoque/centros-custos[/:id]
 * Rotas legadas:        /api/estoque/locais[/:id]
 *
 * ⚠️ Se você já tiver outro controller mapeando /estoque/locais com os MESMOS verbos,
 *    deixe apenas um deles ativo para evitar conflito de mapeamento.
 */
@RestController
@RequestMapping("/api/estoque")
@RequiredArgsConstructor
public class CentroCustoController {

    private final CentroCustoCrudService service;

    @GetMapping({"/centros-custos", "/locais"})
    public ApiResponse<List<CentroCustoDTO>> listar() {
        return new ApiResponse<>(true, "OK", service.listar());
    }

    @GetMapping({"/centros-custos/{id}", "/locais/{id}"})
    public ApiResponse<CentroCustoDTO> obter(@PathVariable Long id) {
        return new ApiResponse<>(true, "OK", service.obter(id));
    }

    @PostMapping({"/centros-custos", "/locais"})
    public ApiResponse<CentroCustoDTO> criar(@RequestBody CentroCustoRequest request) {
        return new ApiResponse<>(true, "Criado", service.criar(request));
    }

    @PutMapping({"/centros-custos/{id}", "/locais/{id}"})
    public ApiResponse<CentroCustoDTO> atualizarPut(@PathVariable Long id, @RequestBody CentroCustoRequest request) {
        return new ApiResponse<>(true, "Atualizado", service.putAtualizar(id, request));
    }

    @PatchMapping({"/centros-custos/{id}", "/locais/{id}"})
    public ApiResponse<CentroCustoDTO> atualizarPatch(@PathVariable Long id, @RequestBody CentroCustoRequest request) {
        return new ApiResponse<>(true, "Atualizado", service.patchAtualizar(id, request));
    }
}
