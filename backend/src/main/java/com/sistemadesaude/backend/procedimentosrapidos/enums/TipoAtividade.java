package com.sistemadesaude.backend.procedimentosrapidos.enums;

public enum TipoAtividade {
    VACINAS("Vacinas"),
    PROCEDIMENTOS("Procedimentos");

    private final String descricao;

    TipoAtividade(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
