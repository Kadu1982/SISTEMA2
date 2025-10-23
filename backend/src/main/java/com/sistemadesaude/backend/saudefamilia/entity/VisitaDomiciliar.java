package com.sistemadesaude.backend.saudefamilia.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sf_visita_domiciliar")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitaDomiciliar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Area area;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "microarea_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Microarea microarea;

    @Column(name = "profissional_id", nullable = false)
    private Long profissionalId;

    @Column(name = "domicilio_id")
    private Long domicilioId;

    @Column(name = "familia_id")
    private Long familiaId;

    @Enumerated(EnumType.STRING)
    @Column(name = "motivo", nullable = false, length = 50)
    private MotivoVisita motivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "desfecho", nullable = false, length = 30)
    private DesfechoVisita desfecho;

    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "fonte", nullable = false, length = 20)
    private FonteRegistro fonte = FonteRegistro.DESKTOP;

    public enum MotivoVisita {
        CADASTRO, ACOMPANHAMENTO, BUSCA_ATIVA, EDUCACAO_SAUDE, OUTROS
    }

    public enum DesfechoVisita {
        REALIZADA, RECUSADA, NAO_ENCONTRADO, OUTROS
    }

    public enum FonteRegistro {
        MOBILE, DESKTOP
    }
}
