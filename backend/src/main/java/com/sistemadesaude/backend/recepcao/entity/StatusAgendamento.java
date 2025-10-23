
package com.sistemadesaude.backend.recepcao.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 📋 ENUM PARA STATUS DO AGENDAMENTO
 *
 * Representa o fluxo completo do paciente desde o agendamento até o atendimento
 */
@Getter
@RequiredArgsConstructor
public enum StatusAgendamento {

    /**
     * 📅 AGENDADO
     * Consulta foi agendada mas paciente ainda não confirmou
     */
    AGENDADO("Agendado", "Consulta agendada, aguardando confirmação", "#6B7280", 1),

    /**
     * ✅ CONFIRMADO
     * Paciente confirmou presença na consulta
     */
    CONFIRMADO("Confirmado", "Paciente confirmou presença", "#059669", 2),

    /**
     * ❌ CANCELADO
     * Consulta foi cancelada
     */
    CANCELADO("Cancelado", "Consulta cancelada", "#DC2626", 0),

    /**
     * 🏥 RECEPCIONADO
     * Paciente chegou e foi recepcionado
     */
    RECEPCIONADO("Recepcionado", "Paciente chegou na unidade", "#2563EB", 3),

    /**
     * 🩺 TRIADO
     * Paciente passou pela triagem
     */
    TRIADO("Triado", "Paciente foi triado e classificado", "#7C3AED", 4),

    /**
     * ⏳ AGUARDANDO ATENDIMENTO
     * Paciente triado aguarda o profissional
     */
    AGUARDANDO_ATENDIMENTO("Aguardando Atendimento", "Aguardando chamada do profissional", "#F59E0B", 5),

    /**
     * 👨‍⚕️ EM ATENDIMENTO
     * Paciente sendo atendido pelo profissional
     */
    EM_ATENDIMENTO("Em Atendimento", "Em consulta com o profissional", "#10B981", 6),

    /**
     * ✅ FINALIZADO
     * Atendimento concluído
     */
    FINALIZADO("Finalizado", "Atendimento concluído", "#059669", 7),

    /**
     * 🚫 NÃO COMPARECEU
     * Paciente não compareceu na data agendada
     */
    NAO_COMPARECEU("Não Compareceu", "Paciente faltou ao agendamento", "#DC2626", 0);

    private final String descricao;
    private final String detalhamento;
    private final String corHex;
    private final int ordem; // Ordem no fluxo (0 = status final/cancelado)

    /**
     * 🎯 Verifica se o status permite triagem
     */
    public boolean permiteTriagem() {
        return this == RECEPCIONADO || this == CONFIRMADO;
    }

    /**
     * 🎯 Verifica se o status permite atendimento
     */
    public boolean permiteAtendimento() {
        return this == TRIADO || this == AGUARDANDO_ATENDIMENTO;
    }

    /**
     * 🎯 Verifica se é um status ativo (paciente ainda no fluxo)
     */
    public boolean isAtivo() {
        return ordem > 0 && this != FINALIZADO;
    }

    /**
     * 🎯 Próximo status no fluxo
     */
    public StatusAgendamento proximoStatus() {
        return switch (this) {
            case AGENDADO -> CONFIRMADO;
            case CONFIRMADO -> RECEPCIONADO;
            case RECEPCIONADO -> TRIADO;
            case TRIADO -> AGUARDANDO_ATENDIMENTO;
            case AGUARDANDO_ATENDIMENTO -> EM_ATENDIMENTO;
            case EM_ATENDIMENTO -> FINALIZADO;
            default -> this; // Status finais permanecem iguais
        };
    }

    /**
     * 🎨 Obtém classe CSS para interface
     */
    public String getClasseCss() {
        return switch (this) {
            case AGENDADO -> "bg-gray-100 text-gray-800";
            case CONFIRMADO -> "bg-green-100 text-green-800";
            case RECEPCIONADO -> "bg-blue-100 text-blue-800";
            case TRIADO -> "bg-purple-100 text-purple-800";
            case AGUARDANDO_ATENDIMENTO -> "bg-yellow-100 text-yellow-800";
            case EM_ATENDIMENTO -> "bg-emerald-100 text-emerald-800";
            case FINALIZADO -> "bg-green-100 text-green-800";
            case CANCELADO, NAO_COMPARECEU -> "bg-red-100 text-red-800";
        };
    }

    /**
     * 🎨 MÉTODO REQUERIDO: Obtém cor para interface baseada no status
     * ✅ ESTE É O MÉTODO QUE ESTAVA FALTANDO!
     */
    public String getCorInterface() {
        return switch (this) {
            case AGENDADO -> "gray";
            case CONFIRMADO -> "green";
            case RECEPCIONADO -> "blue";
            case TRIADO -> "purple";
            case AGUARDANDO_ATENDIMENTO -> "yellow";
            case EM_ATENDIMENTO -> "emerald";
            case FINALIZADO -> "green";
            case CANCELADO, NAO_COMPARECEU -> "red";
        };
    }

    /**
     * 🎨 Obtém ícone emoji para o status
     */
    public String getIcone() {
        return switch (this) {
            case AGENDADO -> "📅";
            case CONFIRMADO -> "✅";
            case RECEPCIONADO -> "🏥";
            case TRIADO -> "🩺";
            case AGUARDANDO_ATENDIMENTO -> "⏳";
            case EM_ATENDIMENTO -> "👨‍⚕️";
            case FINALIZADO -> "✅";
            case CANCELADO -> "❌";
            case NAO_COMPARECEU -> "🚫";
        };
    }

    /**
     * 📊 Obtém prioridade para ordenação (menor número = maior prioridade)
     */
    public int getPrioridade() {
        return switch (this) {
            case EM_ATENDIMENTO -> 1;
            case AGUARDANDO_ATENDIMENTO -> 2;
            case TRIADO -> 3;
            case RECEPCIONADO -> 4;
            case CONFIRMADO -> 5;
            case AGENDADO -> 6;
            case FINALIZADO -> 7;
            case CANCELADO, NAO_COMPARECEU -> 8;
        };
    }

    /**
     * 🔄 Verifica se pode ser alterado para outro status
     */
    public boolean podeSerAlterado() {
        return this != FINALIZADO && this != CANCELADO && this != NAO_COMPARECEU;
    }

    /**
     * 📋 Lista próximos status possíveis
     */
    public StatusAgendamento[] getProximosStatusPossiveis() {
        return switch (this) {
            case AGENDADO -> new StatusAgendamento[]{CONFIRMADO, CANCELADO};
            case CONFIRMADO -> new StatusAgendamento[]{RECEPCIONADO, CANCELADO, NAO_COMPARECEU};
            case RECEPCIONADO -> new StatusAgendamento[]{TRIADO};
            case TRIADO -> new StatusAgendamento[]{AGUARDANDO_ATENDIMENTO};
            case AGUARDANDO_ATENDIMENTO -> new StatusAgendamento[]{EM_ATENDIMENTO};
            case EM_ATENDIMENTO -> new StatusAgendamento[]{FINALIZADO};
            default -> new StatusAgendamento[]{};
        };
    }

    /**
     * 📝 Obtém descrição completa com ícone
     */
    public String getDescricaoCompleta() {
        return String.format("%s %s", getIcone(), descricao);
    }

    /**
     * 🕐 Verifica se precisa de atenção por tempo no status
     */
    public boolean precisaAtencao(long minutosNoStatus) {
        return switch (this) {
            case AGENDADO -> minutosNoStatus > 1440; // 24 horas
            case CONFIRMADO -> minutosNoStatus > 480; // 8 horas
            case RECEPCIONADO -> minutosNoStatus > 60; // 1 hora
            case TRIADO -> minutosNoStatus > 30; // 30 minutos
            case AGUARDANDO_ATENDIMENTO -> minutosNoStatus > 120; // 2 horas
            case EM_ATENDIMENTO -> minutosNoStatus > 180; // 3 horas
            default -> false;
        };
    }
}
