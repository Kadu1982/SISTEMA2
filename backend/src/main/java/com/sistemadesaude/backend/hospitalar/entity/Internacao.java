package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "hospitalar_internacoes")
public class Internacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacionamentos principais
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leito_id", nullable = false)
    private Leito leito;

    @Column(name = "medico_responsavel_id", nullable = false)
    private Long medicoResponsavelId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_internacao_id", nullable = false)
    private Operador operadorInternacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_alta_id")
    private Operador operadorAlta;

    // Dados da internação
    @Column(name = "numero_internacao", unique = true, nullable = false)
    private String numeroInternacao;

    @Column(name = "data_internacao", nullable = false)
    private LocalDate dataInternacao;

    @Column(name = "hora_internacao", nullable = false)
    private LocalTime horaInternacao;

    @Column(name = "data_prevista_alta")
    private LocalDate dataPrevistaAlta;

    @Column(name = "data_alta")
    private LocalDate dataAlta;

    @Column(name = "hora_alta")
    private LocalTime horaAlta;

    // Informações clínicas
    @Column(name = "motivo_internacao", columnDefinition = "TEXT")
    private String motivoInternacao;

    @Column(name = "diagnostico_principal", columnDefinition = "TEXT")
    private String diagnosticoPrincipal;

    @Column(name = "diagnosticos_secundarios", columnDefinition = "TEXT")
    private String diagnosticosSecundarios;

    @Column(name = "cid_principal")
    private String cidPrincipal;

    @Column(name = "procedimento_principal")
    private String procedimentoPrincipal;

    @Column(name = "observacoes_clinicas", columnDefinition = "TEXT")
    private String observacoesClinicas;

    // Status e tipo
    @Enumerated(EnumType.STRING)
    @Column(name = "status_internacao", nullable = false)
    private StatusInternacao statusInternacao = StatusInternacao.ATIVA;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_internacao", nullable = false)
    private TipoInternacao tipoInternacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "regime_internacao", nullable = false)
    private RegimeInternacao regimeInternacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_alta")
    private TipoAlta tipoAlta;

    // Informações administrativas
    @Column(name = "unidade_id", nullable = false)
    private Long unidadeId;

    @Column(name = "convenio_id")
    private Long convenioId;

    @Column(name = "numero_guia_convenio")
    private String numeroGuiaConvenio;

    @Column(name = "numero_carteirinha")
    private String numeroCarteirinha;

    @Column(name = "valor_diaria", precision = 10, scale = 2)
    private BigDecimal valorDiaria;

    @Column(name = "valor_total", precision = 10, scale = 2)
    private BigDecimal valorTotal;

    // Controle de acompanhante
    @Column(name = "permite_acompanhante")
    private Boolean permiteAcompanhante = false;

    @Column(name = "nome_acompanhante")
    private String nomeAcompanhante;

    @Column(name = "documento_acompanhante")
    private String documentoAcompanhante;

    @Column(name = "parentesco_acompanhante")
    private String parentescoAcompanhante;

    // Controle de tempo
    @Column(name = "dias_internacao", columnDefinition = "INTEGER DEFAULT 0")
    private Integer diasInternacao = 0;

    @Column(name = "horas_internacao", columnDefinition = "INTEGER DEFAULT 0")
    private Integer horasInternacao = 0;

    // Campos de auditoria
    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @UpdateTimestamp
    @Column(name = "data_ultima_alteracao")
    private LocalDateTime dataUltimaAlteracao;

    @Column(name = "observacoes_administrativas", columnDefinition = "TEXT")
    private String observacoesAdministrativas;

    // Enums

    public enum StatusInternacao {
        ATIVA("Internação Ativa"),
        ALTA_MEDICA("Alta Médica"),
        ALTA_ADMINISTRATIVA("Alta Administrativa"),
        TRANSFERIDA("Transferida"),
        OBITO("Óbito"),
        EVASAO("Evasão"),
        CANCELADA("Cancelada");

        private final String descricao;

        StatusInternacao(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum TipoInternacao {
        CLINICA("Clínica"),
        CIRURGICA("Cirúrgica"),
        OBSTETRICA("Obstétrica"),
        PEDIATRICA("Pediátrica"),
        PSIQUIATRICA("Psiquiátrica"),
        UTI("UTI"),
        URGENCIA("Urgência"),
        ELETIVA("Eletiva");

        private final String descricao;

        TipoInternacao(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum RegimeInternacao {
        PUBLICO("Público"),
        PARTICULAR("Particular"),
        CONVENIO("Convênio"),
        SUS("SUS");

        private final String descricao;

        RegimeInternacao(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum TipoAlta {
        CURA("Cura"),
        MELHORA("Melhora"),
        INALTERADO("Inalterado"),
        PIORA("Piora"),
        OBITO("Óbito"),
        TRANSFERENCIA("Transferência"),
        EVASAO("Evasão"),
        A_PEDIDO("A Pedido");

        private final String descricao;

        TipoAlta(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    // Métodos auxiliares

    public boolean isAtiva() {
        return StatusInternacao.ATIVA.equals(this.statusInternacao);
    }

    public boolean isAlta() {
        return StatusInternacao.ALTA_MEDICA.equals(this.statusInternacao) ||
               StatusInternacao.ALTA_ADMINISTRATIVA.equals(this.statusInternacao);
    }

    public boolean temAcompanhante() {
        return Boolean.TRUE.equals(this.permiteAcompanhante) &&
               this.nomeAcompanhante != null && !this.nomeAcompanhante.isEmpty();
    }

    public boolean isConvenio() {
        return RegimeInternacao.CONVENIO.equals(this.regimeInternacao);
    }

    public boolean isSUS() {
        return RegimeInternacao.SUS.equals(this.regimeInternacao);
    }

    public boolean isParticular() {
        return RegimeInternacao.PARTICULAR.equals(this.regimeInternacao);
    }
}