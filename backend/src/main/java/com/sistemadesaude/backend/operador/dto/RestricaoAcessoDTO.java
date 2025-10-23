package com.sistemadesaude.backend.operador.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestricaoAcessoDTO {
    private Long id;
    private Long operadorId;
    private String tipo;       // IP, HOST, DATA, OUTRO
    private String valor;
    private String observacao;
    private Boolean ativo;
}
