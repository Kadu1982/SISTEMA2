package com.sistemadesaude.backend.procedimentosrapidos.dto;

import com.sistemadesaude.backend.procedimentosrapidos.enums.SituacaoAtividade;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutarAtividadeRequest {

    @NotNull(message = "A situação da atividade é obrigatória")
    private SituacaoAtividade situacao;

    private String profissional;
    private String observacoes;
}
