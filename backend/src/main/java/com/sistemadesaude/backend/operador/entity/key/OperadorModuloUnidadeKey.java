package com.sistemadesaude.backend.operador.entity.key;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/**
 * Chave composta para a tabela operador_modulo_unidade (operador_id + modulo + unidade_id).
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class OperadorModuloUnidadeKey implements Serializable {
    private Long operadorId;
    private String modulo;
    private Long unidadeId;
}

