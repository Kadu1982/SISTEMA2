package com.sistemadesaude.backend.samu.enums;

public enum TipoOcorrencia {
    PRE_HOSPITALAR("Pré-hospitalar"),
    INTER_HOSPITALAR("Inter-hospitalar"),
    APOIO_TERRESTRE("Apoio Terrestre"),
    APOIO_AEREO("Apoio Aéreo");

    private final String descricao;

    TipoOcorrencia(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
