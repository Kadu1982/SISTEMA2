package com.sistemadesaude.backend.recepcao.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Representa os horários disponíveis para agendamento de exames por profissional/sala
 * Baseado no Manual de Agendamento de Exames seção "Horários de Exames"
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "horarios_exames")
public class HorarioExame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "profissional_id")
    private Long profissionalId;

    @Column(name = "sala_id")
    private Long salaId;

    @Column(name = "unidade_id", nullable = false)
    private Long unidadeId;

    /**
     * Código do exame/procedimento (referência da tabela laboratorio_exames ou similares)
     */
    @Column(name = "exame_codigo", length = 50)
    private String exameCodigo;

    /**
     * Tipo de agendamento: INTERNO, EXTERNO, AMBOS
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_agendamento", length = 20)
    private TipoAgendamentoExame tipoAgendamento = TipoAgendamentoExame.AMBOS;

    /**
     * Dia da semana (MONDAY, TUESDAY, ...)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false)
    private DayOfWeek diaSemana;

    /**
     * Horário de início
     */
    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    /**
     * Horário de fim
     */
    @Column(name = "hora_fim", nullable = false)
    private LocalTime horaFim;

    /**
     * Intervalo entre agendamentos em minutos
     */
    @Column(name = "intervalo_minutos", nullable = false)
    private Integer intervaloMinutos = 30;

    /**
     * Quantidade de vagas por horário
     */
    @Column(name = "vagas_por_horario", nullable = false)
    private Integer vagasPorHorario = 1;

    /**
     * Permite encaixe (agendamento extra além das vagas)
     */
    @Column(name = "permite_encaixe")
    private Boolean permiteEncaixe = false;

    /**
     * Ativo/inativo
     */
    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    public enum TipoAgendamentoExame {
        INTERNO("Interno - Pacientes da unidade"),
        EXTERNO("Externo - Pacientes externos"),
        AMBOS("Ambos - Interno e Externo");

        private final String descricao;

        TipoAgendamentoExame(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    /**
     * Valida se o horário está configurado corretamente
     */
    public boolean isValido() {
        if (horaInicio == null || horaFim == null) return false;
        if (horaFim.isBefore(horaInicio) || horaFim.equals(horaInicio)) return false;
        if (intervaloMinutos == null || intervaloMinutos <= 0) return false;
        if (vagasPorHorario == null || vagasPorHorario <= 0) return false;
        return true;
    }

    /**
     * Calcula quantos slots de horário existem neste período
     */
    public int calcularQuantidadeSlots() {
        if (!isValido()) return 0;
        long duracaoMinutos = java.time.Duration.between(horaInicio, horaFim).toMinutes();
        return (int) (duracaoMinutos / intervaloMinutos);
    }

    /**
     * Calcula vagas totais no período
     */
    public int calcularVagasTotais() {
        return calcularQuantidadeSlots() * vagasPorHorario;
    }
}