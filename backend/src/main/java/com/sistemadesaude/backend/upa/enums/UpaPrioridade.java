package com.sistemadesaude.backend.upa.enums;

/**
 * Prioridades do atendimento UPA
 */
public enum UpaPrioridade {
    BAIXA("Baixa"),
    MEDIA("Média"),
    ALTA("Alta"),
    URGENTE("Urgente");

    private final String descricao;

    UpaPrioridade(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
