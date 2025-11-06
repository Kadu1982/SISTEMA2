package com.sistemadesaude.backend.procedimentosrapidos.enums;

public enum StatusProcedimento {
    AGUARDANDO("Aguardando"),
    EM_ATENDIMENTO("Em Atendimento"),
    FINALIZADO("Finalizado"),
    CANCELADO("Cancelado");

    private final String descricao;

    StatusProcedimento(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
