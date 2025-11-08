package com.sistemadesaude.backend.procedimentosrapidos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para resposta de assinatura digital
 * Retornado após assinatura bem-sucedida
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssinaturaDigitalResponseDTO {

    /**
     * ID da assinatura criada
     */
    private Long id;

    /**
     * ID do operador que assinou
     */
    private Long operadorId;

    /**
     * Nome do operador
     */
    private String nomeOperador;

    /**
     * COREN do operador
     */
    private String coren;

    /**
     * Timestamp da assinatura
     */
    private LocalDateTime timestamp;

    /**
     * IP do operador
     */
    private String ipAddress;

    /**
     * ID da atividade assinada
     */
    private Long atividadeId;

    /**
     * Indica se a assinatura foi bem-sucedida
     */
    private boolean sucesso;

    /**
     * Mensagem de retorno
     */
    private String mensagem;
}
