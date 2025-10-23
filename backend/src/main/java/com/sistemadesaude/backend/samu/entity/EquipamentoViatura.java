package com.sistemadesaude.backend.samu.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.time.LocalDate;

/**
 * 🔧 ENTIDADE EQUIPAMENTO DA VIATURA
 *
 * Representa equipamentos médicos e de segurança
 * disponíveis em uma viatura específica.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "samu_equipamento_viatura")
public class EquipamentoViatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viatura_id", nullable = false)
    private Viatura viatura;

    @Column(name = "nome_equipamento", nullable = false)
    private String nomeEquipamento;

    @Column(name = "categoria", nullable = false)
    private String categoria; // MONITORAMENTO, RESPIRATORIO, MEDICAMENTOS, SEGURANCA, COMUNICACAO

    @Column(name = "modelo")
    private String modelo;

    @Column(name = "numero_serie")
    private String numeroSerie;

    @Column(name = "status", nullable = false)
    private String status; // OPERACIONAL, MANUTENCAO, AVARIADO, INDISPONIVEL

    @Column(name = "quantidade")
    private Integer quantidade = 1;

    // Informações de validade (para medicamentos)
    @Column(name = "data_validade")
    private LocalDate dataValidade;

    @Column(name = "lote")
    private String lote;

    // Manutenção preventiva
    @Column(name = "data_ultima_manutencao")
    private LocalDate dataUltimaManutencao;

    @Column(name = "data_proxima_manutencao")
    private LocalDate dataProximaManutencao;

    @Column(name = "periodicidade_manutencao") // Em dias
    private Integer periodicidadeManutencao;

    // Calibração (para equipamentos de monitoramento)
    @Column(name = "data_ultima_calibracao")
    private LocalDate dataUltimaCalibracao;

    @Column(name = "data_proxima_calibracao")
    private LocalDate dataProximaCalibracao;

    @Column(name = "certificado_calibracao")
    private String certificadoCalibracao;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "obrigatorio")
    private Boolean obrigatorio = false; // Se é obrigatório para operação

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    // Métodos helper
    public boolean isOperacional() {
        return "OPERACIONAL".equals(status) && Boolean.TRUE.equals(ativo);
    }

    public boolean isVencido() {
        return dataValidade != null && dataValidade.isBefore(LocalDate.now());
    }

    public boolean precisaManutencao() {
        return dataProximaManutencao != null &&
                dataProximaManutencao.isBefore(LocalDate.now().plusDays(7)); // 7 dias de antecedência
    }

    public boolean precisaCalibracao() {
        return dataProximaCalibracao != null &&
                dataProximaCalibracao.isBefore(LocalDate.now().plusDays(15)); // 15 dias de antecedência
    }

    public String getStatusFormatado() {
        return switch (status) {
            case "OPERACIONAL" -> "Operacional";
            case "MANUTENCAO" -> "Em Manutenção";
            case "AVARIADO" -> "Avariado";
            case "INDISPONIVEL" -> "Indisponível";
            default -> status;
        };
    }

    public String getCategoriaFormatada() {
        return switch (categoria) {
            case "MONITORAMENTO" -> "Monitoramento";
            case "RESPIRATORIO" -> "Suporte Respiratório";
            case "MEDICAMENTOS" -> "Medicamentos";
            case "SEGURANCA" -> "Segurança";
            case "COMUNICACAO" -> "Comunicação";
            default -> categoria;
        };
    }

    public String getStatusAlerta() {
        if (isVencido()) return "VENCIDO";
        if (precisaManutencao()) return "MANUTENCAO_PENDENTE";
        if (precisaCalibracao()) return "CALIBRACAO_PENDENTE";
        if (!"OPERACIONAL".equals(status)) return "NAO_OPERACIONAL";
        return "OK";
    }

    public int getDiasParaVencimento() {
        if (dataValidade == null) return -1;
        return (int) LocalDate.now().until(dataValidade).getDays();
    }

    public int getDiasParaManutencao() {
        if (dataProximaManutencao == null) return -1;
        return (int) LocalDate.now().until(dataProximaManutencao).getDays();
    }

    public boolean isObrigatorio() {
        return Boolean.TRUE.equals(obrigatorio);
    }
}
