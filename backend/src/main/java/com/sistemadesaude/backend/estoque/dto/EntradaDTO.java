package com.sistemadesaude.backend.estoque.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EntradaDTO {
    private Long localId;
    private Long operacaoId; // tipo=ENTRADA, com tipoEntrada preenchido
    private String observacao;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Item {
        private Long insumoId;
        private Long fabricanteId;      // opcional
        private String loteFabricante;  // obrigatório quando controle for por LOTE
        private String codigoBarras;    // 13 dígitos quando utilizado (manual)
        private LocalDate dataVencimento;
        private BigDecimal quantidade;
        private BigDecimal valorUnitario;
        private String localizacaoFisica;
    }
    private List<Item> itens;
}
