package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidade para controle de encaminhamentos internos no Ambulatório Hospitalar
 */
@Entity
@Table(name = "ambulatorio_encaminhamentos_internos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EncaminhamentoInterno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(name = "atendimento_origem_id")
    private Long atendimentoOrigemId;

    @Column(name = "agendamento_origem_id")
    private Long agendamentoOrigemId;

    @Column(name = "profissional_origem_id", nullable = false)
    private Long profissionalOrigemId;

    @Column(name = "especialidade_origem_id", nullable = false)
    private Long especialidadeOrigemId;

    @Column(name = "especialidade_destino_id", nullable = false)
    private Long especialidadeDestinoId;

    @Column(name = "profissional_destino_id")
    private Long profissionalDestinoId;

    @Column(name = "unidade_destino_id")
    private Long unidadeDestinoId;

    @Column(name = "tipo_encaminhamento")
    @Enumerated(EnumType.STRING)
    private TipoEncaminhamento tipoEncaminhamento;

    @Column(name = "prioridade")
    @Enumerated(EnumType.STRING)
    private PrioridadeEncaminhamento prioridade = PrioridadeEncaminhamento.NORMAL;

    @Column(name = "motivo_encaminhamento", length = 1000, nullable = false)
    private String motivoEncaminhamento;

    @Column(name = "observacoes_clinicas", length = 1000)
    private String observacoesClinicas;

    @Column(name = "exames_anexos", length = 500)
    private String examesAnexos;

    @Column(name = "medicamentos_uso", length = 500)
    private String medicamentosUso;

    @Column(name = "status_encaminhamento")
    @Enumerated(EnumType.STRING)
    private StatusEncaminhamento statusEncaminhamento = StatusEncaminhamento.PENDENTE;

    @Column(name = "data_encaminhamento", nullable = false)
    private LocalDateTime dataEncaminhamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_encaminhamento_id", nullable = false)
    private Operador operadorEncaminhamento;

    @Column(name = "data_agendamento")
    private LocalDateTime dataAgendamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_agendamento_id")
    private Operador operadorAgendamento;

    @Column(name = "agendamento_gerado_id")
    private Long agendamentoGeradoId;

    @Column(name = "data_atendimento")
    private LocalDateTime dataAtendimento;

    @Column(name = "observacoes_retorno", length = 1000)
    private String observacoesRetorno;

    @Column(name = "prazo_dias")
    private Integer prazoDias;

    @Column(name = "urgente")
    private Boolean urgente = false;

    @PrePersist
    protected void onCreate() {
        if (dataEncaminhamento == null) {
            dataEncaminhamento = LocalDateTime.now();
        }
        if (statusEncaminhamento == null) {
            statusEncaminhamento = StatusEncaminhamento.PENDENTE;
        }
        if (prioridade == null) {
            prioridade = PrioridadeEncaminhamento.NORMAL;
        }
        if (urgente == null) {
            urgente = false;
        }
    }

    public enum TipoEncaminhamento {
        CONSULTA_ESPECIALIZADA,
        SEGUNDA_OPINIAO,
        AVALIACAO_ESPECIFICA,
        PROCEDIMENTO,
        CIRURGIA,
        EMERGENCIA,
        INTERNACAO
    }

    public enum PrioridadeEncaminhamento {
        BAIXA,
        NORMAL,
        ALTA,
        URGENTE,
        EMERGENCIA
    }

    public enum StatusEncaminhamento {
        PENDENTE,
        AGENDADO,
        CONFIRMADO,
        ATENDIDO,
        CANCELADO,
        REJEITADO,
        VENCIDO
    }
}