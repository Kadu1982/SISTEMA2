package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.paciente.entity.Paciente;
import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "classificacao_risco")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassificacaoRisco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(name = "atendimento_id")
    private Long atendimentoId;

    @Column(name = "protocolo_utilizado")
    @Enumerated(EnumType.STRING)
    private ProtocoloClassificacao protocoloUtilizado;

    @Column(name = "queixa_principal")
    private String queixaPrincipal;

    @Column(name = "observacoes_abordagem")
    private String observacoesAbordagem;

    @Column(name = "medicamentos_uso")
    private String medicamentosUso;

    // @Column(name = "alergias")
    // private String alergias;

    @Column(name = "reacoes_alergicas")
    private String reacoesAlergicas;

    @Column(name = "sinais_vitais")
    private String sinaisVitais; // JSON com PA, FC, FR, Temp, etc

    @Column(name = "sintoma_principal")
    private String sintomaPrincipal;

    @Column(name = "avaliacao_glasgow")
    private Integer avaliacaoGlasgow;

    @Column(name = "escala_dor")
    private Integer escalaDor;

    @Column(name = "cor_prioridade")
    @Enumerated(EnumType.STRING)
    private CorPrioridade corPrioridade;

    @Column(name = "tempo_max_espera")
    private Integer tempoMaxEspera; // em minutos

    @Column(name = "especialidade_sugerida")
    private String especialidadeSugerida;

    @Column(name = "risco_sepse")
    private Boolean riscoSepse = false;

    @Column(name = "data_classificacao", nullable = false)
    private LocalDateTime dataClassificacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_id", nullable = false)
    private Operador operador;

    @Column(name = "reavaliacao")
    private Boolean reavaliacao = false;

    @Column(name = "classificacao_anterior_id")
    private Long classificacaoAnteriorId;

    @Column(name = "encaminhamento_social")
    private Boolean encaminhamentoSocial = false;

    @Column(name = "observacoes_gerais")
    private String observacoesGerais;

    @PrePersist
    protected void onCreate() {
        if (dataClassificacao == null) {
            dataClassificacao = LocalDateTime.now();
        }
    }

    public enum ProtocoloClassificacao {
        HUMANIZA_SUS,
        MANCHESTER,
        INSTITUCIONAL
    }

    public enum CorPrioridade {
        AZUL,    // Não urgente
        VERDE,   // Pouco urgente
        AMARELO, // Urgente
        LARANJA, // Muito urgente
        VERMELHO // Emergência
    }
}