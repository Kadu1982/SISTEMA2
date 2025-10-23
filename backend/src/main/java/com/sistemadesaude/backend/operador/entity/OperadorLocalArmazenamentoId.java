package com.sistemadesaude.backend.operador.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/**
 * Chave composta do vínculo Operador ↔ Local de Armazenamento.
 * Mapeia as colunas operador_id e local_id da tabela operador_locais_armazenamento.
 */
@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
public class OperadorLocalArmazenamentoId implements Serializable {
    private static final long serialVersionUID = 1L;

    /** ID do operador (coluna operador_id) */
    private Long operadorId;

    /** ID do local de armazenamento (coluna local_id) */
    private Long localId;
}
