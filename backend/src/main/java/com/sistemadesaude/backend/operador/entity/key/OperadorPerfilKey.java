package com.sistemadesaude.backend.operador.entity.key;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/**
 * Chave composta da tabela operador_perfis.
 * É CRÍTICO declarar os nomes das colunas para evitar
 * conflito de "logical column name" do Hibernate.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class OperadorPerfilKey implements Serializable {

    /** Coluna física: operador_id */
    @Column(name = "operador_id", nullable = false)
    private Long operadorId;

    /** Coluna física: perfil */
    @Column(name = "perfil", nullable = false)
    private String perfil;
}
