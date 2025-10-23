package com.sistemadesaude.backend.operador.dto;

import lombok.Data;
import java.util.List;

/**
 * Payload para PUT /api/operadores/{id}/unidades
 * Exemplo JSON:
 * { "unidadeIds": [10, 20, 30] }
 */
@Data
public class UnidadesPayload {
    /** IDs das unidades de saúde vinculadas ao operador */
    private List<Long> unidadeIds;
}
