package com.sistemadesaude.backend.recepcao.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Representa bloqueios de horários para agendamento
 * Baseado no Manual de Agendamento de Exames seção "Bloqueios"
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bloqueios_horarios")
public class BloqueioHorario {

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
     * Tipo de bloqueio
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_bloqueio", nullable = false)
    private TipoBloqueio tipoBloqueio;

    /**
     * Data inicial do bloqueio
     */
    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    /**
     * Data final do bloqueio (null se for bloqueio de dia único)
     */
    @Column(name = "data_fim")
    private LocalDate dataFim;

    /**
     * Horário de início (null se bloquear o dia todo)
     */
    @Column(name = "hora_inicio")
    private LocalTime horaInicio;

    /**
     * Horário de fim (null se bloquear o dia todo)
     */
    @Column(name = "hora_fim")
    private LocalTime horaFim;

    /**
     * Bloqueia o dia inteiro
     */
    @Column(name = "dia_inteiro")
    private Boolean diaInteiro = false;

    /**
     * Motivo do bloqueio
     */
    @Column(name = "motivo", nullable = false, columnDefinition = "TEXT")
    private String motivo;

    /**
     * Ativo/inativo
     */
    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "operador_bloqueio_id")
    private Long operadorBloqueioId;

    public enum TipoBloqueio {
        FERIAS("Férias"),
        FERIADO("Feriado"),
        MANUTENCAO("Manutenção/Reforma"),
        EVENTO("Evento/Reunião"),
        LICENCA("Licença Médica"),
        AUSENCIA("Ausência Temporária"),
        OUTRO("Outro");

        private final String descricao;

        TipoBloqueio(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    /**
     * Verifica se um horário específico está bloqueado
     */
    public boolean bloqueiaHorario(LocalDate data, LocalTime hora) {
        if (!ativo) return false;

        // Verifica se a data está no período
        if (data.isBefore(dataInicio)) return false;
        if (dataFim != null && data.isAfter(dataFim)) return false;

        // Se bloqueia dia inteiro, retorna true
        if (Boolean.TRUE.equals(diaInteiro)) return true;

        // Se não tem horários definidos, bloqueia o dia todo
        if (horaInicio == null || horaFim == null) return true;

        // Verifica se o horário está dentro do bloqueio
        return !hora.isBefore(horaInicio) && !hora.isAfter(horaFim);
    }
}