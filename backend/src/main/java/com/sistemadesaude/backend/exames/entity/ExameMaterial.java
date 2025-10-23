package com.sistemadesaude.backend.exames.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lab_exame_material")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExameMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exame_id", nullable = false)
    private Exame exame;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private MaterialExame material;

    @Column(name = "quantidade")
    @Builder.Default
    private Integer quantidade = 1;

    @Column(name = "obrigatorio")
    @Builder.Default
    private Boolean obrigatorio = true;

    @Column(name = "ordem")
    private Integer ordem;
}