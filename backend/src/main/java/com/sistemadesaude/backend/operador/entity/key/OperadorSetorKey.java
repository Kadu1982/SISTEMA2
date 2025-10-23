package com.sistemadesaude.backend.operador.entity.key;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/**
 * Chave composta para a tabela operador_setores (operador_id + setor_id).
 * Precisa ser Serializable e ter equals/hashCode estáveis.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class OperadorSetorKey implements Serializable {
    private Long operadorId;
    private Long setorId;
}
