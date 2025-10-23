package com.sistemadesaude.backend.estoque.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SaldoPorLoteDTO {
    private Long loteId;
    private Long insumoId;
    private String insumoDescricao;
    private String loteFabricante;
    private String codigoBarras;
    private LocalDate dataVencimento;
    private BigDecimal saldo;
}
