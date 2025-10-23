
package com.sistemadesaude.backend.upa.enums;

/**
 * Classificação de risco para triagem UPA (Manchester, etc.)
 */
public enum ClassificacaoRisco {
    AZUL("Azul - Não Urgente"),
    VERDE("Verde - Pouco Urgente"),
    AMARELO("Amarelo - Urgente"),
    LARANJA("Laranja - Muito Urgente"),
    VERMELHO("Vermelho - Emergência");

    private final String descricao;

    ClassificacaoRisco(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
