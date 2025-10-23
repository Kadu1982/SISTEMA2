package com.sistemadesaude.backend.assistenciasocial.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Classe entidade que representa o vínculo entre uma unidade assistencial e um tipo de vulnerabilidade.
 */
@Entity
@Table(name = "vinculos_unidade_vulnerabilidade")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VinculoUnidadeVulnerabilidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", nullable = false)
    private UnidadeAssistencial unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_vulnerabilidade_id", nullable = false)
    private TipoVulnerabilidade tipoVulnerabilidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "configuracao_id")
    private ConfiguracaoAssistenciaSocial configuracao;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "usuario_cadastro")
    private String usuarioCadastro;
}
