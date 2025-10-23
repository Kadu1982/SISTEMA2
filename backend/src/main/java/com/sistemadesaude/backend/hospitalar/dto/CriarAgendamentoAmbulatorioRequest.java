package com.sistemadesaude.backend.hospitalar.dto;

import com.sistemadesaude.backend.hospitalar.entity.AgendamentoAmbulatorio;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CriarAgendamentoAmbulatorioRequest {

    @NotNull(message = "ID do paciente é obrigatório")
    private Long pacienteId;

    @NotNull(message = "ID do profissional é obrigatório")
    private Long profissionalId;

    @NotNull(message = "ID da unidade é obrigatório")
    private Long unidadeId;

    @NotNull(message = "ID da especialidade é obrigatório")
    private Long especialidadeId;

    @NotNull(message = "Data do agendamento é obrigatória")
    private LocalDate dataAgendamento;

    @NotNull(message = "Hora do agendamento é obrigatória")
    private LocalTime horaAgendamento;

    private AgendamentoAmbulatorio.TipoConsulta tipoConsulta;
    private AgendamentoAmbulatorio.PrioridadeAgendamento prioridade;
    private String observacoes;
    private String motivoConsulta;
    private Boolean encaminhamentoInterno = false;
    private Long agendamentoOrigemId;
    private String numeroGuia;
    private Long convenioId;
    private Boolean retornoProgramado = false;
    private Integer diasRetorno;

    @NotNull(message = "ID do operador é obrigatório")
    private Long operadorCriacaoId;
}