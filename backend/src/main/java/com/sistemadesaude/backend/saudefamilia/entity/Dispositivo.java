package com.sistemadesaude.backend.saudefamilia.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "sf_dispositivo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dispositivo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "operador_id", nullable = false)
    private Long operadorId;

    private String imei;
    private String app;
    private String versao;

    @Column(name = "ultima_importacao")
    private LocalDateTime ultimaImportacao;

    @Column(name = "ultima_exportacao")
    private LocalDateTime ultimaExportacao;

    @OneToMany(mappedBy = "dispositivo", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<DispositivoLog> logs;
}
