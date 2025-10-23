package com.sistemadesaude.backend.samu.enums;

/**
 * 📝 TIPOS DE EVENTOS NA OCORRÊNCIA SAMU
 */
public enum TipoEvento {
    ABERTURA_OCORRENCIA("Abertura da Ocorrência"),
    ENCAMINHAMENTO_REGULACAO("Encaminhamento para Regulação"),
    ADICAO_PACIENTE("Adição de Paciente"),
    ATUALIZACAO_LOCALIZACAO("Atualização de Localização"),
    ATRIBUICAO_VIATURA("Atribuição de Viatura"),
    CANCELAMENTO("Cancelamento"),
    ENCERRAMENTO("Encerramento"),

    // ✅ NOVOS EVENTOS PARA REGULAÇÃO MÉDICA
    INICIO_REGULACAO("Início da Regulação Médica"),
    REGULACAO_PACIENTE("Regulação de Paciente"),
    FINALIZACAO_REGULACAO("Finalização da Regulação");

    private final String descricao;

    TipoEvento(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
