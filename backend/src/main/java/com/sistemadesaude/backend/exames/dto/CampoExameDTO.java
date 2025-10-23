package com.sistemadesaude.backend.exames.dto;

import com.sistemadesaude.backend.exames.entity.CampoExame;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampoExameDTO {
    private Long id;
    private Long exameId;
    private String nome;
    private String label;
    private CampoExame.TipoCampo tipoCampo;
    private Integer ordem;
    private Boolean obrigatorio;
    private Integer tamanhoMaximo;
    private String opcoesLista; // JSON
    private String valorPadrao;
    private String unidadeMedida;
    private Integer casasDecimais;
    private Double valorMinimo;
    private Double valorMaximo;
    private String mascara;
    private Boolean mostrarLaudo;
    private Boolean ativo;
}