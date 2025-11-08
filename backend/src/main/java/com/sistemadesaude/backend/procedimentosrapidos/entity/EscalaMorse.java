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
 * Entidade para Escala de Morse (Avaliação de Risco de Quedas)
 * 
 * Pontuação total: 0-125 pontos
 * 
 * Classificação de Risco:
 * - 0-24: Sem Risco
 * - 25-50: Baixo Risco
 * - >51: Alto Risco
 * 
 * Referência: Morse Fall Scale (MFS)
 */
@Entity
@Table(name = "escala_morse")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaMorse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    /**
     * Histórico de quedas
     * 0 = Não
     * 25 = Sim
     */
    @Column(name = "historico_quedas", nullable = false)
    private Integer historicoQuedas;

    /**
     * Diagnóstico secundário
     * 0 = Não
     * 15 = Sim
     */
    @Column(name = "diagnostico_secundario", nullable = false)
    private Integer diagnosticoSecundario;

    /**
     * Auxílio de marcha
     * 0 = Nenhum/Acamado/Cadeira de rodas
     * 15 = Muletas/Bengala/Andador
     * 30 = Mobiliário
     */
    @Column(name = "auxilio_marcha", nullable = false)
    private Integer auxilioMarcha;

    /**
     * Terapia endovenosa/Dispositivo EV
     * 0 = Não
     * 20 = Sim
     */
    @Column(name = "terapia_endovenosa", nullable = false)
    private Integer terapiaEndovenosa;

    /**
     * Marcha/Transferência
     * 0 = Normal/Acamado/Imóvel
     * 10 = Fraca
     * 20 = Comprometida/Cambaleante
     */
    @Column(name = "marcha", nullable = false)
    private Integer marcha;

    /**
     * Estado mental
     * 0 = Orientado/Capaz quanto à própria capacidade
     * 15 = Esquece limitações
     */
    @Column(name = "estado_mental", nullable = false)
    private Integer estadoMental;

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
        validarHistoricoQuedas();
        validarDiagnosticoSecundario();
        validarAuxilioMarcha();
        validarTerapiaEndovenosa();
        validarMarcha();
        validarEstadoMental();
        
        // Calcula pontuação total
        this.pontuacaoTotal = historicoQuedas + diagnosticoSecundario + 
                              auxilioMarcha + terapiaEndovenosa + 
                              marcha + estadoMental;
        
        // Classifica o risco baseado na pontuação
        if (pontuacaoTotal <= 24) {
            this.classificacaoRisco = "Sem Risco";
        } else if (pontuacaoTotal <= 50) {
            this.classificacaoRisco = "Baixo Risco";
        } else {
            this.classificacaoRisco = "Alto Risco";
        }

        // Atualiza timestamps
        if (this.dataCriacao == null) {
            this.dataCriacao = LocalDateTime.now();
        }
        this.dataAtualizacao = LocalDateTime.now();
    }

    private void validarHistoricoQuedas() {
        if (historicoQuedas != 0 && historicoQuedas != 25) {
            throw new IllegalArgumentException("Histórico de quedas deve ser 0 ou 25");
        }
    }

    private void validarDiagnosticoSecundario() {
        if (diagnosticoSecundario != 0 && diagnosticoSecundario != 15) {
            throw new IllegalArgumentException("Diagnóstico secundário deve ser 0 ou 15");
        }
    }

    private void validarAuxilioMarcha() {
        if (auxilioMarcha != 0 && auxilioMarcha != 15 && auxilioMarcha != 30) {
            throw new IllegalArgumentException("Auxílio de marcha deve ser 0, 15 ou 30");
        }
    }

    private void validarTerapiaEndovenosa() {
        if (terapiaEndovenosa != 0 && terapiaEndovenosa != 20) {
            throw new IllegalArgumentException("Terapia endovenosa deve ser 0 ou 20");
        }
    }

    private void validarMarcha() {
        if (marcha != 0 && marcha != 10 && marcha != 20) {
            throw new IllegalArgumentException("Marcha deve ser 0, 10 ou 20");
        }
    }

    private void validarEstadoMental() {
        if (estadoMental != 0 && estadoMental != 15) {
            throw new IllegalArgumentException("Estado mental deve ser 0 ou 15");
        }
    }
}