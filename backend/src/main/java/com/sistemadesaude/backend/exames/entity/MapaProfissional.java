package com.sistemadesaude.backend.exames.entity;

import com.sistemadesaude.backend.profissional.entity.Profissional;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lab_mapa_profissional")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MapaProfissional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mapa_id", nullable = false)
    private MapaLaboratorio mapa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profissional_id", nullable = false)
    private Profissional profissional;

    @Column(name = "ordem")
    private Integer ordem;

    @Column(name = "responsavel")
    @Builder.Default
    private Boolean responsavel = false;
}