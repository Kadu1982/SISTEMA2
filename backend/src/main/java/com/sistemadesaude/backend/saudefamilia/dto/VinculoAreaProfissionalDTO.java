package com.sistemadesaude.backend.saudefamilia.dto;

import lombok.Data;

@Data
public class VinculoAreaProfissionalDTO {
    private Long id;
    private Long profissionalId;
    private String especialidade;
    private String situacao; // ATIVO/INATIVO
    private Boolean treinamentoIntrodutorio;
    private Boolean avaliacaoColetiva;
    private Boolean assistenciaMulher;
    private Boolean assistenciaCrianca;
    private Boolean capacitacaoPedagogica;
}
