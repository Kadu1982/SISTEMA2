package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Entidade para agendamento de consultas no Ambulatório Hospitalar
 */
@Entity
@Table(name = "ambulatorio_agendamentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgendamentoAmbulatorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(name = "profissional_id", nullable = false)
    private Long profissionalId;

    @Column(name = "unidade_id", nullable = false)
    private Long unidadeId;

    @Column(name = "especialidade_id", nullable = false)
    private Long especialidadeId;

    @Column(name = "data_agendamento", nullable = false)
    private LocalDate dataAgendamento;

    @Column(name = "hora_agendamento", nullable = false)
    private LocalTime horaAgendamento;

    @Column(name = "tipo_consulta")
    @Enumerated(EnumType.STRING)
    private TipoConsulta tipoConsulta;

    @Column(name = "status_agendamento")
    @Enumerated(EnumType.STRING)
    private StatusAgendamento statusAgendamento = StatusAgendamento.AGENDADO;

    @Column(name = "prioridade")
    @Enumerated(EnumType.STRING)
    private PrioridadeAgendamento prioridade = PrioridadeAgendamento.NORMAL;

    @Column(name = "observacoes", length = 1000)
    private String observacoes;

    @Column(name = "motivo_consulta", length = 500)
    private String motivoConsulta;

    @Column(name = "encaminhamento_interno")
    private Boolean encaminhamentoInterno = false;

    @Column(name = "agendamento_origem_id")
    private Long agendamentoOrigemId;

    @Column(name = "numero_guia")
    private String numeroGuia;

    @Column(name = "convenio_id")
    private Long convenioId;

    @Column(name = "retorno_programado")
    private Boolean retornoProgramado = false;

    @Column(name = "dias_retorno")
    private Integer diasRetorno;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_criacao_id", nullable = false)
    private Operador operadorCriacao;

    @Column(name = "data_confirmacao")
    private LocalDateTime dataConfirmacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_confirmacao_id")
    private Operador operadorConfirmacao;

    @Column(name = "data_chegada")
    private LocalDateTime dataChegada;

    @Column(name = "data_chamada")
    private LocalDateTime dataChamada;

    @Column(name = "data_inicio_atendimento")
    private LocalDateTime dataInicioAtendimento;

    @Column(name = "data_fim_atendimento")
    private LocalDateTime dataFimAtendimento;

    @Column(name = "tempo_espera_minutos")
    private Integer tempoEsperaMinutos;

    @Column(name = "tempo_atendimento_minutos")
    private Integer tempoAtendimentoMinutos;

    @Column(name = "numero_sala")
    private String numeroSala;

    @Column(name = "observacoes_atendimento", length = 1000)
    private String observacoesAtendimento;

    @PrePersist
    protected void onCreate() {
        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }
        if (statusAgendamento == null) {
            statusAgendamento = StatusAgendamento.AGENDADO;
        }
        if (prioridade == null) {
            prioridade = PrioridadeAgendamento.NORMAL;
        }
    }

    public enum TipoConsulta {
        PRIMEIRA_VEZ,
        RETORNO,
        ENCAMINHAMENTO,
        URGENCIA,
        REAVALIACAO
    }

    public enum StatusAgendamento {
        AGENDADO,
        CONFIRMADO,
        PRESENTE,
        CHAMADO,
        EM_ATENDIMENTO,
        ATENDIDO,
        FALTOU,
        CANCELADO,
        REAGENDADO
    }

    public enum PrioridadeAgendamento {
        BAIXA,
        NORMAL,
        ALTA,
        URGENTE
    }
}