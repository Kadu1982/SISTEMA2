package com.sistemadesaude.backend.triagem.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sistemadesaude.backend.triagem.entity.ClassificacaoRisco;
import com.sistemadesaude.backend.triagem.entity.MotivoConsulta;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CriarTriagemRequestDTO {

    @NotNull(message = "ID do agendamento é obrigatório")
    @Min(value = 1, message = "ID do agendamento deve ser maior que zero")
    private Long agendamentoId;

    @NotBlank(message = "Queixa principal é obrigatória")
    private String queixaPrincipal;

    @NotNull(message = "Motivo da consulta é obrigatório")
    private MotivoConsulta motivoConsulta;

    // Classificação (obrigatória apenas no fluxo UPA)
    private ClassificacaoRisco classificacaoRisco;

    // 📌 NOVO: Data de referência do acolhimento (formato yyyy-MM-dd)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataReferencia;

    // Sinais vitais
    private String pressaoArterial;

    @Min(value = 30, message = "Temperatura mínima válida é 30ºC")
    @Max(value = 45, message = "Temperatura máxima válida é 45ºC")
    private Double temperatura;

    @Min(value = 0, message = "Peso deve ser positivo")
    private Double peso;

    @Min(value = 0, message = "Altura deve ser positiva")
    private Double altura;

    @Min(1) private Integer frequenciaCardiaca;
    @Min(1) private Integer frequenciaRespiratoria;

    @Min(0) @Max(10)
    private Integer escalaDor;

    @Min(70) @Max(100)
    private Integer saturacaoOxigenio;

    // Saúde da mulher
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dumInformada;

    private Boolean gestanteInformado;
    private Integer semanasGestacaoInformadas;

    // Observações gerais
    @Size(max = 2000)
    private String observacoes;

    @Size(max = 1000)
    private String alergias;

    // Flag para UPA
    private Boolean isUpaTriagem = false;
}
