package com.sistemadesaude.backend.samu.entity;

import com.sistemadesaude.backend.samu.enums.RiscoPresumido;
import com.sistemadesaude.backend.unidadesaude.entity.UnidadeSaude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "samu_paciente_ocorrencia")
public class PacienteOcorrencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ocorrencia_id", nullable = false)
    private Ocorrencia ocorrencia;

    @Column(name = "nome_informado", nullable = false)
    private String nomeInformado;

    @Column(name = "idade_anos")
    private Integer idadeAnos;

    @Column(name = "idade_meses")
    private Integer idadeMeses;

    @Column(name = "sexo", length = 1)
    private String sexo;

    @Column(name = "queixa_especifica", columnDefinition = "TEXT")
    private String queixaEspecifica;

    // ========================================
    // 🏥 DADOS DE REGULAÇÃO MÉDICA
    // ========================================

    @Column(name = "hipotese_diagnostica", columnDefinition = "TEXT")
    private String hipoteseDiagnostica;

    @Enumerated(EnumType.STRING)
    @Column(name = "risco_presumido")
    private RiscoPresumido riscoPresumido;

    @Column(name = "quadro_clinico", columnDefinition = "TEXT")
    private String quadroClinico;

    @Column(name = "antecedentes", columnDefinition = "TEXT")
    private String antecedentes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_destino_id")
    private UnidadeSaude unidadeDestino;

    // ========================================
    // 🩺 SINAIS VITAIS
    // ========================================

    @Column(name = "pressao_arterial")
    private String pressaoArterial;

    @Column(name = "frequencia_cardiaca")
    private Integer frequenciaCardiaca;

    @Column(name = "frequencia_respiratoria")
    private Integer frequenciaRespiratoria;

    @Column(name = "saturacao_oxigenio")
    private Integer saturacaoOxigenio;

    @Column(name = "temperatura")
    private Double temperatura;

    @Column(name = "escala_glasgow")
    private Integer escalaGlasgow;

    // ========================================
    // 📅 DADOS DE CONTROLE
    // ========================================

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_regulacao")
    private LocalDateTime dataRegulacao;

    @PreUpdate
    private void preUpdate() {
        if (this.riscoPresumido != null && this.dataRegulacao == null) {
            this.dataRegulacao = LocalDateTime.now();
        }
    }

    // ========================================
    // 🔍 MÉTODOS HELPER
    // ========================================

    public boolean foiRegulado() {
        return this.riscoPresumido != null && this.hipoteseDiagnostica != null;
    }

    public String getIdadeFormatada() {
        if (idadeAnos != null && idadeAnos > 0) {
            return idadeAnos + " anos";
        } else if (idadeMeses != null && idadeMeses > 0) {
            return idadeMeses + " meses";
        }
        return "Idade não informada";
    }

    public boolean isPediatrico() {
        return (idadeAnos != null && idadeAnos < 18) ||
                (idadeAnos == null && idadeMeses != null);
    }

    public boolean isIdoso() {
        return idadeAnos != null && idadeAnos >= 65;
    }

    public boolean temSinaisVitaisCompletos() {
        return pressaoArterial != null &&
                frequenciaCardiaca != null &&
                frequenciaRespiratoria != null &&
                saturacaoOxigenio != null &&
                temperatura != null;
    }

    public boolean isRiscoAlto() {
        return riscoPresumido != null &&
                (RiscoPresumido.CRITICO.equals(riscoPresumido) ||
                        RiscoPresumido.ALTO.equals(riscoPresumido));
    }
}
