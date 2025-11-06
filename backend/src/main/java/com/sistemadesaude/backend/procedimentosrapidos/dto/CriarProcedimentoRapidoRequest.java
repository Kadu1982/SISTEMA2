package com.sistemadesaude.backend.procedimentosrapidos.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriarProcedimentoRapidoRequest {

    @NotNull(message = "O ID do paciente é obrigatório")
    private Long pacienteId;

    private String origemEncaminhamento;
    private Long atendimentoMedicoOrigemId;
    private String medicoSolicitante;
    private String especialidadeOrigem;
    private String alergias;
    private String observacoesGerais;

    @Builder.Default
    private List<AtividadeEnfermagemDTO> atividades = new ArrayList<>();
}
