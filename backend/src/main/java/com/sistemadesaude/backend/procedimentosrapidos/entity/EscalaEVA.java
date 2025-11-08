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
 * Entidade para Escala EVA (Escala Visual Analógica de Dor)
 * 
 * Pontuação: 0-10
 * 
 * Classificação:
 * - 0: Sem dor
 * - 1-3: Dor leve
 * - 4-6: Dor moderada
 * - 7-9: Dor intensa
 * - 10: Dor insuportável
 * 
 * Referência: Visual Analog Scale (VAS)
 */
@Entity
@Table(name = "escala_eva")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaEVA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    /**
     * Pontuação da dor (0-10)
     * 0 = Sem dor
     * 10 = Pior dor imaginável
     */
    @Column(name = "pontuacao_dor", nullable = false)
    private Integer pontuacaoDor;

    @Column(name = "classificacao_dor", nullable = false, length = 50)
    private String classificacaoDor;

    /**
     * Localização da dor
     */
    @Column(name = "localizacao_dor", length = 200)
    private String localizacaoDor;

    /**
     * Características da dor (pulsátil, latejante, queimação, etc.)
     */
    @Column(name = "caracteristicas_dor", columnDefinition = "TEXT")
    private String caracteristicasDor;

    /**
     * Fatores que pioram a dor
     */
    @Column(name = "fatores_piora", columnDefinition = "TEXT")
    private String fatoresPiora;

    /**
     * Fatores que melhoram a dor
     */
    @Column(name = "fatores_melhora", columnDefinition = "TEXT")
    private String fatoresMelhora;

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
     * Valida campos e classifica a dor antes de persistir
     */
    @PrePersist
    @PreUpdate
    public void validarECalcular() {
        // Valida campos
        validarPontuacaoDor();
        
        // Classifica a dor baseado na pontuação
        if (pontuacaoDor == 0) {
            this.classificacaoDor = "Sem dor";
        } else if (pontuacaoDor <= 3) {
            this.classificacaoDor = "Dor leve";
        } else if (pontuacaoDor <= 6) {
            this.classificacaoDor = "Dor moderada";
        } else if (pontuacaoDor <= 9) {
            this.classificacaoDor = "Dor intensa";
        } else {
            this.classificacaoDor = "Dor insuportável";
        }

        // Atualiza timestamps
        if (this.dataCriacao == null) {
            this.dataCriacao = LocalDateTime.now();
        }
        this.dataAtualizacao = LocalDateTime.now();
    }

    private void validarPontuacaoDor() {
        if (pontuacaoDor < 0 || pontuacaoDor > 10) {
            throw new IllegalArgumentException("Pontuação da dor deve estar entre 0 e 10");
        }
    }
}