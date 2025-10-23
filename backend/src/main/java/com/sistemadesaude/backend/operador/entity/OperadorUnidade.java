package com.sistemadesaude.backend.operador.entity;

import com.sistemadesaude.backend.operador.entity.key.OperadorUnidadeKey;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entidade minimalista para a tabela de junção operador_unidade.
 * Não usamos relacionamentos aqui para manter o acoplamento baixo.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "operador_unidade")
public class OperadorUnidade {

    @EmbeddedId
    private OperadorUnidadeKey id;
}
