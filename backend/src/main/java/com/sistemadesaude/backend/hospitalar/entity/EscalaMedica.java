package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Entidade para controle de escalas médicas no Ambulatório Hospitalar
 */
@Entity
@Table(name = "ambulatorio_escalas_medicas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EscalaMedica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "profissional_id", nullable = false)
    private Long profissionalId;

    @Column(name = "unidade_id", nullable = false)
    private Long unidadeId;

    @Column(name = "especialidade_id", nullable = false)
    private Long especialidadeId;

    @Column(name = "data_escala", nullable = false)
    private LocalDate dataEscala;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fim", nullable = false)
    private LocalTime horaFim;

    @Column(name = "intervalo_consulta_minutos", nullable = false)
    private Integer intervaloConsultaMinutos = 30;

    @Column(name = "vagas_disponveis", nullable = false)
    private Integer vagasDisponiveis;

    @Column(name = "vagas_ocupadas")
    private Integer vagasOcupadas = 0;

    @Column(name = "vagas_bloqueadas")
    private Integer vagasBloqueadas = 0;

    @Column(name = "status_escala")
    @Enumerated(EnumType.STRING)
    private StatusEscala statusEscala = StatusEscala.ATIVA;

    @Column(name = "tipo_escala")
    @Enumerated(EnumType.STRING)
    private TipoEscala tipoEscala;

    @Column(name = "permite_encaixe")
    private Boolean permiteEncaixe = false;

    @Column(name = "vagas_encaixe")
    private Integer vagasEncaixe = 0;

    @Column(name = "numero_sala")
    private String numeroSala;

    @Column(name = "observacoes", length = 500)
    private String observacoes;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_criacao_id", nullable = false)
    private Operador operadorCriacao;

    @Column(name = "data_ultima_alteracao")
    private LocalDateTime dataUltimaAlteracao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_alteracao_id")
    private Operador operadorAlteracao;

    @PrePersist
    protected void onCreate() {
        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }
        if (statusEscala == null) {
            statusEscala = StatusEscala.ATIVA;
        }
        if (vagasOcupadas == null) {
            vagasOcupadas = 0;
        }
        if (vagasBloqueadas == null) {
            vagasBloqueadas = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        dataUltimaAlteracao = LocalDateTime.now();
    }

    public Integer getVagasLivres() {
        return vagasDisponiveis - vagasOcupadas - vagasBloqueadas;
    }

    public Boolean hasVagasDisponiveis() {
        return getVagasLivres() > 0;
    }

    public enum StatusEscala {
        ATIVA,
        INATIVA,
        CANCELADA,
        SUSPENSA,
        FINALIZADA
    }

    public enum TipoEscala {
        NORMAL,
        EXTRA,
        PLANTAO,
        SUBSTITUICAO,
        EMERGENCIA
    }
}