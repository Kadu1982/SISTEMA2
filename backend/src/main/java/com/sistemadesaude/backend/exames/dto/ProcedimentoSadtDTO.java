package com.sistemadesaude.backend.exames.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcedimentoSadtDTO {
    private Long id;
    private String codigo;
    private String nome;
    private Integer quantidade;
    private String cid10;
    private String justificativa;
    private String preparo;

    // ✅ CORREÇÃO: Mudança de Double para BigDecimal
    private BigDecimal valorSus;

    private Boolean autorizado;
    private Boolean executado;
}
