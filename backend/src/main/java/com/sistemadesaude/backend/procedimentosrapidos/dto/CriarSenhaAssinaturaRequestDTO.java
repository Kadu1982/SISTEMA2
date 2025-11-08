package com.sistemadesaude.backend.procedimentosrapidos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para criar/atualizar senha de assinatura
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriarSenhaAssinaturaRequestDTO {

    @NotNull(message = "ID do operador é obrigatório")
    private Long operadorId;

    @NotBlank(message = "Senha de assinatura é obrigatória")
    @Size(min = 6, message = "Senha de assinatura deve ter no mínimo 6 caracteres")
    private String senhaAssinatura;

    @NotBlank(message = "COREN é obrigatório")
    private String coren;
}
