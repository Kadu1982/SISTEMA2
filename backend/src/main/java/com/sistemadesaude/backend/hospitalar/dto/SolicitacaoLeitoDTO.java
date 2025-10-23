package com.sistemadesaude.backend.hospitalar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitacaoLeitoDTO {

    private Long id;

    @NotNull(message = "ID do paciente é obrigatório")
    private Long pacienteId;

    private Long atendimentoId;

    @NotNull(message = "ID do médico solicitante é obrigatório")
    private Long medicoSolicitanteId;

    @NotNull(message = "Tipo de acomodação solicitada é obrigatório")
    private String tipoAcomodacaoSolicitada;

    @Size(max = 100, message = "Especialidade solicitada não pode exceder 100 caracteres")
    private String especialidadeSolicitada;

    @Size(max = 100, message = "Unidade solicitada não pode exceder 100 caracteres")
    private String unidadeSolicitada;

    @NotNull(message = "Prioridade é obrigatória")
    private String prioridade;

    @NotBlank(message = "Motivo da internação é obrigatório")
    @Size(max = 500, message = "Motivo da internação não pode exceder 500 caracteres")
    private String motivoInternacao;

    @Size(max = 1000, message = "Observações clínicas não podem exceder 1000 caracteres")
    private String observacoesClinicas;

    private LocalDateTime dataSolicitacao;

    private LocalDateTime dataNecessidade;

    private String status;

    private Long leitoReservadoId;

    private LocalDateTime dataReserva;

    private Long responsavelReservaId;

    private LocalDateTime dataAtendimento;

    @Size(max = 255, message = "Motivo do cancelamento não pode exceder 255 caracteres")
    private String motivoCancelamento;

    @Size(max = 500, message = "Observações da central não podem exceder 500 caracteres")
    private String observacoesCentral;

    // Campos auxiliares para exibição
    private String nomePaciente;
    private String cpfPaciente;
    private String nomeMedicoSolicitante;
    private String numeroLeitoReservado;
    private String nomeResponsavelReserva;
    private String tipoAcomodacaoDescricao;
    private String prioridadeDescricao;
    private String statusDescricao;
    private String dataSolicitacaoFormatada;
    private String dataNecessidadeFormatada;
    private String dataReservaFormatada;
    private String dataAtendimentoFormatada;
    private String tempoEsperaFormatado;
    private String tempoAtendimentoFormatado;
}