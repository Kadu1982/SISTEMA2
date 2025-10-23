// src/services/agendamentoService.ts

import apiService from './apiService';
import { CriarAgendamentoRequest, AgendamentoDTO } from '@/types/Agendamento';

export const agendamentoService = {
    // Criar agendamento (suporta exames múltiplos)
    async criarAgendamento(dados: CriarAgendamentoRequest): Promise<AgendamentoDTO> {
        const { data } = await apiService.post('/agendamentos', dados); // ✅ prefixo corrigido
        return data;
    },

    // Buscar agendamentos por data
    async buscarPorData(data: string): Promise<AgendamentoDTO[]> {
        const { data: result } = await apiService.get('/agendamentos/por-data', {
            params: { data }
        });
        return result || [];
    },

    // Atualizar status do agendamento
    async atualizarStatus(id: number, status: string): Promise<AgendamentoDTO> {
        const { data } = await apiService.patch(`/agendamentos/${id}/status`, { status });
        return data;
    },

    // Cancelar agendamento
    async cancelarAgendamento(id: number, motivo?: string): Promise<void> {
        await apiService.delete(`/agendamentos/${id}`, {
            data: { motivo }
        });
    },

    // Verificar conflitos de horário
    async verificarConflito(dataHora: string, profissional?: string): Promise<boolean> {
        const { data } = await apiService.get('/agendamentos/verificar-conflito', {
            params: { dataHora, profissional }
        });
        return data.conflito;
    }
};
