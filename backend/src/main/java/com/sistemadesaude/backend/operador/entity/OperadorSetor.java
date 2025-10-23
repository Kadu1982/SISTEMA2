package com.sistemadesaude.backend.operador.entity;

import com.sistemadesaude.backend.operador.entity.key.OperadorSetorKey;
import jakarta.persistence.*;
import lombok.*;

/**
 * Junção Operador x Setores
 * Tabela: operador_setores
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "operador_setores")
public class OperadorSetor {

    @EmbeddedId
    private OperadorSetorKey id;
}
