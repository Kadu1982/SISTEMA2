package com.sistemadesaude.backend.operador.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.time.OffsetDateTime;

/**
 * Janelas de horário por dia da semana para o operador.
 * Tabela: operador_horarios_acesso
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "operador_horarios_acesso",
        uniqueConstraints = @UniqueConstraint(name = "uq_op_horario_dia_inicio_fim",
                columnNames = {"operador_id","dia_semana","hora_inicio","hora_fim"}))
public class OperadorHorarioAcesso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "operador_id", nullable = false)
    private Long operadorId;

    /**
     * 0=domingo, 1=segunda ... 6=sábado
     */
    @Column(name = "dia_semana", nullable = false)
    private Short diaSemana;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fim", nullable = false)
    private LocalTime horaFim;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "criado_por", length = 50)
    private String criadoPor;

    @Column(name = "atualizado_por", length = 50)
    private String atualizadoPor;

    @Column(name = "data_criacao", nullable = false, columnDefinition = "timestamptz")
    private OffsetDateTime dataCriacao = OffsetDateTime.now();

    @Column(name = "data_atualizacao", nullable = false, columnDefinition = "timestamptz")
    private OffsetDateTime dataAtualizacao = OffsetDateTime.now();
}
