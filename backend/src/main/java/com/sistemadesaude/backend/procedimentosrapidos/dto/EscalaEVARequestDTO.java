package com.sistemadesaude.backend.procedimentosrapidos.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para criação de avaliação Escala EVA (Dor)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaEVARequestDTO {

    @NotNull(message = "ID do paciente é obrigatório")
    private Long pacienteId;

    @NotNull(message = "Pontuação da dor é obrigatória")
    @Min(value = 0, message = "Pontuação da dor deve estar entre 0 e 10")
    @Max(value = 10, message = "Pontuação da dor deve estar entre 0 e 10")
    private Integer pontuacaoDor;

    private String localizacaoDor;

    private String caracteristicasDor;

    private String fatoresPiora;

    private String fatoresMelhora;

    @NotNull(message = "ID do avaliador é obrigatório")
    private Long avaliadorId;

    private String observacoes;
}
