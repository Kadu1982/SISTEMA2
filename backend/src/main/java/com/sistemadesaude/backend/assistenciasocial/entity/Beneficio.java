package com.sistemadesaude.backend.assistenciasocial.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Classe entidade que representa um benefício no módulo de Assistência Social.
 */
@Entity
@Table(name = "beneficios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Beneficio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_beneficio_id", nullable = false)
    private TipoBeneficio tipoBeneficio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subtipo_beneficio_id")
    private SubtipoBeneficio subtipoBeneficio;

    @Column(name = "valor_base", precision = 10, scale = 2)
    private BigDecimal valorBase;

    @Column(name = "numero_lei")
    private String numeroLei;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "controle_quota")
    private Boolean controleQuota = false;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "usuario_cadastro")
    private String usuarioCadastro;

    @Column(name = "usuario_atualizacao")
    private String usuarioAtualizacao;
}
