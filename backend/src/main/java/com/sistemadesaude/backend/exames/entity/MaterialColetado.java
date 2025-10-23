package com.sistemadesaude.backend.exames.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "lab_material_coletado")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialColetado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coleta_id", nullable = false)
    private ColetaMaterial coleta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exame_recepcao_id", nullable = false)
    private ExameRecepcao exameRecepcao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private MaterialExame material;

    @Column(name = "quantidade")
    @Builder.Default
    private Integer quantidade = 1;

    @Column(name = "codigo_tubo", length = 50)
    private String codigoTubo;

    @Column(name = "etiqueta_impressa")
    @Builder.Default
    private Boolean etiquetaImpressa = false;

    @Lob
    @Column(name = "observacoes")
    private String observacoes;

    // Nova coleta
    @Column(name = "nova_coleta")
    @Builder.Default
    private Boolean novaColeta = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motivo_nova_coleta_id")
    private MotivoNovaColeta motivoNovaColeta;

    @Column(name = "data_nova_coleta")
    private LocalDateTime dataNovaColeta;
}