package com.sistemadesaude.backend.assistenciasocial.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Classe entidade que representa um motivo de atendimento.
 */
@Entity
@Table(name = "motivos_atendimento")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
public class MotivoAtendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "ativo")
    @Builder.Default
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
