package com.sistemadesaude.backend.procedimentosrapidos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO completo para AssinaturaDigital
 * Usado para listagem e consulta
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssinaturaDigitalDTO {

    private Long id;
    private Long operadorId;
    private LocalDateTime dataHoraAssinatura;
    private String ipAddress;
    private Long atividadeEnfermagemId;
    private String corenOperador;
    private LocalDateTime dataCriacao;
}
