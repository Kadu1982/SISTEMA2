package com.sistemadesaude.backend.operador.dto;

import lombok.Data;
import java.util.List;

/**
 * Payload para PUT /api/operadores/{id}/modulos
 * Exemplo JSON:
 * { "modulos": ["FARMACIA", "LABORATORIO"] }
 */
@Data
public class ModulosPayload {
    /** Códigos/nomes de módulos para override do operador */
    private List<String> modulos;
}
