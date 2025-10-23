package com.sistemadesaude.backend.profissional.dto;

import lombok.*;

@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class VinculoProfissionalUnidadeDTO {
    public Long id;
    public Long unidadeId;
    public String unidadeNome; // preenchido na leitura
    public String setor;
    public String cargo;
    public String funcao;
    public String empregadorCnpj;
    public String telefoneComercial;
    public String ramal;
    public String turno;
    public Boolean ativo;
}
