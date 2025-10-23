package com.sistemadesaude.backend.estoque.controller;

import com.sistemadesaude.backend.estoque.dto.CentroCustoDTO;
import com.sistemadesaude.backend.estoque.dto.InsumoDTO;
import com.sistemadesaude.backend.estoque.dto.LocalArmazenamentoDTO;
import com.sistemadesaude.backend.estoque.entity.Fabricante;
import com.sistemadesaude.backend.estoque.entity.Operacao;
import com.sistemadesaude.backend.estoque.enums.TipoOperacao;
import com.sistemadesaude.backend.estoque.service.CatalogoEstoqueService;
import com.sistemadesaude.backend.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Catálogo de apoio ao módulo de Estoque.
 * Fornece endpoints de listagem (locais/centros de custo, insumos, fabricantes e operações).
 *
 * NOTA: Mantemos os endpoints originais com o termo "locais" para compatibilidade
 *       e adicionamos os aliases "centros-custos" conforme a nomenclatura definida pelo usuário.
 */
@RestController
@RequestMapping("/api/estoque")
@RequiredArgsConstructor
public class CatalogoEstoqueController {

    private final CatalogoEstoqueService service;

    // --------- Locais / Centros de Custo ---------

    /** Compatibilidade com frontend atual: /estoque/locais */
    @GetMapping("/locais")
    public ApiResponse<List<LocalArmazenamentoDTO>> listarLocais() {
        return new ApiResponse<>(true, "OK", service.listarLocais());
    }

    /** Nova nomenclatura: /estoque/centros-custos */
    @GetMapping("/centros-custos")
    public ApiResponse<List<CentroCustoDTO>> listarCentrosCusto() {
        return new ApiResponse<>(true, "OK", service.listarCentrosCusto());
    }

    // --------- Insumos / Fabricantes ---------

    @GetMapping("/insumos")
    public ApiResponse<List<InsumoDTO>> listarInsumos() {
        return new ApiResponse<>(true, "OK", service.listarInsumos());
    }

    @GetMapping("/fabricantes")
    public ApiResponse<List<Fabricante>> listarFabricantes() {
        return new ApiResponse<>(true, "OK", service.listarFabricantes());
    }

    // --------- Operações ---------

    @GetMapping("/operacoes")
    public ApiResponse<List<Operacao>> listarOperacoes(@RequestParam(name = "tipo", required = false) TipoOperacao tipo) {
        return new ApiResponse<>(true, "OK", service.listarOperacoes(tipo));
    }
}
