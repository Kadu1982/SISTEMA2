package com.sistemadesaude.backend.operador.entity;

import com.sistemadesaude.backend.operador.entity.key.OperadorPerfilKey;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entidade de junção operador <-> perfil (tabela operador_perfis).
 * Mantemos minimalista para baixo acoplamento.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "operador_perfis")
public class OperadorPerfil {

    @EmbeddedId
    private OperadorPerfilKey id;
}
