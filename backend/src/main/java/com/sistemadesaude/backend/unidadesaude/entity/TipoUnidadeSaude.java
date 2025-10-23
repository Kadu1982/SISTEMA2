
package com.sistemadesaude.backend.unidadesaude.entity;

import lombok.Getter;

/**
 * Enum que define os tipos de unidades de saúde
 */
@Getter
public enum TipoUnidadeSaude {

    GENERICA("Genérica", "GEN"),
    UBS("Unidade Básica de Saúde", "UBS"),
    UPA("Unidade de Pronto Atendimento", "UPA"),
    HOSPITAL("Hospital", "HOSP"),
    CLINICA("Clínica", "CLIN"),
    LABORATORIO("Laboratório", "LAB"),
    FARMACIA("Farmácia", "FARM"),
    CENTRO_ESPECIALIDADES("Centro de Especialidades", "CE"),
    SAMU("Serviço de Atendimento Móvel de Urgência", "SAMU"),
    CAPS("Centro de Atenção Psicossocial", "CAPS"),
    POLICLINICA("Policlínica", "POLIC"),
    MATERNIDADE("Maternidade", "MAT"),
    PRONTO_SOCORRO("Pronto Socorro", "PS");

    private final String descricao;
    private final String codigo;

    TipoUnidadeSaude(String descricao, String codigo) {
        this.descricao = descricao;
        this.codigo = codigo;
    }

    /**
     * Busca tipo por código
     */
    public static TipoUnidadeSaude fromCodigo(String codigo) {
        for (TipoUnidadeSaude tipo : values()) {
            if (tipo.codigo.equals(codigo)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Tipo de unidade não encontrado: " + codigo);
    }

    /**
     * Verifica se é unidade de urgência/emergência
     */
    public boolean isUrgenciaEmergencia() {
        return this == UPA || this == HOSPITAL || this == PRONTO_SOCORRO || this == SAMU;
    }

    /**
     * Verifica se é atenção primária
     */
    public boolean isAtencaoPrimaria() {
        return this == UBS || this == CLINICA;
    }
}
