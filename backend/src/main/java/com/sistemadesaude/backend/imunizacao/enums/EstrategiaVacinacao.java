package com.sistemadesaude.backend.imunizacao.enums;

public enum EstrategiaVacinacao {
    ROTINA("Rotina"),
    CAMPANHA("Campanha"),
    BLOQUEIO("Bloqueio"),
    SURTO("Surto"),
    INTENSIFICACAO("Intensificação"),
    EVENTO_ADVERSO("Evento Adverso");

    private final String descricao;

    EstrategiaVacinacao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}