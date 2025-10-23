package com.sistemadesaude.backend.assistenciasocial.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Classe entidade que representa um subtipo de benefício.
 */
@Entity
@Table(name = "subtipos_beneficio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubtipoBeneficio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_beneficio_id", nullable = false)
    private TipoBeneficio tipoBeneficio;

    @Column(nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "usuario_cadastro")
    private String usuarioCadastro;

    @Column(name = "usuario_atualizacao")
    private String usuarioAtualizacao;
}
