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
 * Entidade para Escala de Glasgow (Avaliação do Nível de Consciência)
 * 
 * Pontuação total: 3-15 pontos
 * 
 * Classificação:
 * - 3-8: Grave
 * - 9-12: Moderado
 * - 13-15: Leve
 * 
 * Referência: Glasgow Coma Scale (GCS)
 */
@Entity
@Table(name = "escala_glasgow")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaGlasgow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    /**
     * Abertura ocular (1-4 pontos)
     * 1 = Nenhuma
     * 2 = À dor
     * 3 = Ao comando verbal
     * 4 = Espontânea
     */
    @Column(name = "abertura_ocular", nullable = false)
    private Integer aberturaOcular;

    /**
     * Resposta verbal (1-5 pontos)
     * 1 = Nenhuma
     * 2 = Sons incompreensíveis
     * 3 = Palavras inapropriadas
     * 4 = Confuso
     * 5 = Orientado
     */
    @Column(name = "resposta_verbal", nullable = false)
    private Integer respostaVerbal;

    /**
     * Resposta motora (1-6 pontos)
     * 1 = Nenhuma
     * 2 = Extensão anormal (descerebração)
     * 3 = Flexão anormal (decorticação)
     * 4 = Retirada à dor
     * 5 = Localiza a dor
     * 6 = Obedece comandos
     */
    @Column(name = "resposta_motora", nullable = false)
    private Integer respostaMotora;

    @Column(name = "pontuacao_total", nullable = false)
    private Integer pontuacaoTotal;

    @Column(name = "classificacao_nivel_consciencia", nullable = false, length = 50)
    private String classificacaoNivelConsciencia;

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
     * Valida campos, calcula pontuação e classifica o nível de consciência antes de persistir
     */
    @PrePersist
    @PreUpdate
    public void validarECalcular() {
        // Valida campos
        validarAberturaOcular();
        validarRespostaVerbal();
        validarRespostaMotora();
        
        // Calcula pontuação total
        this.pontuacaoTotal = aberturaOcular + respostaVerbal + respostaMotora;
        
        // Classifica o nível de consciência baseado na pontuação
        if (pontuacaoTotal <= 8) {
            this.classificacaoNivelConsciencia = "Grave";
        } else if (pontuacaoTotal <= 12) {
            this.classificacaoNivelConsciencia = "Moderado";
        } else {
            this.classificacaoNivelConsciencia = "Leve";
        }

        // Atualiza timestamps
        if (this.dataCriacao == null) {
            this.dataCriacao = LocalDateTime.now();
        }
        this.dataAtualizacao = LocalDateTime.now();
    }

    private void validarAberturaOcular() {
        if (aberturaOcular < 1 || aberturaOcular > 4) {
            throw new IllegalArgumentException("Abertura ocular deve estar entre 1 e 4");
        }
    }

    private void validarRespostaVerbal() {
        if (respostaVerbal < 1 || respostaVerbal > 5) {
            throw new IllegalArgumentException("Resposta verbal deve estar entre 1 e 5");
        }
    }

    private void validarRespostaMotora() {
        if (respostaMotora < 1 || respostaMotora > 6) {
            throw new IllegalArgumentException("Resposta motora deve estar entre 1 e 6");
        }
    }
}