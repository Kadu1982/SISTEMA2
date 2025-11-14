package com.sistemadesaude.backend.operador.entity;

import com.sistemadesaude.backend.operador.entity.key.OperadorModuloUnidadeKey;
import jakarta.persistence.*;
import lombok.*;

/**
 * Vincula módulos do operador a unidades específicas.
 * Se um módulo não tiver unidades vinculadas, aparece em todas as unidades do operador.
 * Tabela: operador_modulo_unidade
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "operador_modulo_unidade")
public class OperadorModuloUnidade {

    @EmbeddedId
    private OperadorModuloUnidadeKey id;
}

