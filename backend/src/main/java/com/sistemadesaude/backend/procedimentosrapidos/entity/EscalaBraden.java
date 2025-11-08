package com.sistemadesaude.backend.procedimentosrapidos.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import com.sistemadesaude.backend.paciente.entity.Paciente;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidade para Escala de Braden (Avaliação de Risco de Lesão por Pressão)
 * 
 * Pontuação total: 6-23 pontos
 * 
 * Classificação de Risco:
 * - ≤9: Muito Alto Risco
 * - 10-12: Alto Risco
 * - 13-14: Risco Moderado
 * - 15-18: Baixo Risco
 * - >18: Sem Risco
 * 
 * Referência: Braden Scale for Predicting Pressure Sore Risk
 */
@Entity
@Table(name = "escala_braden")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaBraden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    /**
     * Percepção sensorial (1-4 pontos)
     * 1 = Totalmente limitado
     * 2 = Muito limitado
     * 3 = Levemente limitado
     * 4 = Nenhuma limitação
     */
    @Column(name = "percepcao_sensorial", nullable = false)
    private Integer percepcaoSensorial;

    /**
     * Umidade (1-4 pontos)
     * 1 = Constantemente úmida
     * 2 = Muito úmida
     * 3 = Ocasionalmente úmida
     * 4 = Raramente úmida
     */
    @Column(name = "umidade", nullable = false)
    private Integer umidade;

    /**
     * Atividade (1-4 pontos)
     * 1 = Acamado
     * 2 = Confinado à cadeira
     * 3 = Anda ocasionalmente
     * 4 = Anda frequentemente
     */
    @Column(name = "atividade", nullable = false)
    private Integer atividade;

    /**
     * Mobilidade (1-4 pontos)
     * 1 = Totalmente imóvel
     * 2 = Bastante limitado
     * 3 = Levemente limitado
     * 4 = Não apresenta limitações
     */
    @Column(name = "mobilidade", nullable = false)
    private Integer mobilidade;

    /**
     * Nutrição (1-4 pontos)
     * 1 = Muito pobre
     * 2 = Provavelmente inadequada
     * 3 = Adequada
     * 4 = Excelente
     */
    @Column(name = "nutricao", nullable = false)
    private Integer nutricao;

    /**
     * Fricção e cisalhamento (1-3 pontos)
     * 1 = Problema
     * 2 = Problema em potencial
     * 3 = Nenhum problema aparente
     */
    @Column(name = "friccao_cisalhamento", nullable = false)
    private Integer friccaoCisalhamento;

    @Column(name = "pontuacao_total", nullable = false)
    private Integer pontuacaoTotal;

    @Column(name = "classificacao_risco", nullable = false, length = 50)
    private String classificacaoRisco;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avaliador_id", nullable = false)
    private Operador avaliador;

    @Column(name = "data_avaliacao", nullable = false)
    private LocalDateTime dataAvaliacao;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    /**
     * Valida campos, calcula pontuação e classifica o risco antes de persistir
     */
    @PrePersist
    @PreUpdate
    public void validarECalcular() {
        // Valida campos
        validarPercepcaoSensorial();
        validarUmidade();
        validarAtividade();
        validarMobilidade();
        validarNutricao();
        validarFriccaoCisalhamento();
        
        // Calcula pontuação total
        this.pontuacaoTotal = percepcaoSensorial + umidade + atividade + 
                              mobilidade + nutricao + friccaoCisalhamento;
        
        // Classifica o risco baseado na pontuação
        if (pontuacaoTotal <= 9) {
            this.classificacaoRisco = "Muito Alto Risco";
        } else if (pontuacaoTotal <= 12) {
            this.classificacaoRisco = "Alto Risco";
        } else if (pontuacaoTotal <= 14) {
            this.classificacaoRisco = "Risco Moderado";
        } else if (pontuacaoTotal <= 18) {
            this.classificacaoRisco = "Baixo Risco";
        } else {
            this.classificacaoRisco = "Sem Risco";
        }

        // Atualiza timestamps
        if (this.dataCriacao == null) {
            this.dataCriacao = LocalDateTime.now();
        }
        this.dataAtualizacao = LocalDateTime.now();
    }

    private void validarPercepcaoSensorial() {
        if (percepcaoSensorial < 1 || percepcaoSensorial > 4) {
            throw new IllegalArgumentException("Percepção sensorial deve estar entre 1 e 4");
        }
    }

    private void validarUmidade() {
        if (umidade < 1 || umidade > 4) {
            throw new IllegalArgumentException("Umidade deve estar entre 1 e 4");
        }
    }

    private void validarAtividade() {
        if (atividade < 1 || atividade > 4) {
            throw new IllegalArgumentException("Atividade deve estar entre 1 e 4");
        }
    }

    private void validarMobilidade() {
        if (mobilidade < 1 || mobilidade > 4) {
            throw new IllegalArgumentException("Mobilidade deve estar entre 1 e 4");
        }
    }

    private void validarNutricao() {
        if (nutricao < 1 || nutricao > 4) {
            throw new IllegalArgumentException("Nutrição deve estar entre 1 e 4");
        }
    }

    private void validarFriccaoCisalhamento() {
        if (friccaoCisalhamento < 1 || friccaoCisalhamento > 3) {
            throw new IllegalArgumentException("Fricção e cisalhamento deve estar entre 1 e 3");
        }
    }
}