package com.sistemadesaude.backend.recepcao.dto;

import com.sistemadesaude.backend.recepcao.entity.HorarioExame;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HorarioExameDTO {
    private Long id;
    private Long profissionalId;
    private String profissionalNome;
    private Long salaId;
    private String salaNome;
    private Long unidadeId;
    private String unidadeNome;
    private String exameCodigo;
    private String exameNome;
    private HorarioExame.TipoAgendamentoExame tipoAgendamento;
    private DayOfWeek diaSemana;
    private String diaSemanaTexto;
    private LocalTime horaInicio;
    private LocalTime horaFim;
    private Integer intervaloMinutos;
    private Integer vagasPorHorario;
    private Boolean permiteEncaixe;
    private Boolean ativo;
    private String observacoes;
    private Integer quantidadeSlots;
    private Integer vagasTotais;
}