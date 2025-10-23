package com.sistemadesaude.backend.operador.dto;

import lombok.Data;
import java.util.List;

/**
 * Payload para PUT /api/operadores/{id}/setores
 * Exemplo JSON:
 * { "setorIds": [1, 2, 3] }
 */
@Data
public class SetoresPayload {
    /** IDs dos setores a vincular ao operador */
    private List<Long> setorIds;
}
