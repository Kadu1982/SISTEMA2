package com.sistemadesaude.backend.samu.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 👤 ENUM PARA STATUS ATUAL DO PACIENTE DURANTE A OCORRÊNCIA
 *
 * Representa o estado clínico do paciente conforme avaliação
 * da equipe SAMU no local da ocorrência.
 */
@Getter
@RequiredArgsConstructor
public enum StatusPaciente {

    /**
     * 🆘 PARADA CARDIORRESPIRATÓRIA
     * Paciente em PCR, necessita RCP imediata
     */
    PARADA_CARDIORRESPIRATORIA("Parada Cardiorrespiratória", "PCR em andamento", "#7F1D1D", true),

    /**
     * 🔴 CRÍTICO
     * Paciente em estado crítico, risco iminente
     */
    CRITICO("Crítico", "Estado crítico, instável", "#DC2626", true),

    /**
     * 🟠 GRAVE
     * Paciente grave mas com sinais vitais presentes
     */
    GRAVE("Grave", "Estado grave, necessita cuidados intensivos", "#EA580C", true),

    /**
     * 🟡 MODERADO
     * Paciente com alterações mas estável
     */
    MODERADO("Moderado", "Estado moderado, estável", "#D97706", false),

    /**
     * 🟢 ESTÁVEL
     * Paciente estável, sem risco imediato
     */
    ESTAVEL("Estável", "Paciente estável, consciente", "#059669", false),

    /**
     * 🟢 LEVE
     * Lesões/sintomas leves, paciente bem
     */
    LEVE("Leve", "Quadro leve, paciente orientado", "#10B981", false),

    /**
     * ❌ RECUSA ATENDIMENTO
     * Paciente recusou ser atendido
     */
    RECUSA_ATENDIMENTO("Recusa Atendimento", "Paciente recusou atendimento", "#6B7280", false),

    /**
     * 🏃 EVASÃO
     * Paciente evadiu-se do local
     */
    EVASAO("Evasão", "Paciente saiu do local", "#6B7280", false),

    /**
     * ⚫ ÓBITO
     * Paciente em óbito
     */
    OBITO("Óbito", "Paciente em óbito", "#1F2937", true),

    /**
     * 🚑 TRANSPORTADO
     * Paciente sendo transportado
     */
    TRANSPORTADO("Transportado", "Em transporte para hospital", "#3B82F6", false),

    /**
     * 🏥 ENTREGUE NO HOSPITAL
     * Paciente entregue na unidade de destino
     */
    ENTREGUE_HOSPITAL("Entregue no Hospital", "Paciente entregue na unidade", "#059669", false);

    private final String descricao;
    private final String detalhamento;
    private final String corHex;
    private final boolean critico; // Se requer atenção crítica

    /**
     * 🎯 Determina status baseado em sinais vitais
     */
    public static StatusPaciente determinarStatus(
            Integer frequenciaCardiaca,
            Integer saturacaoOxigenio,
            String pressaoArterial,
            String nivelConsciencia) {

        // Verificar parada cardiorrespiratória
        if ((frequenciaCardiaca != null && frequenciaCardiaca == 0) ||
                (saturacaoOxigenio != null && saturacaoOxigenio < 70) ||
                (nivelConsciencia != null && nivelConsciencia.toLowerCase().contains("inconsciente"))) {
            return PARADA_CARDIORRESPIRATORIA;
        }

        // Estado crítico
        if ((frequenciaCardiaca != null && (frequenciaCardiaca < 50 || frequenciaCardiaca > 150)) ||
                (saturacaoOxigenio != null && saturacaoOxigenio < 85) ||
                isPressaoArterialCritica(pressaoArterial)) {
            return CRITICO;
        }

        // Estado grave
        if ((frequenciaCardiaca != null && (frequenciaCardiaca < 60 || frequenciaCardiaca > 120)) ||
                (saturacaoOxigenio != null && saturacaoOxigenio < 90)) {
            return GRAVE;
        }

        // Estado moderado
        if ((frequenciaCardiaca != null && (frequenciaCardiaca < 70 || frequenciaCardiaca > 100)) ||
                (saturacaoOxigenio != null && saturacaoOxigenio < 95)) {
            return MODERADO;
        }

        // Se todos os sinais estão normais
        return ESTAVEL;
    }

    /**
     * 🔍 Verifica se pressão arterial está em nível crítico
     */
    private static boolean isPressaoArterialCritica(String pressaoArterial) {
        if (pressaoArterial == null) return false;
        try {
            String[] partes = pressaoArterial.split("x|/");
            if (partes.length >= 2) {
                int sistolica = Integer.parseInt(partes[0].trim());
                int diastolica = Integer.parseInt(partes[1].trim());
                return sistolica < 90 || sistolica > 200 || diastolica < 60 || diastolica > 120;
            }
        } catch (NumberFormatException e) {
            return false;
        }
        return false;
    }

    /**
     * 🚑 Sugere prioridade de transporte
     */
    public String getPrioridadeTransporte() {
        return switch (this) {
            case PARADA_CARDIORRESPIRATORIA, CRITICO -> "VERMELHO"; // Emergência
            case GRAVE -> "LARANJA"; // Urgência
            case MODERADO -> "AMARELO"; // Prioridade
            case ESTAVEL, LEVE -> "VERDE"; // Eletivo
            case TRANSPORTADO -> "EM_TRANSPORTE";
            default -> "AVALIAR";
        };
    }

    /**
     * 🏥 Sugere tipo de destino hospitalar
     */
    public String sugerirDestinoHospitalar() {
        return switch (this) {
            case PARADA_CARDIORRESPIRATORIA, CRITICO -> "UTI";
            case GRAVE -> "EMERGENCIA_TRAUMA";
            case MODERADO -> "EMERGENCIA";
            case ESTAVEL, LEVE -> "PRONTO_ATENDIMENTO";
            default -> "EMERGENCIA";
        };
    }

    /**
     * 📋 Retorna procedimentos recomendados
     */
    public String getProcedimentosRecomendados() {
        return switch (this) {
            case PARADA_CARDIORRESPIRATORIA -> "RCP, desfibrilação, intubação, drogas vasoativas";
            case CRITICO -> "Monitorização contínua, acesso venoso calibroso, O2 alto fluxo";
            case GRAVE -> "Monitorização, acesso venoso, oxigenoterapia";
            case MODERADO -> "Sinais vitais, acesso venoso, observação";
            case ESTAVEL, LEVE -> "Avaliação básica, conforto";
            case TRANSPORTADO -> "Monitorização durante transporte";
            default -> "Avaliação inicial";
        };
    }

    /**
     * ⏱️ Tempo máximo recomendado no local (em minutos)
     */
    public int getTempoMaximoNoLocal() {
        return switch (this) {
            case PARADA_CARDIORRESPIRATORIA -> 5; // Sair o mais rápido possível
            case CRITICO -> 10; // Estabilizar minimamente
            case GRAVE -> 15; // Procedimentos essenciais
            case MODERADO -> 20; // Avaliação completa
            case ESTAVEL, LEVE -> 30; // Sem pressa
            default -> 15;
        };
    }
}
