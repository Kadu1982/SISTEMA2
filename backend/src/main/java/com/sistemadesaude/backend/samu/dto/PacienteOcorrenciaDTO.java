
package com.sistemadesaude.backend.samu.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteOcorrenciaDTO {

    private Long id;
    private String nomeInformado;
    private String cpf;
    private LocalDate dataNascimento;
    private Integer idadeAnos;
    private Integer idadeMeses;
    private String sexo; // M, F, N

    // Informações clínicas
    private String queixaEspecifica;
    private String sintomas;
    private String alergias;
    private String medicamentosUso;
    private String historicoMedico;

    // Sinais vitais no local
    private String pressaoArterial;
    private Double temperatura;
    private Integer frequenciaCardiaca;
    private Integer saturacaoOxigenio;
    private String escalaDor;
    private String nivelConsciencia;

    // Status do paciente
    private String statusPaciente; // ESTAVEL, CRITICO, GRAVE, LEVE
    private String prioridadeEvacuacao;
    private Boolean necessitaUTI;
    private Boolean necessitaCircurgia;

    // Procedimentos realizados
    private String procedimentosRealizados;
    private String medicamentosAdministrados;
    private String equipamentosUtilizados;

    // Destino
    private String hospitalDestino;
    private String motivoEncaminhamento;
    private String observacoesTransporte;

    // Identificação familiar
    private String nomeResponsavel;
    private String telefoneResponsavel;
    private String parentesco;

    // Status na ocorrência
    private Boolean transportado;
    private Boolean recusouAtendimento;
    private Boolean obitoemLocal;
    private String motivoRecusa;
}
