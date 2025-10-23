package com.sistemadesaude.backend.assistenciasocial.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Classe entidade que representa uma dispensação de benefícios.
 */
@Entity
@Table(name = "dispensacoes_beneficio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispensacaoBeneficio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "familia_id")
    private Familia familia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", nullable = false)
    private UnidadeAssistencial unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profissional_id", nullable = false)
    private Operador profissional;

    @Column(name = "data_dispensacao", nullable = false)
    private LocalDateTime dataDispensacao;

    @Column(name = "valor_total", precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "situacao")
    @Enumerated(EnumType.STRING)
    private SituacaoDispensacao situacao = SituacaoDispensacao.PENDENTE;

    @Column(name = "data_autorizacao")
    private LocalDateTime dataAutorizacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_autorizacao_id")
    private Operador usuarioAutorizacao;

    @Column(name = "data_rejeicao")
    private LocalDateTime dataRejeicao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_rejeicao_id")
    private Operador usuarioRejeicao;

    @Column(name = "motivo_rejeicao", columnDefinition = "TEXT")
    private String motivoRejeicao;

    @Column(name = "data_cancelamento")
    private LocalDateTime dataCancelamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_cancelamento_id")
    private Operador usuarioCancelamento;

    @Column(name = "motivo_cancelamento", columnDefinition = "TEXT")
    private String motivoCancelamento;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "usuario_cadastro")
    private String usuarioCadastro;

    @OneToMany(mappedBy = "dispensacao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemDispensacaoBeneficio> itens = new ArrayList<>();

    // Enums
    public enum SituacaoDispensacao {
        PENDENTE,
        AUTORIZADA,
        REJEITADA,
        CANCELADA
    }
}
