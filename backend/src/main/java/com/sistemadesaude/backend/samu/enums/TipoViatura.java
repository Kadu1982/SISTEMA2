package com.sistemadesaude.backend.samu.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 🚑 ENUM PARA TIPOS DE VIATURAS SAMU
 *
 * Baseado nos padrões do SAMU brasileiro para classificação
 * de ambulâncias e veículos de resgate.
 */
@Getter
@RequiredArgsConstructor
public enum TipoViatura {

    /**
     * 🚑 USB - UNIDADE DE SUPORTE BÁSICO
     * Ambulância com equipamentos básicos de emergência
     */
    USB("Unidade de Suporte Básico", "Ambulância tipo B - suporte básico", "#10B981", 2),

    /**
     * 🚑 USA - UNIDADE DE SUPORTE AVANÇADO
     * Ambulância com equipamentos avançados e médico
     */
    USA("Unidade de Suporte Avançado", "Ambulância tipo D - suporte avançado", "#F59E0B", 1),

    /**
     * 🏥 UTI_MOVEL - UTI MÓVEL
     * Unidade de terapia intensiva móvel
     */
    UTI_MOVEL("UTI Móvel", "Unidade de Terapia Intensiva Móvel", "#DC2626", 1),

    /**
     * 🚁 HELICOPTERO - HELICÓPTERO DE RESGATE
     * Aeronave para resgate aéreo
     */
    HELICOPTERO("Helicóptero", "Aeronave de resgate médico", "#7C2D12", 1),

    /**
     * 🛥️ MOTOLANCIA - MOTOLÂNCIA
     * Embarcação para resgate aquático
     */
    MOTOLANCIA("Motolância", "Embarcação de resgate aquático", "#1E40AF", 2),

    /**
     * 🏍️ MOTOCICLETA - MOTOCICLETA DE EMERGÊNCIA
     * Motocicleta para acesso rápido em trânsito
     */
    MOTOCICLETA("Motocicleta", "Motocicleta de emergência médica", "#059669", 3),

    /**
     * 🚐 VIR - VEÍCULO DE INTERVENÇÃO RÁPIDA
     * Veículo leve para primeiros socorros
     */
    VIR("Veículo de Intervenção Rápida", "Veículo leve para intervenção", "#6366F1", 3),

    /**
     * 🚛 UNIDADE_RESGATE - UNIDADE DE RESGATE
     * Veículo especializado em resgate técnico
     */
    UNIDADE_RESGATE("Unidade de Resgate", "Veículo de resgate técnico", "#7C2D12", 2);

    private final String descricao;
    private final String detalhamento;
    private final String corHex;
    private final int capacidadePacientes;

    /**
     * 🎯 Sugere tipo de viatura baseado na situação
     */
    public static TipoViatura sugerirPorSituacao(String situacao, String local) {
        if (situacao == null) return USB;

        String sit = situacao.toLowerCase();
        String loc = local != null ? local.toLowerCase() : "";

        // Situações críticas = UTI ou USA
        if (sit.contains("parada") || sit.contains("infarto") || sit.contains("avc")) {
            return UTI_MOVEL;
        }

        // Situações aquáticas = Motolância
        if (loc.contains("rio") || loc.contains("lago") || loc.contains("praia") ||
                loc.contains("represa") || sit.contains("afogamento")) {
            return MOTOLANCIA;
        }

        // Situações de altura ou acesso difícil = Helicóptero
        if (loc.contains("montanha") || loc.contains("serra") || loc.contains("rodovia") ||
                sit.contains("acidente grave") || loc.contains("área rural")) {
            return HELICOPTERO;
        }

        // Trânsito intenso = Motocicleta
        if (loc.contains("centro") || loc.contains("trânsito") ||
                sit.contains("mal súbito") || sit.contains("convulsão")) {
            return MOTOCICLETA;
        }

        // Situações graves = USA
        if (sit.contains("grave") || sit.contains("trauma") ||
                sit.contains("ferimento") || sit.contains("acidente")) {
            return USA;
        }

        // Padrão = USB
        return USB;
    }

    /**
     * 🏥 Nível de atendimento médico
     */
    public String getNivelAtendimento() {
        return switch (this) {
            case UTI_MOVEL -> "UTI";
            case USA, HELICOPTERO -> "AVANCADO";
            case USB, MOTOLANCIA, UNIDADE_RESGATE -> "BASICO";
            case MOTOCICLETA, VIR -> "PRIMEIRO_SOCORRO";
        };
    }

    /**
     * 👨‍⚕️ Equipe mínima requerida
     */
    public String getEquipeMinima() {
        return switch (this) {
            case UTI_MOVEL -> "Médico + Enfermeiro + Condutor";
            case USA -> "Enfermeiro + Técnico + Condutor";
            case HELICOPTERO -> "Médico + Enfermeiro + Piloto + Mecânico";
            case USB -> "Técnico + Auxiliar + Condutor";
            case MOTOLANCIA -> "Técnico + Condutor";
            case MOTOCICLETA -> "Socorrista";
            case VIR -> "Técnico + Condutor";
            case UNIDADE_RESGATE -> "Bombeiro + Técnico + Condutor";
        };
    }

    /**
     * ⏱️ Tempo médio de resposta (em minutos)
     */
    public int getTempoMedioResposta() {
        return switch (this) {
            case MOTOCICLETA -> 5;  // Mais rápida no trânsito
            case VIR -> 8;          // Veículo leve
            case USB -> 12;         // Ambulância padrão
            case USA -> 15;         // Ambulância equipada
            case UTI_MOVEL -> 18;   // UTI completa
            case HELICOPTERO -> 20; // Depende de autorização de voo
            case MOTOLANCIA -> 25;  // Acesso aquático
            case UNIDADE_RESGATE -> 30; // Equipamentos especiais
        };
    }

    /**
     * 💰 Custo operacional por hora (estimado)
     */
    public double getCustoOperacionalHora() {
        return switch (this) {
            case HELICOPTERO -> 5000.0;    // Muito alto
            case UTI_MOVEL -> 800.0;       // Alto
            case USA -> 600.0;             // Médio-alto
            case UNIDADE_RESGATE -> 500.0; // Médio
            case USB -> 400.0;             // Padrão
            case MOTOLANCIA -> 350.0;      // Médio-baixo
            case VIR -> 200.0;             // Baixo
            case MOTOCICLETA -> 100.0;     // Muito baixo
        };
    }
}
