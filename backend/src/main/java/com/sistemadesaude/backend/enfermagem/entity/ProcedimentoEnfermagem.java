package com.sistemadesaude.backend.enfermagem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Procedimento Rápido de Enfermagem
 * Baseado no Manual UPA - Procedimentos Rápidos
 *
 * Tipos: Curativo, Medicação, Sutura, Nebulização, Sondagem, etc.
 */
@Entity
@Table(name = "procedimento_enfermagem", indexes = {
    @Index(name = "idx_proc_enf_atendimento", columnList = "atendimento_id"),
    @Index(name = "idx_proc_enf_tipo", columnList = "tipo_procedimento"),
    @Index(name = "idx_proc_enf_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcedimentoEnfermagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atendimento_id", nullable = false)
    private AtendimentoEnfermagem atendimento;

    @Column(name = "tipo_procedimento", length = 100, nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoProcedimento tipoProcedimento;

    @Column(name = "descricao", columnDefinition = "TEXT", nullable = false)
    private String descricao;

    /**
     * Campos específicos para medicação
     */
    @Column(name = "medicamento", length = 200)
    private String medicamento;

    @Column(name = "dose", length = 100)
    private String dose;

    @Column(name = "via_administracao", length = 50)
    private String viaAdministracao;

    /**
     * Campos específicos para curativos
     */
    @Column(name = "local_curativo", length = 200)
    private String localCurativo;

    @Column(name = "tipo_curativo", length = 100)
    private String tipoCurativo;

    /**
     * Campos específicos para suturas
     */
    @Column(name = "numero_pontos")
    private Integer numeroPontos;

    @Column(name = "tipo_fio", length = 100)
    private String tipoFio;

    /**
     * Campos gerais
     */
    @Column(name = "material_utilizado", columnDefinition = "TEXT")
    private String materialUtilizado;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "status", length = 50, nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusProcedimento status;

    @Column(name = "data_hora_execucao")
    private LocalDateTime dataHoraExecucao;

    @Column(name = "data_hora_conclusao")
    private LocalDateTime dataHoraConclusao;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    public enum TipoProcedimento {
        CURATIVO_SIMPLES("Curativo Simples"),
        CURATIVO_COMPLEXO("Curativo Complexo"),
        MEDICACAO_IM("Medicação Intramuscular"),
        MEDICACAO_EV("Medicação Endovenosa"),
        MEDICACAO_SC("Medicação Subcutânea"),
        MEDICACAO_ORAL("Medicação Oral"),
        NEBULIZACAO("Nebulização/Inalação"),
        OXIGENIOTERAPIA("Oxigenioterapia"),
        SUTURA_SIMPLES("Sutura Simples"),
        RETIRADA_PONTOS("Retirada de Pontos"),
        SONDAGEM_VESICAL("Sondagem Vesical"),
        SONDAGEM_NASOGASTRICA("Sondagem Nasogástrica"),
        LAVAGEM_GASTRICA("Lavagem Gástrica"),
        PUNÇÃO_VENOSA("Punção Venosa"),
        GLICEMIA_CAPILAR("Glicemia Capilar"),
        AFERIÇÃO_SINAIS("Aferição de Sinais Vitais"),
        INALACAO("Inalação"),
        OUTROS("Outros");

        private final String descricao;

        TipoProcedimento(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum StatusProcedimento {
        PENDENTE("Pendente"),
        EM_EXECUCAO("Em Execução"),
        CONCLUIDO("Concluído"),
        CANCELADO("Cancelado");

        private final String descricao;

        StatusProcedimento(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
        if (status == null) {
            status = StatusProcedimento.PENDENTE;
        }
    }
}
