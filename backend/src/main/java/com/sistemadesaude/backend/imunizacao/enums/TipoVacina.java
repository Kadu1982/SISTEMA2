package com.sistemadesaude.backend.imunizacao.enums;

public enum TipoVacina {
    CALENDARIO_INFANTIL("Calendário Infantil"),
    CALENDARIO_ADOLESCENTE("Calendário Adolescente"),
    CALENDARIO_ADULTO("Calendário Adulto"),
    CALENDARIO_IDOSO("Calendário Idoso"),
    CALENDARIO_GESTANTE("Calendário Gestante"),
    ESPECIAL("Vacina Especial"),
    COVID19("COVID-19"),
    CAMPANHA("Campanha Específica");

    private final String descricao;

    TipoVacina(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}