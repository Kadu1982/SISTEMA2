
package com.sistemadesaude.backend.triagem.dto;

import java.time.LocalDate;
import java.time.Period;

/**
 * 📋 DTO PARA PACIENTES AGUARDANDO TRIAGEM - CONVERTIDO PARA RECORD
 *
 * ✅ CORREÇÃO: Agora é um record - resolve o erro de acesso a prioridade()
 * Contém informações básicas dos pacientes que estão na fila
 * para triagem, incluindo dados de priorização.
 */
public record PacienteAguardandoTriagemDTO(
        // ========================================
        // 📋 DADOS BÁSICOS DO PACIENTE
        // ========================================
        Long pacienteId,
        String nomeCompleto,
        LocalDate dataNascimento,

        // ========================================
        // 📅 DADOS DO AGENDAMENTO
        // ========================================
        Long agendamentoId,
        String horarioRecepcao,
        String tipoConsulta,
        String especialidade,

        // ========================================
        // 🎯 DADOS DE PRIORIZAÇÃO
        // ========================================
        String prioridade
) {

    // ========================================
    // 🔧 MÉTODOS HELPER MANTIDOS
    // ========================================

    /**
     * 👶 CALCULA IDADE DO PACIENTE
     */
    public int getIdade() {
        if (dataNascimento == null) return 0;
        return Period.between(dataNascimento, LocalDate.now()).getYears();
    }

    /**
     * 👶 VERIFICA SE É CRIANÇA (≤12 anos)
     */
    public boolean isCrianca() {
        return getIdade() <= 12;
    }

    /**
     * 👴 VERIFICA SE É IDOSO (≥60 anos)
     */
    public boolean isIdoso() {
        return getIdade() >= 60;
    }

    /**
     * 🎯 VERIFICA SE TEM PRIORIDADE ESPECIAL
     */
    public boolean temPrioridadeEspecial() {
        return "IDOSO/CRIANÇA".equals(prioridade) ||
                "ESPERA LONGA".equals(prioridade);
    }

    /**
     * 🎨 OBTÉM COR DA PRIORIDADE PARA INTERFACE
     */
    public String getCorPrioridade() {
        return switch (prioridade) {
            case "IDOSO/CRIANÇA" -> "bg-purple-100 text-purple-800";
            case "ESPERA LONGA" -> "bg-red-100 text-red-800";
            case "ESPERA MÉDIA" -> "bg-yellow-100 text-yellow-800";
            default -> "bg-gray-100 text-gray-800";
        };
    }

    /**
     * 📊 OBTÉM NÍVEL DE PRIORIDADE NUMÉRICO (1-4)
     */
    public int getNivelPrioridade() {
        return switch (prioridade) {
            case "IDOSO/CRIANÇA" -> 1;
            case "ESPERA LONGA" -> 2;
            case "ESPERA MÉDIA" -> 3;
            default -> 4;
        };
    }

    /**
     * 🏥 OBTÉM ESPECIALIDADE OU "GERAL" SE NULO
     */
    public String getEspecialidadeFormatada() {
        return especialidade != null ? especialidade : "GERAL";
    }

    /**
     * 🩺 VERIFICA SE É CONSULTA ESPECIALIZADA
     */
    public boolean isConsultaEspecializada() {
        return especialidade != null &&
                !especialidade.equalsIgnoreCase("GERAL") &&
                !especialidade.equalsIgnoreCase("CONSULTA");
    }

    /**
     * 🕐 OBTÉM TIPO DE CONSULTA FORMATADO
     */
    public String getTipoConsultaFormatado() {
        if (tipoConsulta == null) return "Consulta";

        return switch (tipoConsulta.toUpperCase()) {
            case "URGENTE" -> "🚨 Urgente";
            case "RETORNO" -> "🔄 Retorno";
            case "PRIMEIRA_VEZ" -> "👤 Primeira Vez";
            case "PREVENTIVA" -> "🛡️ Preventiva";
            default -> tipoConsulta;
        };
    }

    /**
     * ⭐ OBTÉM DESCRIÇÃO COMPLETA DA PRIORIDADE
     */
    public String getDescricaoPrioridade() {
        return switch (prioridade) {
            case "IDOSO/CRIANÇA" -> "Paciente com prioridade especial (idade)";
            case "ESPERA LONGA" -> "Aguardando há mais de 2 horas";
            case "ESPERA MÉDIA" -> "Aguardando entre 1-2 horas";
            default -> "Sem prioridade especial";
        };
    }

    /**
     * 🎯 VERIFICA SE DEVE SER DESTACADO NA INTERFACE
     */
    public boolean deveSerDestacado() {
        return temPrioridadeEspecial() || isConsultaEspecializada();
    }
}
