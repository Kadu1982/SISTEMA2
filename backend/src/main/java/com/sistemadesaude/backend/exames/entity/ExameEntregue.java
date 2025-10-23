package com.sistemadesaude.backend.exames.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lab_exame_entregue")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExameEntregue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entrega_id", nullable = false)
    private EntregaExame entrega;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exame_recepcao_id", nullable = false)
    private ExameRecepcao exameRecepcao;

    @Column(name = "vias_impressas")
    @Builder.Default
    private Integer viasImpressas = 1;
}