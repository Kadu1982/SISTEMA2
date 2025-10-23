package com.sistemadesaude.backend.operador.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AceiteTermoRequest {
    private String versao;    // versão vigente do termo
    private String ip;
    private String userAgent;
}
