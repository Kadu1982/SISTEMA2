package com.sistemadesaude.backend.enfermagem.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Atendimento de Enfermagem - Procedimentos Rápidos
 * Baseado no Manual UPA - Procedimentos Rápidos
 *
 * Recebe pacientes de:
 * - Atendimento Ambulatorial (módulo principal)
 * - Atendimentos UPA (módulo UPA)
 */
@Entity
@Table(name = "atendimento_enfermagem", indexes = {
    @Index(name = "idx_atend_enf_paciente", columnList = "paciente_id"),
    @Index(name = "idx_atend_enf_unidade", columnList = "unidade_id"),
    @Index(name = "idx_atend_enf_data", columnList = "data_hora_inicio"),
    @Index(name = "idx_atend_enf_status", columnList = "status"),
    @Index(name = "idx_atend_enf_origem", columnList = "origem_atendimento, origem_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtendimentoEnfermagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", nullable = false)
    private UnidadeSaude unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enfermeiro_id")
    private Operador enfermeiro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_enfermagem_id")
    private Operador tecnicoEnfermagem;

    /**
     * Origem do atendimento: AMBULATORIAL, UPA, EMERGENCIA
     */
    @Column(name = "origem_atendimento", length = 50, nullable = false)
    @Enumerated(EnumType.STRING)
    private OrigemAtendimento origemAtendimento;

    /**
     * ID do atendimento de origem (Atendimento.id ou AtendimentoUpa.id)
     */
    @Column(name = "origem_id")
    private Long origemId;

    @Column(name = "data_hora_inicio", nullable = false)
    private LocalDateTime dataHoraInicio;

    @Column(name = "data_hora_fim")
    private LocalDateTime dataHoraFim;

    @Column(name = "status", length = 50, nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusAtendimento status;

    /**
     * Queixa principal do paciente
     */
    @Column(name = "queixa", columnDefinition = "TEXT")
    private String queixa;

    /**
     * Sinais vitais no momento do atendimento
     */
    @Column(name = "pressao_arterial", length = 20)
    private String pressaoArterial;

    @Column(name = "frequencia_cardiaca")
    private Integer frequenciaCardiaca;

    @Column(name = "frequencia_respiratoria")
    private Integer frequenciaRespiratoria;

    @Column(name = "temperatura")
    private Double temperatura;

    @Column(name = "saturacao_o2")
    private Integer saturacaoO2;

    @Column(name = "glicemia")
    private Integer glicemia;

    @Column(name = "dor_escala")
    private Integer dorEscala; // 0-10

    /**
     * Observações gerais do atendimento
     */
    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    /**
     * Condutas realizadas
     */
    @Column(name = "condutas", columnDefinition = "TEXT")
    private String condutas;

    /**
     * Evolução do paciente
     */
    @Column(name = "evolucao", columnDefinition = "TEXT")
    private String evolucao;

    /**
     * Prioridade do atendimento (ROTINA, URGENTE, EMERGENCIA)
     */
    @Column(name = "prioridade", length = 50)
    @Enumerated(EnumType.STRING)
    private Prioridade prioridade;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    public enum OrigemAtendimento {
        AMBULATORIAL("Atendimento Ambulatorial"),
        UPA("Atendimento UPA"),
        EMERGENCIA("Emergência"),
        OUTROS("Outros");

        private final String descricao;

        OrigemAtendimento(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum StatusAtendimento {
        AGUARDANDO("Aguardando Atendimento"),
        EM_ATENDIMENTO("Em Atendimento"),
        FINALIZADO("Finalizado"),
        CANCELADO("Cancelado");

        private final String descricao;

        StatusAtendimento(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    public enum Prioridade {
        ROTINA("Rotina"),
        URGENTE("Urgente"),
        EMERGENCIA("Emergência");

        private final String descricao;

        Prioridade(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
        atualizadoEm = LocalDateTime.now();
        if (status == null) {
            status = StatusAtendimento.AGUARDANDO;
        }
        if (prioridade == null) {
            prioridade = Prioridade.ROTINA;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
    }
}
