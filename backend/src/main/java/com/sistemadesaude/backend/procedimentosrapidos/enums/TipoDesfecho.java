package com.sistemadesaude.backend.procedimentosrapidos.enums;

public enum TipoDesfecho {
    LIBERAR_USUARIO("Liberar Usuário"),
    OBSERVACAO("Observação"),
    ENCAMINHAMENTO_INTERNO("Encaminhamento Interno"),
    REAVALIACAO("Reavaliação Médica");

    private final String descricao;

    TipoDesfecho(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
