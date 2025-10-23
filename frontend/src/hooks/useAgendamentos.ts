import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import apiService from "@/services/apiService";
import { AgendamentoDTO } from "@/types/Agendamento";

/**
 * Hook: useAgendamentos
 * ---------------------------------------------------------------------------
 * Lista agendamentos pela data selecionada.
 *
 * Mantém compatibilidade com a tela de Recepção:
 *   - retorna { agendamentos, isLoading, isError, refetch, queryClient }
 *   - inclui util invalidateAgendamentos() para forçar atualização
 *
 * Endpoint esperado (ajuste se necessário):
 *   GET /agendamentos?data=YYYY-MM-DD
 *
 * Observação sobre payload:
 *   - Aceita tanto array direto quanto envelopado { data: [...] } (unwrap)
 *   - Aceita também { itens } | { items } | { content } como algumas APIs retornam
 */

export const useAgendamentos = (date: Date | undefined) => {
    const queryClient = useQueryClient();
    const formattedDate = date ? format(date, "yyyy-MM-dd") : "";

    const {
        data,
        isLoading,
        isError,
        refetch,
        error,
    } = useQuery<AgendamentoDTO[]>({
        queryKey: ["agendamentosPorData", formattedDate],
        enabled: !!formattedDate, // só busca se houver data
        staleTime: 15_000,        // dados frescos por 15s
        refetchInterval: 30_000,  // auto-refresh a cada 30s
        retry: 3,                 // até 3 tentativas em erro
        retryDelay: (i) => Math.min(1000 * 2 ** i, 30_000),

        queryFn: async () => {
            // Chamada: endpoint correto por data
            const resp = await apiService.get("/agendamentos/por-data", {
                params: { data: formattedDate },
            });

            // Unwrap e normalização do payload
            const payload: any = (resp as any)?.data ?? resp;

            // Possíveis formatos aceitos:
            // 1) Array direto: [ {...}, {...} ]
            // 2) Envelopado: { itens: [...] } | { items: [...] } | { content: [...] }
            const list: any[] = Array.isArray(payload)
                ? payload
                : payload?.itens ?? payload?.items ?? payload?.content ?? [];

            // Se a API retornar 404 para "sem resultados", tratamos como lista vazia
            return Array.isArray(list) ? (list as AgendamentoDTO[]) : [];
        },
    });

    /**
     * Invalida caches relacionados à agenda do dia e estatísticas.
     * Use quando salvar/cancelar/reagendar algo fora desta query.
     */
    const invalidateAgendamentos = async () => {
        try {
            await queryClient.invalidateQueries({ queryKey: ["agendamentosPorData", formattedDate] });
            await queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
            await queryClient.invalidateQueries({ queryKey: ["estatisticasAgendamentos"] });
        } catch {
            // se alguma chave não existir, só ignoramos
        }
    };

    return {
        agendamentos: data ?? [],
        isLoading,
        isError,
        error,
        refetch,
        queryClient,
        invalidateAgendamentos,
    };
};

export default useAgendamentos;
