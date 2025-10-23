package com.sistemadesaude.backend.upa.enums;

/**
 * Status das ocorrências UPA
 */
public enum UpaStatus {
    ABERTO("Aberto"),
    EM_ATENDIMENTO("Em Atendimento"),
    ALTA("Alta"),
    ENCAMINHADO("Encaminhado");

    private final String descricao;

    UpaStatus(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
