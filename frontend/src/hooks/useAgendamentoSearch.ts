import { useState, useMemo } from 'react';

interface AgendamentoDTO {
    id: number;
    pacienteId: number;
    pacienteNome: string;
    profissionalNome: string;
    dataHora: string;
    status: string;
    tipo: string;
    especialidade?: string;
    prioridade?: string;
    unidade?: string;
    observacoes?: string;
}

export const useAgendamentoSearch = (agendamentos: AgendamentoDTO[] | undefined) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAgendamentos = useMemo(() => {
        if (!agendamentos || !Array.isArray(agendamentos)) return [];

        if (!searchTerm.trim()) return agendamentos;

        return agendamentos.filter(agendamento => {
            const searchLower = searchTerm.toLowerCase();

            // Verificação segura para propriedades obrigatórias
            const nomeMatch = agendamento.pacienteNome?.toLowerCase().includes(searchLower) || false;
            const tipoMatch = agendamento.tipo?.toLowerCase().includes(searchLower) || false;

            // Verificação segura para propriedades opcionais
            const especialidadeMatch = agendamento.especialidade?.toLowerCase().includes(searchLower) || false;
            const profissionalMatch = agendamento.profissionalNome?.toLowerCase().includes(searchLower) || false;
            const statusMatch = agendamento.status?.toLowerCase().includes(searchLower) || false;
            const prioridadeMatch = agendamento.prioridade?.toLowerCase().includes(searchLower) || false;
            const unidadeMatch = agendamento.unidade?.toLowerCase().includes(searchLower) || false;

            return nomeMatch || tipoMatch || especialidadeMatch || profissionalMatch || statusMatch || prioridadeMatch || unidadeMatch;
        });
    }, [agendamentos, searchTerm]);

    return { searchTerm, setSearchTerm, filteredAgendamentos };
};