package com.sistemadesaude.backend.saudefamilia.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sf_condicao_saude_visita")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CondicaoSaudeVisita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visita_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private VisitaDomiciliar visita;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Tipo tipo;

    public enum Tipo {
        GESTANTE, HIPERTENSO, DIABETICO, HANSENIASE, TUBERCULOSE, DESNUTRICAO
    }
}
