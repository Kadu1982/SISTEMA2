
package com.sistemadesaude.backend.samu.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * 🏢 ENTIDADE BASE OPERACIONAL SAMU
 *
 * Representa uma base física onde ficam estacionadas
 * as viaturas quando disponíveis para atendimento.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "samu_base_operacional")
public class BaseOperacional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "codigo", unique = true, nullable = false)
    private String codigo;

    @Column(name = "endereco", nullable = false)
    private String endereco;

    @Column(name = "cidade", nullable = false)
    private String cidade;

    @Column(name = "estado", nullable = false)
    private String estado;

    @Column(name = "cep")
    private String cep;

    // Coordenadas GPS
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    // Informações operacionais
    @Column(name = "ativa")
    private Boolean ativa = true;

    @Column(name = "horario_funcionamento")
    private String horarioFuncionamento;

    @Column(name = "capacidade_viaturas")
    private Integer capacidadeViaturas;

    // Informações de contato
    @Column(name = "telefone")
    private String telefone;

    @Column(name = "telefone_emergencia")
    private String telefoneEmergencia;

    @Column(name = "email")
    private String email;

    @Column(name = "responsavel")
    private String responsavel;

    // Relacionamento com central de regulação
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "central_regulacao_id", nullable = false)
    private CentralRegulacao centralRegulacao;

    // Relacionamentos
    @OneToMany(mappedBy = "base", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Viatura> viaturas = new ArrayList<>();

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    // ========================================
    // 🚀 MÉTODOS HELPER INTELIGENTES
    // ========================================

    /**
     * ✅ Verifica se a base está ativa
     */
    public boolean isAtiva() {
        return Boolean.TRUE.equals(ativa);
    }

    /**
     * 🚑 Obtém quantidade de viaturas disponíveis
     */
    public long getQuantidadeViaturasDisponiveis() {
        return viaturas.stream()
                .filter(v -> Boolean.TRUE.equals(v.getAtiva()) && v.isDisponivel())
                .count();
    }

    /**
     * 📊 Obtém quantidade total de viaturas ativas
     */
    public long getQuantidadeViaturasTotal() {
        return viaturas.stream()
                .filter(v -> Boolean.TRUE.equals(v.getAtiva()))
                .count();
    }

    /**
     * 🚑 Obtém viaturas em operação
     */
    public long getQuantidadeViaturasEmOperacao() {
        return viaturas.stream()
                .filter(v -> Boolean.TRUE.equals(v.getAtiva()) && v.isEmOperacao())
                .count();
    }

    /**
     * 🔧 Obtém viaturas em manutenção
     */
    public long getQuantidadeViaturasManutencao() {
        return viaturas.stream()
                .filter(v -> Boolean.TRUE.equals(v.getAtiva()) && v.precisaManutencao())
                .count();
    }

    /**
     * 📈 Calcula percentual de ocupação da base
     */
    public Double getPercentualOcupacao() {
        if (capacidadeViaturas == null || capacidadeViaturas == 0) return 0.0;
        return ((double) getQuantidadeViaturasTotal() / capacidadeViaturas.doubleValue()) * 100;
    }

    /**
     * 📊 Calcula percentual de disponibilidade operacional
     */
    public Double getPercentualDisponibilidade() {
        long total = getQuantidadeViaturasTotal();
        if (total == 0) return 0.0;
        return ((double) getQuantidadeViaturasDisponiveis() / total) * 100;
    }

    /**
     * 🚨 Obtém status operacional da base
     */
    public String getStatusOperacional() {
        if (!isAtiva()) return "INATIVA";

        long disponiveis = getQuantidadeViaturasDisponiveis();
        long total = getQuantidadeViaturasTotal();

        if (total == 0) return "SEM_VIATURAS";
        if (disponiveis == 0) return "SEM_VIATURAS_DISPONIVEIS";
        if (disponiveis == total) return "TODAS_DISPONIVEIS";

        double percentualDisponivel = ((double) disponiveis / total) * 100;

        if (percentualDisponivel >= 80) return "BOA_DISPONIBILIDADE";
        if (percentualDisponivel >= 50) return "DISPONIBILIDADE_MEDIA";
        if (percentualDisponivel >= 20) return "BAIXA_DISPONIBILIDADE";
        return "DISPONIBILIDADE_CRITICA";
    }

    /**
     * 🎨 Obtém cor para interface baseada no status
     */
    public String getCorInterface() {
        return switch (getStatusOperacional()) {
            case "TODAS_DISPONIVEIS", "BOA_DISPONIBILIDADE" -> "success";
            case "DISPONIBILIDADE_MEDIA" -> "warning";
            case "BAIXA_DISPONIBILIDADE", "DISPONIBILIDADE_CRITICA" -> "error";
            case "SEM_VIATURAS_DISPONIVEIS" -> "error";
            case "INATIVA", "SEM_VIATURAS" -> "default";
            default -> "info";
        };
    }

    /**
     * 📋 Obtém resumo para dashboard
     */
    public String getResumoOperacional() {
        long disponiveis = getQuantidadeViaturasDisponiveis();
        long total = getQuantidadeViaturasTotal();
        long emOperacao = getQuantidadeViaturasEmOperacao();

        return String.format("%d/%d disponíveis (%d em operação)",
                disponiveis, total, emOperacao);
    }

    /**
     * 🎯 Verifica se pode receber nova viatura
     */
    public boolean podeReceberNovaViatura() {
        if (!isAtiva()) return false;
        if (capacidadeViaturas == null) return true;
        return getQuantidadeViaturasTotal() < capacidadeViaturas;
    }

    /**
     * 🚑 Obtém melhor viatura disponível por tipo
     */
    public Viatura getMelhorViaturaDisponivel(String tipoDesejado) {
        return viaturas.stream()
                .filter(v -> Boolean.TRUE.equals(v.getAtiva()) && v.isDisponivel())
                .filter(v -> tipoDesejado == null || tipoDesejado.equals(v.getTipo().name()))
                .max((v1, v2) -> Double.compare(
                        v1.calcularNivelProntidao(),
                        v2.calcularNivelProntidao()
                ))
                .orElse(null);
    }

    /**
     * ⚠️ Obtém alertas da base
     */
    public List<String> getAlertas() {
        List<String> alertas = new ArrayList<>();

        if (!isAtiva()) {
            alertas.add("Base inativa");
        }

        if (getQuantidadeViaturasDisponiveis() == 0) {
            alertas.add("Nenhuma viatura disponível");
        }

        if (getPercentualDisponibilidade() < 20) {
            alertas.add("Disponibilidade crítica (" +
                    String.format("%.1f%%", getPercentualDisponibilidade()) + ")");
        }

        long manutencoes = getQuantidadeViaturasManutencao();
        if (manutencoes > 0) {
            alertas.add(manutencoes + " viatura(s) em manutenção");
        }

        // Verificar viaturas com tempo excessivo no status
        long viaturasComProblema = viaturas.stream()
                .filter(v -> Boolean.TRUE.equals(v.getAtiva()) && v.isTempoExcessivoNoStatus())
                .count();

        if (viaturasComProblema > 0) {
            alertas.add(viaturasComProblema + " viatura(s) com tempo excessivo no status");
        }

        return alertas;
    }

    /**
     * 📊 Obtém estatísticas detalhadas
     */
    public java.util.Map<String, Object> getEstatisticasDetalhadas() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();

        stats.put("total", getQuantidadeViaturasTotal());
        stats.put("disponiveis", getQuantidadeViaturasDisponiveis());
        stats.put("emOperacao", getQuantidadeViaturasEmOperacao());
        stats.put("manutencao", getQuantidadeViaturasManutencao());
        stats.put("percentualOcupacao", getPercentualOcupacao());
        stats.put("percentualDisponibilidade", getPercentualDisponibilidade());
        stats.put("statusOperacional", getStatusOperacional());
        stats.put("alertas", getAlertas());

        // Estatísticas por tipo de viatura
        java.util.Map<String, Long> porTipo = viaturas.stream()
                .filter(v -> Boolean.TRUE.equals(v.getAtiva()))
                .collect(java.util.stream.Collectors.groupingBy(
                        v -> v.getTipo().name(),
                        java.util.stream.Collectors.counting()
                ));
        stats.put("porTipo", porTipo);

        return stats;
    }

    /**
     * 🔍 Busca viaturas por critérios
     */
    public List<Viatura> buscarViaturas(String status, String tipo, Boolean apenasDisponiveis) {
        return viaturas.stream()
                .filter(v -> Boolean.TRUE.equals(v.getAtiva()))
                .filter(v -> status == null || status.equals(v.getStatus().name()))
                .filter(v -> tipo == null || tipo.equals(v.getTipo().name()))
                .filter(v -> !Boolean.TRUE.equals(apenasDisponiveis) || v.isDisponivel())
                .toList();
    }

    /**
     * 📍 Calcula distância para coordenadas (em km)
     */
    public Double calcularDistanciaPara(Double lat, Double lng) {
        if (latitude == null || longitude == null || lat == null || lng == null) {
            return null;
        }

        // Fórmula de Haversine para cálculo de distância
        double R = 6371; // Raio da Terra em km
        double dLat = Math.toRadians(lat - latitude);
        double dLng = Math.toRadians(lng - longitude);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(latitude)) * Math.cos(Math.toRadians(lat)) *
                        Math.sin(dLng/2) * Math.sin(dLng/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
}
