package com.sistemadesaude.backend.exames.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValorCampoResultadoDTO {
    private Long id;
    private Long resultadoId;
    private Long campoId;
    private String campoNome;
    private String campoLabel;
    private String valor;
    private Double valorNumerico;
    private String valorTexto;
    private Boolean alterado;
    private String unidadeMedida;
    private String valorReferenciaTexto;
}