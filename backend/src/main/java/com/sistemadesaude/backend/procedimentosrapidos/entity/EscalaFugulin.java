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
 * Entidade para Escala de Fugulin (Sistema de Classificação de Pacientes - SCP)
 * 
 * Pontuação total: 13-37 pontos
 * 
 * Classificação de Cuidado:
 * - 13-17: Cuidado Mínimo
 * - 18-22: Cuidado Intermediário
 * - 23-27: Cuidado de Alta Dependência
 * - 28-32: Cuidado Semi-Intensivo
 * - 33-37: Cuidado Intensivo
 * 
 * Referência: Sistema de Classificação de Pacientes de Fugulin
 */
@Entity
@Table(name = "escala_fugulin")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaFugulin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    /**
     * Estado mental (1-4 pontos)
     * 1 = Orientado no tempo e espaço
     * 2 = Confuso/Sonolento
     * 3 = Torporoso/Agitado
     * 4 = Inconsciente
     */
    @Column(name = "estado_mental", nullable = false)
    private Integer estadoMental;

    /**
     * Oxigenação (1-4 pontos)
     * 1 = Ar ambiente
     * 2 = Cateter nasal/Máscara
     * 3 = Máscara com reservatório/Ventilação não invasiva
     * 4 = Ventilação mecânica
     */
    @Column(name = "oxigenacao", nullable = false)
    private Integer oxigenacao;

    /**
     * Sinais vitais (1-4 pontos)
     * 1 = Controle de rotina (4/4h)
     * 2 = Controle de 2/2h ou 3/3h
     * 3 = Controle de 1/1h
     * 4 = Controle constante
     */
    @Column(name = "sinais_vitais", nullable = false)
    private Integer sinaisVitais;

    /**
     * Motilidade (1-4 pontos)
     * 1 = Movimenta todos os segmentos
     * 2 = Dificuldade para movimentar segmentos
     * 3 = Movimenta apenas extremidades
     * 4 = Imóvel
     */
    @Column(name = "motilidade", nullable = false)
    private Integer motilidade;

    /**
     * Deambulação (1-4 pontos)
     * 1 = Deambula
     * 2 = Locomove-se com auxílio
     * 3 = Restrito ao leito/cadeira de rodas
     * 4 = Restrito ao leito
     */
    @Column(name = "deambulacao", nullable = false)
    private Integer deambulacao;

    /**
     * Alimentação (1-4 pontos)
     * 1 = Auto-suficiente
     * 2 = Necessita de auxílio
     * 3 = Sonda nasoenteral/Gastrostomia
     * 4 = Parenteral
     */
    @Column(name = "alimentacao", nullable = false)
    private Integer alimentacao;

    /**
     * Cuidado corporal (1-4 pontos)
     * 1 = Auto-suficiente
     * 2 = Necessita de auxílio
     * 3 = Dependente (banho no leito)
     * 4 = Dependente total
     */
    @Column(name = "cuidado_corporal", nullable = false)
    private Integer cuidadoCorporal;

    /**
     * Eliminação (1-4 pontos)
     * 1 = Auto-suficiente
     * 2 = Necessita de auxílio
     * 3 = Incontinente/Sonda vesical/Fralda
     * 4 = Evacuação no leito
     */
    @Column(name = "eliminacao", nullable = false)
    private Integer eliminacao;

    /**
     * Terapêutica (1-5 pontos)
     * 1 = VO/IM/SC
     * 2 = EV contínua
     * 3 = EV múltipla
     * 4 = Quimioterapia
     * 5 = Drogas vasoativas
     */
    @Column(name = "terapeutica", nullable = false)
    private Integer terapeutica;

    @Column(name = "pontuacao_total", nullable = false)
    private Integer pontuacaoTotal;

    @Column(name = "classificacao_cuidado", nullable = false, length = 50)
    private String classificacaoCuidado;

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
     * Valida campos, calcula pontuação e classifica o cuidado antes de persistir
     */
    @PrePersist
    @PreUpdate
    public void validarECalcular() {
        // Valida campos
        validarEstadoMental();
        validarOxigenacao();
        validarSinaisVitais();
        validarMotilidade();
        validarDeambulacao();
        validarAlimentacao();
        validarCuidadoCorporal();
        validarEliminacao();
        validarTerapeutica();
        
        // Calcula pontuação total
        this.pontuacaoTotal = estadoMental + oxigenacao + sinaisVitais + 
                              motilidade + deambulacao + alimentacao + 
                              cuidadoCorporal + eliminacao + terapeutica;
        
        // Classifica o cuidado baseado na pontuação
        if (pontuacaoTotal <= 17) {
            this.classificacaoCuidado = "Cuidado Mínimo";
        } else if (pontuacaoTotal <= 22) {
            this.classificacaoCuidado = "Cuidado Intermediário";
        } else if (pontuacaoTotal <= 27) {
            this.classificacaoCuidado = "Cuidado de Alta Dependência";
        } else if (pontuacaoTotal <= 32) {
            this.classificacaoCuidado = "Cuidado Semi-Intensivo";
        } else {
            this.classificacaoCuidado = "Cuidado Intensivo";
        }

        // Atualiza timestamps
        if (this.dataCriacao == null) {
            this.dataCriacao = LocalDateTime.now();
        }
        this.dataAtualizacao = LocalDateTime.now();
    }

    private void validarEstadoMental() {
        if (estadoMental < 1 || estadoMental > 4) {
            throw new IllegalArgumentException("Estado mental deve estar entre 1 e 4");
        }
    }

    private void validarOxigenacao() {
        if (oxigenacao < 1 || oxigenacao > 4) {
            throw new IllegalArgumentException("Oxigenação deve estar entre 1 e 4");
        }
    }

    private void validarSinaisVitais() {
        if (sinaisVitais < 1 || sinaisVitais > 4) {
            throw new IllegalArgumentException("Sinais vitais deve estar entre 1 e 4");
        }
    }

    private void validarMotilidade() {
        if (motilidade < 1 || motilidade > 4) {
            throw new IllegalArgumentException("Motilidade deve estar entre 1 e 4");
        }
    }

    private void validarDeambulacao() {
        if (deambulacao < 1 || deambulacao > 4) {
            throw new IllegalArgumentException("Deambulação deve estar entre 1 e 4");
        }
    }

    private void validarAlimentacao() {
        if (alimentacao < 1 || alimentacao > 4) {
            throw new IllegalArgumentException("Alimentação deve estar entre 1 e 4");
        }
    }

    private void validarCuidadoCorporal() {
        if (cuidadoCorporal < 1 || cuidadoCorporal > 4) {
            throw new IllegalArgumentException("Cuidado corporal deve estar entre 1 e 4");
        }
    }

    private void validarEliminacao() {
        if (eliminacao < 1 || eliminacao > 4) {
            throw new IllegalArgumentException("Eliminação deve estar entre 1 e 4");
        }
    }

    private void validarTerapeutica() {
        if (terapeutica < 1 || terapeutica > 5) {
            throw new IllegalArgumentException("Terapêutica deve estar entre 1 e 5");
        }
    }
}