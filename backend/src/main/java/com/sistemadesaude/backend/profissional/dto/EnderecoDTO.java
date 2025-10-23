package com.sistemadesaude.backend.profissional.dto;

import lombok.*;

@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class EnderecoDTO {
    public String logradouro;
    public String numero;
    public String complemento;
    public String bairro;
    public String municipio;
    public String uf;
    public String cep;
}
