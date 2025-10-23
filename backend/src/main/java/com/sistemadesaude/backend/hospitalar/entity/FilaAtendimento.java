package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "fila_atendimento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilaAtendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "prefixo_senha", nullable = false)
    private String prefixoSenha;

    @Column(name = "sequencia_atual")
    private Integer sequenciaAtual = 0;

    @Column(name = "periodo_sequencia")
    @Enumerated(EnumType.STRING)
    private PeriodoSequencia periodoSequencia;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id")
    private UnidadeSaude unidade;

    @Column(name = "setor_id")
    private Long setorId;

    @Column(name = "horario_inicio")
    private LocalTime horarioInicio;

    @Column(name = "horario_fim")
    private LocalTime horarioFim;

    @Column(name = "permite_prioritario")
    private Boolean permitePrioritario = true;

    @Column(name = "tempo_espera_alvo")
    private Integer tempoEsperaAlvo; // em minutos

    @Column(name = "tempo_espera_tolerancia")
    private Integer tempoEsperaToleancia; // em minutos

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PeriodoSequencia {
        DIARIO,
        SEMANAL,
        MENSAL,
        ANUAL
    }
}