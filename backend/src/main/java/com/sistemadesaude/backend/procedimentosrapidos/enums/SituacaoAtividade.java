package com.sistemadesaude.backend.procedimentosrapidos.enums;

public enum SituacaoAtividade {
    PENDENTE("Pendente"),
    EM_EXECUCAO("Em Execução"),
    EXECUTADO("Executado"),
    CANCELADO("Cancelado"),
    NAO_REALIZADO("Não Realizado");

    private final String descricao;

    SituacaoAtividade(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
