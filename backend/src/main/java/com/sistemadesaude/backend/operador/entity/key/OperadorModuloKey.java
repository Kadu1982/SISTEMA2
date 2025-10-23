package com.sistemadesaude.backend.operador.entity.key;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/**
 * Chave composta para a tabela operador_modulos_acesso (operador_id + modulo).
 * Precisa ser Serializable e ter equals/hashCode estáveis.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class OperadorModuloKey implements Serializable {
    private Long operadorId;
    private String modulo;
}
