package com.sistemadesaude.backend.hospitalar.dto;

import com.sistemadesaude.backend.hospitalar.entity.AgendamentoAmbulatorio;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgendamentoAmbulatorioDTO {

    private Long id;
    private Long pacienteId;
    private String nomePaciente;
    private String cpfPaciente;
    private Long profissionalId;
    private String nomeProfissional;
    private Long unidadeId;
    private String nomeUnidade;
    private Long especialidadeId;
    private String nomeEspecialidade;
    private LocalDate dataAgendamento;
    private LocalTime horaAgendamento;
    private AgendamentoAmbulatorio.TipoConsulta tipoConsulta;
    private AgendamentoAmbulatorio.StatusAgendamento statusAgendamento;
    private AgendamentoAmbulatorio.PrioridadeAgendamento prioridade;
    private String observacoes;
    private String motivoConsulta;
    private Boolean encaminhamentoInterno;
    private Long agendamentoOrigemId;
    private String numeroGuia;
    private Long convenioId;
    private String nomeConvenio;
    private Boolean retornoProgramado;
    private Integer diasRetorno;
    private LocalDateTime dataCriacao;
    private Long operadorCriacaoId;
    private String nomeOperadorCriacao;
    private LocalDateTime dataConfirmacao;
    private LocalDateTime dataChegada;
    private LocalDateTime dataChamada;
    private LocalDateTime dataInicioAtendimento;
    private LocalDateTime dataFimAtendimento;
    private Integer tempoEsperaMinutos;
    private Integer tempoAtendimentoMinutos;
    private String numeroSala;
    private String observacoesAtendimento;
}