package com.sistemadesaude.backend.operador.dto;

import lombok.Data;

import java.util.List;

/**
 * Payload simples para PUT /operadores/{id}/perfis
 */
@Data
public class PerfisPayload {
    private List<String> perfis;
}
