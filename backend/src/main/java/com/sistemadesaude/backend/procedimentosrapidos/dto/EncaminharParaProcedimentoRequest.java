package com.sistemadesaude.backend.procedimentosrapidos.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Request para encaminhar paciente do Atendimento Ambulatorial para Procedimentos Rápidos
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EncaminharParaProcedimentoRequest {

    @NotNull(message = "O ID do atendimento é obrigatório")
    private Long atendimentoId;

    @NotNull(message = "O ID do paciente é obrigatório")
    private Long pacienteId;

    private String medicoSolicitante;
    private String especialidadeOrigem;
    private Long setorId;
    private String tipoDesfecho; // "ALTA_SE_MELHORA", "ALTA_APOS_MEDICACAO", "CUIDADOS_ENFERMAGEM"
    private String alergias;
    private String observacoes;

    @Builder.Default
    private List<AtividadeEnfermagemDTO> atividades = new ArrayList<>();
}
