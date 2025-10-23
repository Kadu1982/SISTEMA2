package com.sistemadesaude.backend.saudefamilia.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sf_dispositivo_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispositivoLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispositivo_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Dispositivo dispositivo;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora = LocalDateTime.now();

    @Column(nullable = false, length = 20)
    private String tipo; // IMPORTACAO|EXPORTACAO|ERRO

    @Column(name = "resumo")
    private String resumo;
}
