package com.sistemadesaude.backend.procedimentosrapidos.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para criação de avaliação Escala de Glasgow (Nível de Consciência)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaGlasgowRequestDTO {

    @NotNull(message = "ID do paciente é obrigatório")
    private Long pacienteId;

    @NotNull(message = "Abertura ocular é obrigatória")
    @Min(value = 1, message = "Abertura ocular deve estar entre 1 e 4")
    @Max(value = 4, message = "Abertura ocular deve estar entre 1 e 4")
    private Integer aberturaOcular;

    @NotNull(message = "Resposta verbal é obrigatória")
    @Min(value = 1, message = "Resposta verbal deve estar entre 1 e 5")
    @Max(value = 5, message = "Resposta verbal deve estar entre 1 e 5")
    private Integer respostaVerbal;

    @NotNull(message = "Resposta motora é obrigatória")
    @Min(value = 1, message = "Resposta motora deve estar entre 1 e 6")
    @Max(value = 6, message = "Resposta motora deve estar entre 1 e 6")
    private Integer respostaMotora;

    @NotNull(message = "ID do avaliador é obrigatório")
    private Long avaliadorId;

    private String observacoes;
}
