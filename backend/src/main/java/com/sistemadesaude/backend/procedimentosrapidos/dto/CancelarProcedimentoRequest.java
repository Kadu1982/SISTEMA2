package com.sistemadesaude.backend.procedimentosrapidos.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelarProcedimentoRequest {

    @NotBlank(message = "O motivo do cancelamento é obrigatório")
    private String motivo;
}
