package com.sistemadesaude.backend.triagem.entity;

/**
 * Enum para representar os motivos de consulta na triagem
 */
public enum MotivoConsulta {
    CONSULTA("Consulta"),
    RETORNO("Retorno"),
    PRE_NATAL("Pré Natal"),
    ACOLHIMENTO("Acolhimento"),
    PAPANICOLAU("Papanicolau"),
    PUERPERIO("Puerpério");

    private final String descricao;

    MotivoConsulta(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }

    @Override
    public String toString() {
        return descricao;
    }
}
