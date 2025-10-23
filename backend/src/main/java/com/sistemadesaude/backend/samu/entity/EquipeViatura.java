package com.sistemadesaude.backend.samu.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 👥 ENTIDADE EQUIPE DA VIATURA
 *
 * Representa um membro da equipe que está
 * trabalhando em uma viatura específica.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "samu_equipe_viatura")
public class EquipeViatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viatura_id", nullable = false)
    private Viatura viatura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_id", nullable = false)
    private Operador operador;

    @Column(name = "funcao", nullable = false)
    private String funcao; // CONDUTOR, MEDICO, ENFERMEIRO, TECNICO, AUXILIAR

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "data_inicio", nullable = false)
    private LocalDateTime dataInicio = LocalDateTime.now();

    @Column(name = "data_fim")
    private LocalDateTime dataFim;

    @Column(name = "turno")
    private String turno; // MANHA, TARDE, NOITE, PLANTAO_24H

    @Column(name = "observacoes")
    private String observacoes;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    // Métodos helper
    public boolean isAtivo() {
        return Boolean.TRUE.equals(ativo) && dataFim == null;
    }

    public void finalizarTurno() {
        this.ativo = false;
        this.dataFim = LocalDateTime.now();
    }

    public String getFuncaoFormatada() {
        return switch (funcao) {
            case "CONDUTOR" -> "Condutor/Motorista";
            case "MEDICO" -> "Médico";
            case "ENFERMEIRO" -> "Enfermeiro";
            case "TECNICO" -> "Técnico em Enfermagem";
            case "AUXILIAR" -> "Auxiliar de Enfermagem";
            default -> funcao;
        };
    }

    public boolean isLiderEquipe() {
        return "MEDICO".equals(funcao) || "ENFERMEIRO".equals(funcao);
    }
}
