package com.sistemadesaude.backend.hospitalar.entity;

import com.sistemadesaude.backend.operador.entity.Operador;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Entidade para configurações específicas do Ambulatório Hospitalar
 */
@Entity
@Table(name = "ambulatorio_configuracoes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracaoAmbulatorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "unidade_id")
    private Long unidadeId;

    @Column(name = "especialidade_id")
    private Long especialidadeId;

    @Column(name = "chave_configuracao", nullable = false, length = 100)
    private String chaveConfiguracao;

    @Column(name = "valor_configuracao", length = 1000)
    private String valorConfiguracao;

    @Column(name = "tipo_configuracao")
    @Enumerated(EnumType.STRING)
    private TipoConfiguracao tipoConfiguracao;

    @Column(name = "descricao", length = 500)
    private String descricao;

    @Column(name = "ativa")
    private Boolean ativa = true;

    @Column(name = "obrigatoria")
    private Boolean obrigatoria = false;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_criacao_id", nullable = false)
    private Operador operadorCriacao;

    @Column(name = "data_ultima_alteracao")
    private LocalDateTime dataUltimaAlteracao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_alteracao_id")
    private Operador operadorAlteracao;

    @PrePersist
    protected void onCreate() {
        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }
        if (ativa == null) {
            ativa = true;
        }
        if (obrigatoria == null) {
            obrigatoria = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        dataUltimaAlteracao = LocalDateTime.now();
    }

    // Métodos utilitários para conversão de tipos
    public Integer getValorInteger() {
        try {
            return Integer.parseInt(valorConfiguracao);
        } catch (Exception e) {
            return null;
        }
    }

    public Boolean getValorBoolean() {
        return "true".equalsIgnoreCase(valorConfiguracao) || "1".equals(valorConfiguracao);
    }

    public LocalTime getValorTime() {
        try {
            return LocalTime.parse(valorConfiguracao);
        } catch (Exception e) {
            return null;
        }
    }

    public enum TipoConfiguracao {
        TEXTO,
        NUMERO,
        BOOLEAN,
        TEMPO,
        DATA,
        JSON,
        LISTA
    }

    // Constantes para configurações padrão do ambulatório
    public static class ChavesConfiguracao {
        public static final String HORARIO_FUNCIONAMENTO_INICIO = "HORARIO_FUNCIONAMENTO_INICIO";
        public static final String HORARIO_FUNCIONAMENTO_FIM = "HORARIO_FUNCIONAMENTO_FIM";
        public static final String INTERVALO_PADRAO_CONSULTA = "INTERVALO_PADRAO_CONSULTA";
        public static final String MAXIMO_AGENDAMENTOS_DIA = "MAXIMO_AGENDAMENTOS_DIA";
        public static final String PERMITE_AGENDAMENTO_MESMO_DIA = "PERMITE_AGENDAMENTO_MESMO_DIA";
        public static final String DIAS_ANTECEDENCIA_AGENDAMENTO = "DIAS_ANTECEDENCIA_AGENDAMENTO";
        public static final String PERMITE_ENCAIXE = "PERMITE_ENCAIXE";
        public static final String MAXIMO_ENCAIXES_DIA = "MAXIMO_ENCAIXES_DIA";
        public static final String TEMPO_TOLERANCIA_ATRASO = "TEMPO_TOLERANCIA_ATRASO";
        public static final String PERMITE_REAGENDAMENTO = "PERMITE_REAGENDAMENTO";
        public static final String NOTIFICACAO_CONFIRMACAO_ATIVA = "NOTIFICACAO_CONFIRMACAO_ATIVA";
        public static final String DIAS_CONFIRMACAO_ANTECIPADA = "DIAS_CONFIRMACAO_ANTECIPADA";
        public static final String PERMITE_RETORNO_AUTOMATICO = "PERMITE_RETORNO_AUTOMATICO";
        public static final String DIAS_PADRAO_RETORNO = "DIAS_PADRAO_RETORNO";
    }
}