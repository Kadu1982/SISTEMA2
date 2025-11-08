package com.sistemadesaude.backend.procedimentosrapidos.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para criação de avaliação Escala de Morse (Risco de Quedas)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaMorseRequestDTO {

    @NotNull(message = "ID do paciente é obrigatório")
    private Long pacienteId;

    @NotNull(message = "Histórico de quedas é obrigatório")
    @Min(value = 0, message = "Histórico de quedas deve ser 0 ou 25")
    @Max(value = 25, message = "Histórico de quedas deve ser 0 ou 25")
    private Integer historicoQuedas;

    @NotNull(message = "Diagnóstico secundário é obrigatório")
    @Min(value = 0, message = "Diagnóstico secundário deve ser 0 ou 15")
    @Max(value = 15, message = "Diagnóstico secundário deve ser 0 ou 15")
    private Integer diagnosticoSecundario;

    @NotNull(message = "Auxílio de marcha é obrigatório")
    @Min(value = 0, message = "Auxílio de marcha deve ser 0, 15 ou 30")
    @Max(value = 30, message = "Auxílio de marcha deve ser 0, 15 ou 30")
    private Integer auxilioMarcha;

    @NotNull(message = "Terapia endovenosa é obrigatória")
    @Min(value = 0, message = "Terapia endovenosa deve ser 0 ou 20")
    @Max(value = 20, message = "Terapia endovenosa deve ser 0 ou 20")
    private Integer terapiaEndovenosa;

    @NotNull(message = "Marcha é obrigatória")
    @Min(value = 0, message = "Marcha deve ser 0, 10 ou 20")
    @Max(value = 20, message = "Marcha deve ser 0, 10 ou 20")
    private Integer marcha;

    @NotNull(message = "Estado mental é obrigatório")
    @Min(value = 0, message = "Estado mental deve ser 0 ou 15")
    @Max(value = 15, message = "Estado mental deve ser 0 ou 15")
    private Integer estadoMental;

    @NotNull(message = "ID do avaliador é obrigatório")
    private Long avaliadorId;

    private String observacoes;
}
