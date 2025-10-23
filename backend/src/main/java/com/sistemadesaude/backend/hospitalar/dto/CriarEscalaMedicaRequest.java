package com.sistemadesaude.backend.hospitalar.dto;

import com.sistemadesaude.backend.hospitalar.entity.EscalaMedica;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CriarEscalaMedicaRequest {

    @NotNull(message = "ID do profissional é obrigatório")
    private Long profissionalId;

    @NotNull(message = "ID da unidade é obrigatório")
    private Long unidadeId;

    @NotNull(message = "ID da especialidade é obrigatório")
    private Long especialidadeId;

    @NotNull(message = "Data da escala é obrigatória")
    private LocalDate dataEscala;

    @NotNull(message = "Hora de início é obrigatória")
    private LocalTime horaInicio;

    @NotNull(message = "Hora de fim é obrigatória")
    private LocalTime horaFim;

    @NotNull(message = "Intervalo da consulta em minutos é obrigatório")
    @Positive(message = "Intervalo deve ser positivo")
    private Integer intervaloConsultaMinutos;

    @NotNull(message = "Número de vagas é obrigatório")
    @Positive(message = "Número de vagas deve ser positivo")
    private Integer vagasDisponiveis;

    private EscalaMedica.TipoEscala tipoEscala;
    private Boolean permiteEncaixe = false;
    private Integer vagasEncaixe = 0;
    private String numeroSala;
    private String observacoes;

    @NotNull(message = "ID do operador é obrigatório")
    private Long operadorCriacaoId;
}