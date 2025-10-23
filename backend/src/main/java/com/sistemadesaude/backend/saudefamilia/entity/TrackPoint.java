package com.sistemadesaude.backend.saudefamilia.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sf_track_point")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "profissional_id", nullable = false)
    private Long profissionalId;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    private String origem = "MOBILE"; // MOBILE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visita_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private VisitaDomiciliar visita;
}
