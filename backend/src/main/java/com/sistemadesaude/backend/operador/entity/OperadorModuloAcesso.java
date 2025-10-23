package com.sistemadesaude.backend.operador.entity;

import com.sistemadesaude.backend.operador.entity.key.OperadorModuloKey;
import jakarta.persistence.*;
import lombok.*;

/**
 * Overrides de módulos no nível do Operador (exceções além do Perfil)
 * Tabela: operador_modulos_acesso
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "operador_modulos_acesso")
public class OperadorModuloAcesso {

    @EmbeddedId
    private OperadorModuloKey id;
}
