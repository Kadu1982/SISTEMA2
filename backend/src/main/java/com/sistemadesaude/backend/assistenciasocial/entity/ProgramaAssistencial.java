package com.sistemadesaude.backend.assistenciasocial.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Classe entidade que representa um programa assistencial.
 */
@Entity
@Table(name = "programas_assistenciais")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramaAssistencial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "tipo_programa")
    @Enumerated(EnumType.STRING)
    private TipoPrograma tipoPrograma;

    @Column(name = "oferta_programa")
    @Enumerated(EnumType.STRING)
    private OfertaPrograma ofertaPrograma;

    @Column(name = "esfera_administrativa")
    @Enumerated(EnumType.STRING)
    private EsferaAdministrativa esferaAdministrativa;

    @Column(name = "quantidade_vagas")
    private Integer quantidadeVagas;

    @Column(name = "valor_beneficio", precision = 10, scale = 2)
    private BigDecimal valorBeneficio;

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

    // Enums
    public enum TipoPrograma {
        BOLSA_FAMILIA,
        BOLSA_CIDADANIA,
        LEITE_DAS_CRIANCAS,
        PRONATEC_SISTEC,
        OUTRO
    }

    public enum OfertaPrograma {
        BENEFICIOS,
        TRANSFERENCIA_RENDA,
        OUTROS
    }

    public enum EsferaAdministrativa {
        MUNICIPAL_DF,
        ESTADUAL,
        FEDERAL
    }
}
