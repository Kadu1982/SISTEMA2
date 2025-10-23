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
 * Entidade para controle de presença de profissionais no Ambulatório Hospitalar
 */
@Entity
@Table(name = "ambulatorio_presenca_profissionais")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresencaProfissional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escala_id", nullable = false)
    private EscalaMedica escala;

    @Column(name = "profissional_id", nullable = false)
    private Long profissionalId;

    @Column(name = "data_presenca", nullable = false)
    private LocalDate dataPresenca;

    @Column(name = "hora_chegada")
    private LocalTime horaChegada;

    @Column(name = "hora_saida")
    private LocalTime horaSaida;

    @Column(name = "status_presenca")
    @Enumerated(EnumType.STRING)
    private StatusPresenca statusPresenca = StatusPresenca.AUSENTE;

    @Column(name = "motivo_falta")
    @Enumerated(EnumType.STRING)
    private MotivoFalta motivoFalta;

    @Column(name = "justificativa", length = 500)
    private String justificativa;

    @Column(name = "horas_trabalhadas")
    private Integer horasTrabalhadasMinutos;

    @Column(name = "atraso_minutos")
    private Integer atrasoMinutos = 0;

    @Column(name = "saida_antecipada_minutos")
    private Integer saidaAntecipadaMinutos = 0;

    @Column(name = "total_consultas_realizadas")
    private Integer totalConsultasRealizadas = 0;

    @Column(name = "total_faltas_pacientes")
    private Integer totalFaltasPacientes = 0;

    @Column(name = "observacoes", length = 1000)
    private String observacoes;

    @Column(name = "data_registro", nullable = false)
    private LocalDateTime dataRegistro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_registro_id", nullable = false)
    private Operador operadorRegistro;

    @Column(name = "data_ultima_alteracao")
    private LocalDateTime dataUltimaAlteracao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_alteracao_id")
    private Operador operadorAlteracao;

    @PrePersist
    protected void onCreate() {
        if (dataRegistro == null) {
            dataRegistro = LocalDateTime.now();
        }
        if (statusPresenca == null) {
            statusPresenca = StatusPresenca.AUSENTE;
        }
        if (atrasoMinutos == null) {
            atrasoMinutos = 0;
        }
        if (saidaAntecipadaMinutos == null) {
            saidaAntecipadaMinutos = 0;
        }
        if (totalConsultasRealizadas == null) {
            totalConsultasRealizadas = 0;
        }
        if (totalFaltasPacientes == null) {
            totalFaltasPacientes = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        dataUltimaAlteracao = LocalDateTime.now();
    }

    public void marcarChegada(LocalTime horaChegada) {
        this.horaChegada = horaChegada;
        this.statusPresenca = StatusPresenca.PRESENTE;

        // Calcular atraso se houver
        if (escala != null && horaChegada.isAfter(escala.getHoraInicio())) {
            this.atrasoMinutos = (int) java.time.Duration.between(escala.getHoraInicio(), horaChegada).toMinutes();
        }
    }

    public void marcarSaida(LocalTime horaSaida) {
        this.horaSaida = horaSaida;

        if (horaChegada != null && horaSaida != null) {
            this.horasTrabalhadasMinutos = (int) java.time.Duration.between(horaChegada, horaSaida).toMinutes();
        }

        // Calcular saída antecipada se houver
        if (escala != null && horaSaida.isBefore(escala.getHoraFim())) {
            this.saidaAntecipadaMinutos = (int) java.time.Duration.between(horaSaida, escala.getHoraFim()).toMinutes();
        }
    }

    public enum StatusPresenca {
        PRESENTE,
        AUSENTE,
        FALTA_JUSTIFICADA,
        FALTA_INJUSTIFICADA,
        ATESTADO,
        FOLGA,
        FERIAS,
        LICENCA
    }

    public enum MotivoFalta {
        DOENCA,
        COMPROMISSO_PESSOAL,
        PROBLEMA_FAMILIAR,
        TRANSPORTE,
        ATESTADO_MEDICO,
        LICENCA_MATERNIDADE,
        LICENCA_PATERNIDADE,
        FERIAS,
        FOLGA_PROGRAMADA,
        OUTRO
    }
}