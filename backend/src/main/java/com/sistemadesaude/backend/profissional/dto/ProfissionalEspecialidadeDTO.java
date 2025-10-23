package com.sistemadesaude.backend.profissional.dto;

import lombok.*;

@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class ProfissionalEspecialidadeDTO {
    public Long id;
    public String codigo;
    public String nome;
    public Boolean padrao;
}
