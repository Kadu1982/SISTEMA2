package com.sistemadesaude.backend.procedimentosrapidos.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para criação de avaliação Escala de Fugulin (Carga de Trabalho)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaFugulinRequestDTO {

    @NotNull(message = "ID do paciente é obrigatório")
    private Long pacienteId;

    @NotNull(message = "Estado mental é obrigatório")
    @Min(value = 1, message = "Estado mental deve estar entre 1 e 4")
    @Max(value = 4, message = "Estado mental deve estar entre 1 e 4")
    private Integer estadoMental;

    @NotNull(message = "Oxigenação é obrigatória")
    @Min(value = 1, message = "Oxigenação deve estar entre 1 e 4")
    @Max(value = 4, message = "Oxigenação deve estar entre 1 e 4")
    private Integer oxigenacao;

    @NotNull(message = "Sinais vitais é obrigatório")
    @Min(value = 1, message = "Sinais vitais deve estar entre 1 e 4")
    @Max(value = 4, message = "Sinais vitais deve estar entre 1 e 4")
    private Integer sinaisVitais;

    @NotNull(message = "Motilidade é obrigatória")
    @Min(value = 1, message = "Motilidade deve estar entre 1 e 4")
    @Max(value = 4, message = "Motilidade deve estar entre 1 e 4")
    private Integer motilidade;

    @NotNull(message = "Deambulação é obrigatória")
    @Min(value = 1, message = "Deambulação deve estar entre 1 e 4")
    @Max(value = 4, message = "Deambulação deve estar entre 1 e 4")
    private Integer deambulacao;

    @NotNull(message = "Alimentação é obrigatória")
    @Min(value = 1, message = "Alimentação deve estar entre 1 e 4")
    @Max(value = 4, message = "Alimentação deve estar entre 1 e 4")
    private Integer alimentacao;

    @NotNull(message = "Cuidado corporal é obrigatório")
    @Min(value = 1, message = "Cuidado corporal deve estar entre 1 e 4")
    @Max(value = 4, message = "Cuidado corporal deve estar entre 1 e 4")
    private Integer cuidadoCorporal;

    @NotNull(message = "Eliminação é obrigatória")
    @Min(value = 1, message = "Eliminação deve estar entre 1 e 4")
    @Max(value = 4, message = "Eliminação deve estar entre 1 e 4")
    private Integer eliminacao;

    @NotNull(message = "Terapêutica é obrigatória")
    @Min(value = 1, message = "Terapêutica deve estar entre 1 e 5")
    @Max(value = 5, message = "Terapêutica deve estar entre 1 e 5")
    private Integer terapeutica;

    @NotNull(message = "ID do avaliador é obrigatório")
    private Long avaliadorId;

    private String observacoes;
}
