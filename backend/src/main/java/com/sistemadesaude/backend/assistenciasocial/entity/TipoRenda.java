package com.sistemadesaude.backend.assistenciasocial.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Classe entidade que representa os tipos de renda.
 */
@Entity
@Table(name = "tipos_renda")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoRenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "ativo")
    private Boolean ativo = true;
}
