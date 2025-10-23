package com.sistemadesaude.backend.operador.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditoriaLoginDTO {
    private Long id;
    private Long operadorId;
    private OffsetDateTime dataHora;
    private String ip;
    private String userAgent;
    private Boolean sucesso;
    private String motivo;
}
