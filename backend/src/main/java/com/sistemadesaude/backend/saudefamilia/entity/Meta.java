package com.sistemadesaude.backend.saudefamilia.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sf_meta")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 6)
    private String competencia; // YYYYMM

    @Column(nullable = false, length = 30)
    private String tipo; // FAMILIAS|INTEGRANTES|ACOMPANHAMENTO

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Area area;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "microarea_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Microarea microarea;

    @Column(name = "valor_meta", nullable = false)
    private Integer valorMeta;
}
