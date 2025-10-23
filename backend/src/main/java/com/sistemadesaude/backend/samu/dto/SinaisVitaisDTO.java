package com.sistemadesaude.backend.samu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SinaisVitaisDTO {

    private String pressaoArterial;
    private Integer frequenciaCardiaca;
    private Integer frequenciaRespiratoria;
    private Integer saturacaoOxigenio;
    private Double temperatura;
    private Integer escalaGlasgow;
}
