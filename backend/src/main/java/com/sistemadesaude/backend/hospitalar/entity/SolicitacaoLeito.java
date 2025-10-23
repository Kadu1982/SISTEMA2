package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.profissional.entity.Profissional;
import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitacao_leito")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitacaoLeito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(name = "atendimento_id")
    private Long atendimentoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_solicitante_id", nullable = false)
    private Profissional medicoSolicitante;

    @Column(name = "tipo_acomodacao_solicitada")
    @Enumerated(EnumType.STRING)
    private Leito.TipoAcomodacao tipoAcomodacaoSolicitada;

    @Column(name = "especialidade_solicitada")
    private String especialidadeSolicitada;

    @Column(name = "unidade_solicitada")
    private String unidadeSolicitada;

    @Column(name = "prioridade")
    @Enumerated(EnumType.STRING)
    private PrioridadeSolicitacao prioridade;

    @Column(name = "motivo_internacao")
    private String motivoInternacao;

    @Column(name = "observacoes_clinicas")
    private String observacoesClinicas;

    @Column(name = "data_solicitacao", nullable = false)
    private LocalDateTime dataSolicitacao;

    @Column(name = "data_necessidade")
    private LocalDateTime dataNecessidade;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private StatusSolicitacao status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leito_reservado_id")
    private Leito leitoReservado;

    @Column(name = "data_reserva")
    private LocalDateTime dataReserva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_reserva_id")
    private Operador responsavelReserva;

    @Column(name = "data_atendimento")
    private LocalDateTime dataAtendimento;

    @Column(name = "motivo_cancelamento")
    private String motivoCancelamento;

    @Column(name = "observacoes_central")
    private String observacoesCentral;

    @PrePersist
    protected void onCreate() {
        if (dataSolicitacao == null) {
            dataSolicitacao = LocalDateTime.now();
        }
        if (status == null) {
            status = StatusSolicitacao.SOLICITADO;
        }
    }

    public enum PrioridadeSolicitacao {
        ALTA,
        MEDIA,
        BAIXA,
        ELETIVA
    }

    public enum StatusSolicitacao {
        SOLICITADO,
        EM_ANALISE,
        RESERVADO,
        ATENDIDO,
        CANCELADO,
        TRANSFERIDO
    }
}