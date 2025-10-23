package com.sistemadesaude.backend.recepcao.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 🩺 ENUM PARA TIPOS DE CONSULTA NO SISTEMA
 *
 * Define os diferentes tipos de atendimento que podem ser realizados
 * no sistema de saúde.
 */
@Getter
@RequiredArgsConstructor
public enum TipoConsulta {

    /**
     * 👨‍⚕️ CONSULTA MÉDICA PADRÃO
     * Consulta médica comum com clínico geral ou especialista
     */
    CONSULTA("Consulta Médica", "Consulta médica padrão", 60, false),

    /**
     * 🚨 CONSULTA DE URGÊNCIA
     * Atendimento para casos que necessitam atenção rápida
     */
    URGENCIA("Urgência", "Atendimento de urgência", 30, true),

    /**
     * 🆘 CONSULTA DE EMERGÊNCIA
     * Casos críticos que requerem atendimento imediato
     */
    EMERGENCIA("Emergência", "Atendimento de emergência", 15, true),

    /**
     * 🔄 RETORNO MÉDICO
     * Consulta de seguimento para paciente já em tratamento
     */
    RETORNO("Retorno", "Consulta de retorno", 30, false),

    /**
     * 💉 PROCEDIMENTO MÉDICO
     * Realização de procedimentos específicos
     */
    PROCEDIMENTO("Procedimento", "Procedimento médico", 45, false),

    /**
     * 🔍 CONSULTA ESPECIALIZADA
     * Atendimento com médico especialista
     */
    ESPECIALIZADA("Especializada", "Consulta com especialista", 90, false),

    /**
     * 🩺 TRIAGEM
     * Classificação de risco inicial
     */
    TRIAGEM("Triagem", "Classificação de risco", 20, true),

    /**
     * 💊 CONSULTA FARMACÊUTICA
     * Atendimento farmacêutico
     */
    FARMACEUTICA("Farmacêutica", "Consulta farmacêutica", 30, false),

    /**
     * 🧠 CONSULTA PSICOLÓGICA
     * Atendimento psicológico
     */
    PSICOLOGICA("Psicológica", "Consulta psicológica", 50, false),

    /**
     * 🏥 PRÉ-OPERATÓRIO
     * Consulta de avaliação pré-operatória
     */
    PRE_OPERATORIO("Pré-operatório", "Avaliação pré-operatória", 45, false),

    /**
     * 🔄 PÓS-OPERATÓRIO
     * Consulta de acompanhamento pós-operatório
     */
    POS_OPERATORIO("Pós-operatório", "Acompanhamento pós-operatório", 30, false);

    private final String descricao;
    private final String detalhamento;
    private final int duracaoMinutos; // Duração estimada em minutos
    private final boolean isPrioritario; // Se requer prioridade no atendimento

    /**
     * 🎯 Verifica se é um tipo de consulta prioritária
     */
    public boolean isPrioritario() {
        return isPrioritario;
    }

    /**
     * ⏰ Obtém duração estimada da consulta
     */
    public int getDuracaoMinutos() {
        return duracaoMinutos;
    }

    /**
     * 🎨 Obtém cor para interface baseada no tipo
     */
    public String getCorInterface() {
        return switch (this) {
            case EMERGENCIA -> "red";
            case URGENCIA -> "orange";
            case TRIAGEM -> "yellow";
            case CONSULTA -> "blue";
            case ESPECIALIZADA -> "purple";
            case RETORNO -> "green";
            case PROCEDIMENTO -> "cyan";
            case FARMACEUTICA -> "teal";
            case PSICOLOGICA -> "pink";
            case PRE_OPERATORIO -> "indigo";
            case POS_OPERATORIO -> "violet";
        };
    }

    /**
     * 📊 Obtém categoria para relatórios
     */
    public String getCategoria() {
        return switch (this) {
            case EMERGENCIA, URGENCIA -> "URGENCIA_EMERGENCIA";
            case TRIAGEM -> "TRIAGEM";
            case CONSULTA, RETORNO -> "CONSULTA_GERAL";
            case ESPECIALIZADA -> "ESPECIALIDADE";
            case PROCEDIMENTO -> "PROCEDIMENTO";
            case FARMACEUTICA, PSICOLOGICA -> "CONSULTA_ESPECIALIZADA";
            case PRE_OPERATORIO, POS_OPERATORIO -> "CIRURGIA";
        };
    }

    /**
     * 🏥 Verifica se requer sala especializada
     */
    public boolean requerSalaEspecializada() {
        return switch (this) {
            case EMERGENCIA, PROCEDIMENTO, PRE_OPERATORIO, POS_OPERATORIO -> true;
            case URGENCIA, TRIAGEM, CONSULTA, RETORNO, ESPECIALIZADA, FARMACEUTICA, PSICOLOGICA -> false;
        };
    }

    /**
     * 👨‍⚕️ Tipos de profissionais que podem realizar este tipo de consulta
     */
    public String[] getProfissionaisPermitidos() {
        return switch (this) {
            case CONSULTA, RETORNO -> new String[]{"MEDICO", "ENFERMEIRO"};
            case URGENCIA, EMERGENCIA -> new String[]{"MEDICO"};
            case ESPECIALIZADA -> new String[]{"MEDICO_ESPECIALISTA"};
            case TRIAGEM -> new String[]{"ENFERMEIRO", "TECNICO_ENFERMAGEM"};
            case PROCEDIMENTO -> new String[]{"MEDICO", "ENFERMEIRO", "TECNICO"};
            case FARMACEUTICA -> new String[]{"FARMACEUTICO"};
            case PSICOLOGICA -> new String[]{"PSICOLOGO"};
            case PRE_OPERATORIO, POS_OPERATORIO -> new String[]{"MEDICO", "ANESTESISTA"};
        };
    }

    /**
     * 📋 Obtém próximo tipo de consulta sugerido
     */
    public TipoConsulta getProximoTipoSugerido() {
        return switch (this) {
            case TRIAGEM -> CONSULTA;
            case EMERGENCIA, URGENCIA -> RETORNO;
            case CONSULTA -> RETORNO;
            case PRE_OPERATORIO -> POS_OPERATORIO;
            case RETORNO, ESPECIALIZADA, PROCEDIMENTO, FARMACEUTICA, PSICOLOGICA, POS_OPERATORIO -> null;
        };
    }
}
