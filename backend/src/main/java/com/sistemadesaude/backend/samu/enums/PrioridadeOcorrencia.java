package com.sistemadesaude.backend.samu.enums;

public enum PrioridadeOcorrencia {
    EMERGENCIA("Emergência", "#FF0000", 1),
    URGENCIA("Urgência", "#FF8C00", 2),
    PRIORIDADE_ALTA("Prioridade Alta", "#FFD700", 3),
    PRIORIDADE_MEDIA("Prioridade Média", "#32CD32", 4),
    PRIORIDADE_BAIXA("Prioridade Baixa", "#87CEEB", 5);

    private final String descricao;
    private final String cor;
    private final int nivel;

    PrioridadeOcorrencia(String descricao, String cor, int nivel) {
        this.descricao = descricao;
        this.cor = cor;
        this.nivel = nivel;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getCor() {
        return cor;
    }

    public int getNivel() {
        return nivel;
    }
}
