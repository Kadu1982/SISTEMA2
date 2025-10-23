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
public class SolicitarLeitoRequest {

    @NotNull(message = "ID do paciente é obrigatório")
    private Long pacienteId;

    private Long atendimentoId;

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

    private LocalDateTime dataNecessidade;
}