package com.sistemadesaude.backend.profissional.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Especialidade do profissional. Por simplicidade, usamos um code/name.
 * Futuro: integrar com CBO/SIGTAP e/ou tabela própria de Especialidade.
 */
@Entity
@Table(name = "profissional_especialidades")
@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class ProfissionalEspecialidade {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 30)
    private String codigo;  // ex.: código CBO ou código interno

    @Column(length = 180)
    private String nome;    // rótulo exibido

    private Boolean padrao; // "especialidade padrão" (uma ou zero)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profissional_id", nullable = false)
    private Profissional profissional;
}
