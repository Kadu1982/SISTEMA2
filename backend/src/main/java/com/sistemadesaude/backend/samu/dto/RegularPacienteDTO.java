package com.sistemadesaude.backend.samu.dto;

import com.sistemadesaude.backend.samu.enums.RiscoPresumido;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegularPacienteDTO {

    @NotBlank(message = "Hipótese diagnóstica é obrigatória")
    private String hipoteseDiagnostica;

    @NotNull(message = "Risco presumido é obrigatório")
    private RiscoPresumido riscoPresumido;

    private String quadroClinico;
    private String antecedentes;

    @Valid
    private SinaisVitaisDTO sinaisVitais;

    private Long unidadeDestinoId;
}
