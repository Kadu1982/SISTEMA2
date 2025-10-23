package com.sistemadesaude.backend.samu.enums;

public enum StatusOcorrencia {
    ABERTA("Aberta"),
    AGUARDANDO_REGULACAO("Aguardando Regulação"),
    EM_REGULACAO("Em Regulação"),
    REGULADA("Regulada"),
    DESPACHADA("Despachada"),
    EM_ATENDIMENTO("Em Atendimento"),
    TRANSPORTANDO("Transportando"),
    FINALIZADA("Finalizada"),
    CANCELADA("Cancelada");

    private final String descricao;

    StatusOcorrencia(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
