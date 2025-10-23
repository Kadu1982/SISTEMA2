package com.sistemadesaude.backend.profissional.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

/**
 * Endereço do profissional (embutido/embeddable na entidade principal).
 */
@Embeddable
@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class EnderecoProfissional {
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String municipio;
    private String uf;
    private String cep;
}
