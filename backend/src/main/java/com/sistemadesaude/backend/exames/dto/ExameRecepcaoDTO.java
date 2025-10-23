package com.sistemadesaude.backend.exames.dto;

import com.sistemadesaude.backend.exames.entity.ExameRecepcao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExameRecepcaoDTO {
    private Long id;
    private Long recepcaoId;
    private Long exameId;
    private String exameNome;
    private String exameCodigo;
    private Long motivoExameId;
    private String motivoExameDescricao;
    private Integer quantidade;
    private Integer sessaoNumero;
    private Boolean autorizado;
    private String numeroAutorizacao;
    private BigDecimal valorExame;
    private String observacoes;
    private ExameRecepcao.StatusExameRecepcao status;
}