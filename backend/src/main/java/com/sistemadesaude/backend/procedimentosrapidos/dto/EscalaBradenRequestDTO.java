package com.sistemadesaude.backend.procedimentosrapidos.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para criação de avaliação Escala de Braden (Risco de Lesão por Pressão)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaBradenRequestDTO {

    @NotNull(message = "ID do paciente é obrigatório")
    private Long pacienteId;

    @NotNull(message = "Percepção sensorial é obrigatória")
    @Min(value = 1, message = "Percepção sensorial deve estar entre 1 e 4")
    @Max(value = 4, message = "Percepção sensorial deve estar entre 1 e 4")
    private Integer percepcaoSensorial;

    @NotNull(message = "Umidade é obrigatória")
    @Min(value = 1, message = "Umidade deve estar entre 1 e 4")
    @Max(value = 4, message = "Umidade deve estar entre 1 e 4")
    private Integer umidade;

    @NotNull(message = "Atividade é obrigatória")
    @Min(value = 1, message = "Atividade deve estar entre 1 e 4")
    @Max(value = 4, message = "Atividade deve estar entre 1 e 4")
    private Integer atividade;

    @NotNull(message = "Mobilidade é obrigatória")
    @Min(value = 1, message = "Mobilidade deve estar entre 1 e 4")
    @Max(value = 4, message = "Mobilidade deve estar entre 1 e 4")
    private Integer mobilidade;

    @NotNull(message = "Nutrição é obrigatória")
    @Min(value = 1, message = "Nutrição deve estar entre 1 e 4")
    @Max(value = 4, message = "Nutrição deve estar entre 1 e 4")
    private Integer nutricao;

    @NotNull(message = "Fricção e cisalhamento é obrigatório")
    @Min(value = 1, message = "Fricção e cisalhamento deve estar entre 1 e 3")
    @Max(value = 3, message = "Fricção e cisalhamento deve estar entre 1 e 3")
    private Integer friccaoCisalhamento;

    @NotNull(message = "ID do avaliador é obrigatório")
    private Long avaliadorId;

    private String observacoes;
}
