package com.sistemadesaude.backend.operador.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TermoUsoDTO {
    private Long id;
    private Long operadorId;
    private String versao;
    private OffsetDateTime aceitoEm;
    private String ip;
    private String userAgent;
}
