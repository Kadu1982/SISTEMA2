package com.sistemadesaude.backend.samu.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 🚑 ENUM PARA STATUS OPERACIONAL DAS VIATURAS
 *
 * Controla o status operacional das viaturas SAMU
 * para gestão de disponibilidade e rastreamento.
 */
@Getter
@RequiredArgsConstructor
public enum StatusViatura {

    /**
     * 🟢 DISPONÍVEL
     * Viatura disponível na base para atendimento
     */
    DISPONIVEL("Disponível", "Viatura pronta para atendimento na base", "#10B981", true),

    /**
     * 🟡 A CAMINHO
     * Viatura deslocando para o local da ocorrência
     */
    A_CAMINHO("A Caminho", "Deslocando para local da ocorrência", "#F59E0B", false),

    /**
     * 🔴 NO LOCAL
     * Viatura chegou ao local da ocorrência
     */
    NO_LOCAL("No Local", "Atendendo ocorrência no local", "#EF4444", false),

    /**
     * 🔵 TRANSPORTANDO
     * Viatura transportando paciente para hospital
     */
    TRANSPORTANDO("Transportando", "Transportando paciente", "#3B82F6", false),

    /**
     * ⚫ INDISPONÍVEL
     * Viatura não pode atender (manutenção, abastecimento, etc.)
     */
    INDISPONIVEL("Indisponível", "Viatura temporariamente indisponível", "#6B7280", false),

    /**
     * 🔧 MANUTENCAO
     * Viatura em manutenção preventiva ou corretiva
     */
    MANUTENCAO("Manutenção", "Em manutenção preventiva ou corretiva", "#92400E", false),

    /**
     * ⛽ ABASTECIMENTO
     * Viatura realizando abastecimento/reposição
     */
    ABASTECIMENTO("Abastecimento", "Realizando abastecimento ou reposição", "#059669", false),

    /**
     * ⚠️ AVARIADA
     * Viatura com avaria que impede operação
     */
    AVARIADA("Avariada", "Viatura com avaria, necessita reparo", "#DC2626", false),

    /**
     * 🏁 FINALIZANDO
     * Viatura finalizando atendimento, retornando à base
     */
    FINALIZANDO("Finalizando", "Finalizando atendimento", "#7C3AED", false),

    /**
     * 📋 REGULACAO
     * Viatura aguardando definição de regulação médica
     */
    REGULACAO("Regulação", "Aguardando regulação médica", "#F97316", false);

    private final String descricao;
    private final String detalhamento;
    private final String corHex;
    private final boolean disponivel; // Se pode receber nova solicitação

    /**
     * 🎯 Lista status que permitem nova solicitação
     */
    public static StatusViatura[] getStatusDisponiveis() {
        return new StatusViatura[]{DISPONIVEL};
    }

    /**
     * 🎯 Lista status que indicam viatura em operação
     */
    public static StatusViatura[] getStatusEmOperacao() {
        return new StatusViatura[]{A_CAMINHO, NO_LOCAL, TRANSPORTANDO, REGULACAO};
    }

    /**
     * 🎯 Lista status que indicam viatura inoperante
     */
    public static StatusViatura[] getStatusInoperante() {
        return new StatusViatura[]{INDISPONIVEL, MANUTENCAO, AVARIADA};
    }

    /**
     * ⏱️ Tempo máximo esperado neste status (em minutos)
     */
    public int getTempoMaximoEsperado() {
        return switch (this) {
            case DISPONIVEL -> -1;        // Indefinido
            case A_CAMINHO -> 30;         // 30 min máximo para chegar
            case NO_LOCAL -> 45;          // 45 min máximo no local
            case TRANSPORTANDO -> 60;     // 60 min máximo transporte
            case FINALIZANDO -> 15;       // 15 min para finalizar
            case REGULACAO -> 10;         // 10 min para regulação
            case ABASTECIMENTO -> 30;     // 30 min para abastecer
            case MANUTENCAO -> 480;       // 8 horas (1 turno)
            case INDISPONIVEL -> 120;     // 2 horas máximo
            case AVARIADA -> -1;          // Indefinido, depende do reparo
        };
    }

    /**
     * 🚨 Verifica se status requer atenção urgente
     */
    public boolean requerAtencaoUrgente() {
        return this == AVARIADA || this == REGULACAO;
    }

    /**
     * 📊 Próximo status mais provável
     */
    public StatusViatura getProximoStatusEsperado() {
        return switch (this) {
            case DISPONIVEL -> A_CAMINHO;
            case A_CAMINHO -> NO_LOCAL;
            case NO_LOCAL -> TRANSPORTANDO;
            case TRANSPORTANDO -> FINALIZANDO;
            case FINALIZANDO -> DISPONIVEL;
            case REGULACAO -> A_CAMINHO;
            case ABASTECIMENTO -> DISPONIVEL;
            case MANUTENCAO -> DISPONIVEL;
            case INDISPONIVEL -> DISPONIVEL;
            case AVARIADA -> MANUTENCAO;
        };
    }

    /**
     * 🎨 Cor para interface (diferente da cor hex para mais opções)
     */
    public String getCorInterface() {
        return switch (this) {
            case DISPONIVEL -> "success";
            case A_CAMINHO -> "warning";
            case NO_LOCAL -> "error";
            case TRANSPORTANDO -> "info";
            case FINALIZANDO -> "secondary";
            case REGULACAO -> "warning";
            case ABASTECIMENTO -> "success";
            case MANUTENCAO -> "warning";
            case INDISPONIVEL -> "default";
            case AVARIADA -> "error";
        };
    }

    /**
     * 📋 Ações permitidas neste status
     */
    public String[] getAcoesPermitidas() {
        return switch (this) {
            case DISPONIVEL -> new String[]{"ACIONAR", "MANUTENCAO", "INDISPONIBILIZAR"};
            case A_CAMINHO -> new String[]{"CHEGOU_LOCAL", "CANCELAR", "INDISPONIBILIZAR"};
            case NO_LOCAL -> new String[]{"INICIAR_TRANSPORTE", "FINALIZAR_SEM_TRANSPORTE"};
            case TRANSPORTANDO -> new String[]{"CHEGOU_HOSPITAL", "FINALIZAR"};
            case FINALIZANDO -> new String[]{"DISPONIBILIZAR", "MANUTENCAO"};
            case REGULACAO -> new String[]{"APROVAR", "CANCELAR"};
            case ABASTECIMENTO -> new String[]{"FINALIZAR_ABASTECIMENTO"};
            case MANUTENCAO -> new String[]{"FINALIZAR_MANUTENCAO"};
            case INDISPONIVEL -> new String[]{"DISPONIBILIZAR"};
            case AVARIADA -> new String[]{"ENVIAR_MANUTENCAO", "SUBSTITUIR"};
        };
    }
}
