package com.sistemadesaude.backend.estoque.dto;

import com.sistemadesaude.backend.estoque.enums.TipoSaida;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SaidaDTO {
    private Long localId;
    private Long operacaoId;   // tipo=SAIDA, com tipoSaida coerente
    private TipoSaida tipoSaida;
    private Long pacienteId;     // quando USUARIO
    private Long profissionalId; // quando PROFISSIONAL
    private String setorConsumo; // quando CONSUMO_PRÓPRIO/AJUSTE
    private String observacao;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Item {
        private Long loteId;            // saída sempre consome de um LOTE específico
        private BigDecimal quantidade;
    }
    private List<Item> itens;
}
