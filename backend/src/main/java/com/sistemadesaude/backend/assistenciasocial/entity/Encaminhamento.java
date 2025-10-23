package com.sistemadesaude.backend.assistenciasocial.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Classe entidade que representa um encaminhamento.
 */
@Entity
@Table(name = "encaminhamentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Encaminhamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", nullable = false)
    private UnidadeAssistencial unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profissional_id", nullable = false)
    private Operador profissional;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "familia_id")
    private Familia familia;

    @Column(name = "data_encaminhamento", nullable = false)
    private LocalDate dataEncaminhamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_encaminhamento_id", nullable = false)
    private TipoEncaminhamento tipoEncaminhamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destino_id", nullable = false)
    private OrgaoRedeAssistencial destino;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "data_contrareferencia")
    private LocalDate dataContrareferencia;

    @Column(name = "profissional_contrareferencia")
    private String profissionalContrareferencia;

    @Column(name = "telefone_contrareferencia")
    private String telefoneContrareferencia;

    @Column(name = "anotacoes_contrareferencia", columnDefinition = "TEXT")
    private String anotacoesContrareferencia;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "usuario_cadastro")
    private String usuarioCadastro;

    @Column(name = "usuario_atualizacao")
    private String usuarioAtualizacao;
}
