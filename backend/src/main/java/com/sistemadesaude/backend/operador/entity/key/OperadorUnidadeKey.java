package com.sistemadesaude.backend.operador.entity.key;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/**
 * Chave composta da tabela operador_unidade (operador_id + unidade_id).
 * Precisa implementar Serializable e ter equals/hashCode.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class OperadorUnidadeKey implements Serializable {
    private Long operadorId;
    private Long unidadeId;
}
