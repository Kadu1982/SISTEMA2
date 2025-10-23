
package com.sistemadesaude.backend.triagem.entity;

public enum ClassificacaoRisco {
    VERMELHO("Emergência", 0, "#DC2626"),
    LARANJA("Muito Urgente", 10, "#EA580C"),
    AMARELO("Urgente", 60, "#D97706"),
    VERDE("Pouco Urgente", 120, "#16A34A"),
    AZUL("Não Urgente", 240, "#2563EB");

    private final String descricao;
    private final int tempoEsperaMinutos;
    private final String corHex;

    ClassificacaoRisco(String descricao, int tempoEsperaMinutos, String corHex) {
        this.descricao = descricao;
        this.tempoEsperaMinutos = tempoEsperaMinutos;
        this.corHex = corHex;
    }

    public String getDescricao() {
        return descricao;
    }

    public int getTempoEsperaMinutos() {
        return tempoEsperaMinutos;
    }

    public String getCorHex() {
        return corHex;
    }

    public int getPrioridade() {
        return switch (this) {
            case VERMELHO -> 1;
            case LARANJA -> 2;
            case AMARELO -> 3;
            case VERDE -> 4;
            case AZUL -> 5;
        };
    }

    public boolean isUrgente() {
        return this == VERMELHO || this == LARANJA;
    }

    public boolean isCritica() {
        return this == VERMELHO;
    }
}
