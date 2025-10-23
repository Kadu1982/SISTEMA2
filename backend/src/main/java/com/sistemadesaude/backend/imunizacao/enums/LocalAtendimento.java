package com.sistemadesaude.backend.imunizacao.enums;

public enum LocalAtendimento {
    NENHUM("Nenhum"),
    UBS("UBS - Unidade Básica de Saúde"),
    USF("USF - Unidade de Saúde da Família"),
    ESCOLA("Escola"),
    DOMICILIO("Domicílio"),
    EMPRESA("Empresa"),
    OUTROS("Outros");

    private final String descricao;

    LocalAtendimento(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}