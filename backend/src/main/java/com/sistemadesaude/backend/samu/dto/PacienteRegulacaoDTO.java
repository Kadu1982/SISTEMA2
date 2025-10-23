
package com.sistemadesaude.backend.samu.dto;

import com.sistemadesaude.backend.samu.enums.RiscoPresumido;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteRegulacaoDTO {

    private Long id;
    private String nomeInformado;
    private Integer idadeAnos;
    private Integer idadeMeses;
    private String sexo;
    private String queixaEspecifica;

    // Dados clínicos para regulação
    private String hipoteseDiagnostica;
    private RiscoPresumido riscoPresumido;
    private String quadroClinico;
    private String antecedentes;

    // Sinais vitais
    private String pressaoArterial;
    private Integer frequenciaCardiaca;
    private Integer frequenciaRespiratoria;
    private Integer saturacaoOxigenio;
    private Double temperatura;
    private Integer escalaGlasgow;

    // Unidade de destino
    private Long unidadeDestinoId;
    private String unidadeDestinoNome;

    private Boolean foiRegulado;
}
