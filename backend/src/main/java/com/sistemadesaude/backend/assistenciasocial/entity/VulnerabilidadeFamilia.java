package com.sistemadesaude.backend.assistenciasocial.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Classe entidade que representa uma vulnerabilidade atribuída a uma família.
 */
@Entity
@Table(name = "vulnerabilidades_familia")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VulnerabilidadeFamilia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "familia_id", nullable = false)
    private Familia familia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_vulnerabilidade_id", nullable = false)
    private TipoVulnerabilidade tipoVulnerabilidade;

    @Column(name = "data_identificacao", nullable = false)
    private LocalDate dataIdentificacao;

    @Column(name = "data_superacao")
    private LocalDate dataSuperacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profissional_id")
    private Operador profissional;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "usuario_cadastro")
    private String usuarioCadastro;

    @Column(name = "usuario_atualizacao")
    private String usuarioAtualizacao;
}
