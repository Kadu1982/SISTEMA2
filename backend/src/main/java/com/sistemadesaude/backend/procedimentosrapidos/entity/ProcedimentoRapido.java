package com.sistemadesaude.backend.procedimentosrapidos.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.procedimentosrapidos.enums.StatusProcedimento;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidade principal que representa um atendimento no módulo de Procedimentos Rápidos.
 * Pacientes vêm do Atendimento Ambulatorial para execução de atividades de enfermagem
 * (medicação, exames, vacinas) sem encerrar o atendimento original.
 */
@Entity
@Table(name = "procedimentos_rapidos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"paciente", "operadorResponsavel", "atividades"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ProcedimentoRapido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_responsavel_id")
    private Operador operadorResponsavel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private StatusProcedimento status = StatusProcedimento.AGUARDANDO;

    @Column(name = "origem_encaminhamento", length = 200)
    private String origemEncaminhamento;

    @Column(name = "atendimento_medico_origem_id")
    private Long atendimentoMedicoOrigemId;

    @Column(name = "medico_solicitante", length = 200)
    private String medicoSolicitante;

    @Column(name = "especialidade_origem", length = 100)
    private String especialidadeOrigem;

    @OneToMany(mappedBy = "procedimentoRapido", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dataCriacao ASC")
    @Builder.Default
    private List<AtividadeEnfermagem> atividades = new ArrayList<>();

    @Embedded
    private Desfecho desfecho;

    @Column(name = "alergias", length = 1000)
    private String alergias;

    @Column(name = "observacoes_gerais", length = 2000)
    private String observacoesGerais;

    @Column(name = "bloqueado_por_operador_id")
    private Long bloqueadoPorOperadorId;

    @Column(name = "bloqueado_em")
    private LocalDateTime bloqueadoEm;

    @Column(name = "data_hora_inicio_atendimento")
    private LocalDateTime dataHoraInicioAtendimento;

    @Column(name = "data_hora_fim_atendimento")
    private LocalDateTime dataHoraFimAtendimento;

    @Column(name = "cancelado_por", length = 200)
    private String canceladoPor;

    @Column(name = "motivo_cancelamento", length = 500)
    private String motivoCancelamento;

    @Column(name = "data_cancelamento")
    private LocalDateTime dataCancelamento;

    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;

    @Column(name = "atualizado_por", length = 100)
    private String atualizadoPor;

    /**
     * Adiciona uma atividade à lista de atividades
     */
    public void adicionarAtividade(AtividadeEnfermagem atividade) {
        if (atividades == null) {
            atividades = new ArrayList<>();
        }
        atividades.add(atividade);
        atividade.setProcedimentoRapido(this);
    }

    /**
     * Remove uma atividade da lista
     */
    public void removerAtividade(AtividadeEnfermagem atividade) {
        if (atividades != null) {
            atividades.remove(atividade);
            atividade.setProcedimentoRapido(null);
        }
    }

    /**
     * Verifica se o procedimento está bloqueado para edição
     */
    @Transient
    public boolean isBloqueado() {
        return bloqueadoPorOperadorId != null;
    }

    /**
     * Verifica se pode ser desbloqueado pelo operador especificado
     */
    @Transient
    public boolean podeDesbloquear(Long operadorId) {
        return isBloqueado() && !bloqueadoPorOperadorId.equals(operadorId);
    }

    /**
     * Bloqueia o procedimento para um operador
     */
    public void bloquear(Long operadorId) {
        this.bloqueadoPorOperadorId = operadorId;
        this.bloqueadoEm = LocalDateTime.now();
    }

    /**
     * Desbloqueia o procedimento
     */
    public void desbloquear() {
        this.bloqueadoPorOperadorId = null;
        this.bloqueadoEm = null;
    }

    /**
     * Inicia o atendimento
     */
    public void iniciarAtendimento(Long operadorId) {
        this.status = StatusProcedimento.EM_ATENDIMENTO;
        this.dataHoraInicioAtendimento = LocalDateTime.now();
        bloquear(operadorId);
    }

    /**
     * Finaliza o atendimento
     */
    public void finalizar() {
        this.status = StatusProcedimento.FINALIZADO;
        this.dataHoraFimAtendimento = LocalDateTime.now();
        desbloquear();
    }

    /**
     * Cancela o atendimento
     */
    public void cancelar(String canceladoPor, String motivo) {
        this.status = StatusProcedimento.CANCELADO;
        this.canceladoPor = canceladoPor;
        this.motivoCancelamento = motivo;
        this.dataCancelamento = LocalDateTime.now();
        desbloquear();
    }

    /**
     * Verifica se há atividades pendentes
     */
    @Transient
    public boolean temAtividadesPendentes() {
        if (atividades == null || atividades.isEmpty()) {
            return false;
        }
        return atividades.stream()
                .anyMatch(a -> a.getSituacao() == com.sistemadesaude.backend.procedimentosrapidos.enums.SituacaoAtividade.PENDENTE);
    }

    /**
     * Conta quantas atividades estão pendentes
     */
    @Transient
    public long contarAtividadesPendentes() {
        if (atividades == null || atividades.isEmpty()) {
            return 0;
        }
        return atividades.stream()
                .filter(a -> a.getSituacao() == com.sistemadesaude.backend.procedimentosrapidos.enums.SituacaoAtividade.PENDENTE)
                .count();
    }
}
