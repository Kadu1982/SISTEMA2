package com.sistemadesaude.backend.procedimentosrapidos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para requisição de assinatura digital
 * Usado no endpoint POST /api/procedimentos-rapidos/atividades/{id}/assinar
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssinaturaDigitalRequestDTO {

    /**
     * ID do operador que está assinando
     */
    @NotNull(message = "ID do operador é obrigatório")
    private Long operadorId;

    /**
     * Senha de login do operador (primeira validação)
     */
    @NotBlank(message = "Senha de login é obrigatória")
    private String senhaLogin;

    /**
     * Senha de assinatura do operador (segunda validação)
     */
    @NotBlank(message = "Senha de assinatura é obrigatória")
    private String senhaAssinatura;

    /**
     * IP do operador (para auditoria)
     */
    @NotBlank(message = "IP é obrigatório")
    private String ipAddress;

    /**
     * COREN do operador
     */
    @NotBlank(message = "COREN é obrigatório")
    private String coren;
}
