package com.sistemadesaude.backend.samu.dto;

import com.sistemadesaude.backend.samu.enums.StatusViatura;
import com.sistemadesaude.backend.samu.enums.TipoViatura;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de Request para Criar/Atualizar Viatura
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViaturaRequestDTO {

    @NotBlank(message = "Identificação é obrigatória")
    private String identificacao;

    private String placa;

    @NotNull(message = "Tipo da viatura é obrigatório")
    private TipoViatura tipo;

    private StatusViatura status;

    @NotNull(message = "Base operacional é obrigatória")
    private Long baseId;

    private Integer kmAtual;
    private Double combustivelAtual;
    private String observacoes;
    private Boolean ativa;
}
