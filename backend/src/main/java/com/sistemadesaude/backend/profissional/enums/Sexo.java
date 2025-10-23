package com.sistemadesaude.backend.profissional.enums;

/**
 * Enum simples para sexo biológico.
 * Mantemos enxuto para não conflitar com regras de identidade de gênero do paciente,
 * já que aqui é cadastro de profissional (regras do PDF).
 */
public enum Sexo {
    MASCULINO, FEMININO, OUTRO
}
