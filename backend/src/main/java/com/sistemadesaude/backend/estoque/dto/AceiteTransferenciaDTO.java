package com.sistemadesaude.backend.estoque.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AceiteTransferenciaDTO {
    private Long transferenciaId;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Item {
        private Long transferenciaItemId;
        private BigDecimal quantidadeRecebida; // 0 -> cancela item
    }
    private List<Item> itens;
}
