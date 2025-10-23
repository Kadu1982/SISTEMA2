import { useQuery } from '@tanstack/react-query';
import apiService from '@/services/apiService';

interface EstatisticasRecepcao {
    total: number;
    agendados: number;
    recepcionados: number;
    atendidos: number;
    reagendados: number;
    faltaram: number;
}

export const useEstatisticas = () => {
    const { data: estatisticas } = useQuery<EstatisticasRecepcao>({
        queryKey: ['estatisticas-recepcao'],
        queryFn: async () => {
            const hoje = new Date().toISOString().split('T')[0];
            const { data } = await apiService.get('/agendamentos/por-data', {
                params: { data: hoje }
            });

            const total = data.length;
            const agendados = data.filter((a: any) => a.status === 'AGENDADO').length;
            const recepcionados = data.filter((a: any) => a.status === 'RECEPCIONADO').length;
            const atendidos = data.filter((a: any) => a.status === 'ATENDIDO').length;
            const reagendados = data.filter((a: any) => a.status === 'REAGENDADO').length;
            const faltaram = data.filter((a: any) => a.status === 'FALTOU').length;

            return { total, agendados, recepcionados, atendidos, reagendados, faltaram };
        },
        refetchInterval: 60000,
    });

    return estatisticas;
};