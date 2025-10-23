import { useState } from 'react';
import apiService from '@/services/apiService';

interface AgendamentoDTO {
    id: number;
    pacienteId: number;
    pacienteNome: string;
    profissionalNome: string;
    dataHora: string;
    status: string;
    tipo: string;
    especialidade?: string;
    examesSelecionados?: string[];
    prioridade?: string;
    unidade?: string;
    observacoes?: string;
}

// ✅ MELHORIA: Interface para o estado do hook
interface UsePacienteAgendamentosState {
    agendamentosPaciente: AgendamentoDTO[];
    loadingAgendamentosPaciente: boolean;
    errorAgendamentosPaciente: string | null;
}

export const usePacienteAgendamentos = () => {
    const [state, setState] = useState<UsePacienteAgendamentosState>({
        agendamentosPaciente: [],
        loadingAgendamentosPaciente: false,
        errorAgendamentosPaciente: null
    });

    // ✅ MELHORIA: Função auxiliar para atualizar estado de forma consistente
    const updateState = (updates: Partial<UsePacienteAgendamentosState>) => {
        setState(prevState => ({ ...prevState, ...updates }));
    };

    const buscarAgendamentosPaciente = async (pacienteId: number | undefined) => {
        // ✅ Verificação melhorada de parâmetro
        if (!pacienteId || pacienteId <= 0) {
            console.warn('⚠️ ID do paciente inválido:', pacienteId);
            updateState({
                agendamentosPaciente: [],
                errorAgendamentosPaciente: 'ID do paciente inválido',
                loadingAgendamentosPaciente: false
            });
            return;
        }

        updateState({
            loadingAgendamentosPaciente: true,
            errorAgendamentosPaciente: null
        });

        try {
            console.log(`🔍 Buscando agendamentos do paciente ${pacienteId}...`);

            const { data } = await apiService.get(`/agendamentos/paciente/${pacienteId}`);

            updateState({
                agendamentosPaciente: data || [],
                loadingAgendamentosPaciente: false,
                errorAgendamentosPaciente: null
            });

            console.log(`✅ Agendamentos do paciente ${pacienteId} carregados:`, data?.length || 0, 'registros');

        } catch (error: any) {
            console.error('❌ Erro ao buscar agendamentos do paciente:', error);

            // ✅ MELHORIA: Função helper para extrair mensagem de erro
            const extrairMensagemErro = (error: any): string => {
                if (error.response) {
                    const { status, data } = error.response;
                    const mensagensErro = {
                        401: 'Sessão expirada. Faça login novamente.',
                        403: 'Acesso negado. Verifique suas permissões.',
                        404: 'Paciente não encontrado.',
                        500: 'Erro interno do servidor.',
                    } as const;

                    return mensagensErro[status as keyof typeof mensagensErro] ||
                        `Erro ${status}: ${data?.message || 'Erro na requisição'}`;
                }

                if (error.request) {
                    return 'Erro de conexão com o servidor.';
                }

                return error.message || 'Erro desconhecido ao buscar agendamentos';
            };

            updateState({
                errorAgendamentosPaciente: extrairMensagemErro(error),
                agendamentosPaciente: [],
                loadingAgendamentosPaciente: false
            });
        }
    };

    // ✅ FUNÇÃO PARA LIMPAR DADOS
    const limparAgendamentosPaciente = () => {
        updateState({
            agendamentosPaciente: [],
            errorAgendamentosPaciente: null,
            loadingAgendamentosPaciente: false
        });
    };

    // ✅ MELHORIA: Função para recarregar agendamentos
    const recarregarAgendamentos = (pacienteId: number | undefined) => {
        if (pacienteId) {
            buscarAgendamentosPaciente(pacienteId);
        }
    };

    return {
        ...state,
        buscarAgendamentosPaciente,
        limparAgendamentosPaciente,
        recarregarAgendamentos
    };
};