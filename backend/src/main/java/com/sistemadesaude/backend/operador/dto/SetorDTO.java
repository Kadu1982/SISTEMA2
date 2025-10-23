package com.sistemadesaude.backend.operador.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SetorDTO {
    private Long id;
    private String nome;
    private Boolean ativo;
}
