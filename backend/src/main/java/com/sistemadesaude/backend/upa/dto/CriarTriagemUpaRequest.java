package com.sistemadesaude.backend.upa.dto;

import lombok.*;

import java.time.LocalDate;

/**
 * Request para criar triagem UPA
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CriarTriagemUpaRequest {
    private Long ocorrenciaId; // ID da Upa
    private Long pacienteId;
    private String motivoConsulta;
    private String queixaPrincipal;
    private String observacoes;
    private String alergias;

    // Sinais vitais
    private String pressaoArterial;
    private Double temperatura;
    private Double peso;
    private Double altura;
    private Integer frequenciaCardiaca;
    private Integer frequenciaRespiratoria;
    private Integer saturacaoOxigenio;
    private Integer escalaDor;

    // Saúde da mulher
    private LocalDate dumInformada;
    private Boolean gestanteInformado;
    private Integer semanasGestacaoInformadas;
    private String classificacaoRisco;
}
