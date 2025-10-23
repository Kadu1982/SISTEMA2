package com.sistemadesaude.backend.samu.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 🚨 ENUM PARA CLASSIFICAÇÃO DE RISCO PRESUMIDO DO PACIENTE
 *
 * Baseado nos protocolos do SAMU para avaliação inicial
 * de gravidade do caso antes da chegada no local.
 */
@Getter
@RequiredArgsConstructor
public enum RiscoPresumido {

    /**
     * 🔴 RISCO IMINENTE DE MORTE
     * Situações que requerem intervenção imediata
     */
    CRITICO("Crítico", "Risco iminente de morte", "#DC2626", 1),

    /**
     * 🔴 RISCO ELEVADO
     * Situações graves que podem evoluir rapidamente
     */
    ALTO("Alto", "Risco elevado de complicações", "#EF4444", 2),

    /**
     * 🟡 RISCO MODERADO
     * Situações que requerem cuidados, mas estáveis
     */
    MODERADO("Moderado", "Risco moderado, paciente estável", "#F59E0B", 3),

    /**
     * 🟢 RISCO BAIXO
     * Situações simples, paciente consciente e orientado
     */
    BAIXO("Baixo", "Risco baixo, paciente estável", "#10B981", 4),

    /**
     * ⚪ RISCO INDETERMINADO
     * Quando não é possível avaliar pelo telefone
     */
    INDETERMINADO("Indeterminado", "Necessária avaliação presencial", "#6B7280", 5);

    private final String descricao;
    private final String detalhamento;
    private final String corHex;
    private final int prioridade; // 1 = maior prioridade

    /**
     * 🎯 Determina risco baseado em informações básicas
     */
    public static RiscoPresumido determinarRisco(String queixa, Integer idade, String sintomas) {
        if (queixa == null) return INDETERMINADO;

        String queixaLower = queixa.toLowerCase();

        // Situações críticas
        if (queixaLower.contains("parada") ||
                queixaLower.contains("inconsciente") ||
                queixaLower.contains("não responde") ||
                queixaLower.contains("sem pulso")) {
            return CRITICO;
        }

        // Situações de alto risco
        if (queixaLower.contains("dor no peito") ||
                queixaLower.contains("falta de ar grave") ||
                queixaLower.contains("convulsão") ||
                queixaLower.contains("sangramento intenso")) {
            return ALTO;
        }

        // Situações moderadas
        if (queixaLower.contains("febre alta") ||
                queixaLower.contains("vômito") ||
                queixaLower.contains("tontura") ||
                (idade != null && idade > 65)) {
            return MODERADO;
        }

        // Situações simples
        if (queixaLower.contains("ferimento leve") ||
                queixaLower.contains("mal estar") ||
                queixaLower.contains("dor leve")) {
            return BAIXO;
        }

        return INDETERMINADO;
    }

    /**
     * 🚑 Sugere tipo de viatura baseado no risco
     */
    public String sugerirTipoViatura() {
        return switch (this) {
            case CRITICO -> "UTI_MOVEL";
            case ALTO -> "USA"; // Unidade de Suporte Avançado
            case MODERADO -> "USB"; // Unidade de Suporte Básico
            case BAIXO -> "USB";
            case INDETERMINADO -> "USB";
        };
    }

    /**
     * ⏱️ Tempo máximo de resposta recomendado (em minutos)
     */
    public int getTempoMaximoResposta() {
        return switch (this) {
            case CRITICO -> 8;  // 8 minutos máximo
            case ALTO -> 15;    // 15 minutos máximo
            case MODERADO -> 30; // 30 minutos máximo
            case BAIXO -> 60;   // 1 hora máximo
            case INDETERMINADO -> 20; // 20 minutos para avaliar
        };
    }

    /**
     * 📋 Protocolo de atendimento recomendado
     */
    public String getProtocoloRecomendado() {
        return switch (this) {
            case CRITICO -> "Suporte avançado de vida, médico obrigatório";
            case ALTO -> "Suporte avançado de vida, médico recomendado";
            case MODERADO -> "Suporte básico de vida, enfermeiro";
            case BAIXO -> "Suporte básico de vida";
            case INDETERMINADO -> "Avaliação inicial no local";
        };
    }
}
