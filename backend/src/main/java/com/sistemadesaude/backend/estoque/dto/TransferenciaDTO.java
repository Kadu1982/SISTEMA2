package com.sistemadesaude.backend.estoque.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TransferenciaDTO {
    private Long unidadeOrigemId;
    private Long localOrigemId;
    private Long unidadeDestinoId;
    private Long localDestinoId;
    private String observacoes;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Item {
        private Long loteId;
        private BigDecimal quantidade;
    }
    private List<Item> itens;
}
