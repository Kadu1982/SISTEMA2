// src/hooks/useAgendamentoOperations.ts
// -----------------------------------------------------------------------------
// Hook com operações de Agendamento usado pela Recepção.
// Compatível com o AgendamentoRecepcao.tsx que você já tem.
//
// Exposto:
//   - salvarAgendamento(payload, queryClient?, onSuccess?, onError?)
//   - atualizarStatus(agendamentoId, novoStatus, queryClient?, refetch?)
//
// Endpoints esperados (ajuste se necessário):
//   POST  /agendamentos                               -> cria e retorna o agendamento
//   PATCH /agendamentos/{id}/status { status }        -> atualiza status
//
// Observações:
//   - Não alteramos sua identidade visual; apenas lógica de chamada/invalid.
//   - Invalidamos chaves de cache mais prováveis. Se sua app usar outras,
//     acrescente-as nos pontos indicados.
// -----------------------------------------------------------------------------

import { useCallback } from "react";
import type { QueryClient } from "@tanstack/react-query";
import apiService from "@/services/apiService";

// =============================================================================
// Tipos (leves), sem engessar o domínio
// =============================================================================

export type AgendamentoStatus =
    | "AGENDADO"
    | "RECEPCIONADO"
    | "ATENDIDO"
    | "REAGENDADO"
    | "FALTOU"
    | string;

export interface NovoAgendamentoPayload {
    pacienteId: number;
    tipo: string;                 // consulta_medica | exame_laboratorial | ...
    dataHora: string;             // ISO
    prioridade: string;           // normal | urgente | emergencia
    observacoes: string | null;
    unidade: string;              // ex.: "Unidade Principal"

    // um dos dois fluxos (consulta x SADT)
    especialidade?: string | null;
    examesSelecionados?: any[];   // mantemos flexível
}

export interface AgendamentoDTO {
    id: number;
    dataHora: string;            // ISO
    tipo: string;
    status: AgendamentoStatus;
    especialidade?: string | null;
    examesSelecionados?: any[];  // quando SADT
    pacienteId?: number;
    pacienteNome?: string | null;
    observacoes?: string | null;
    [k: string]: any;
}

// =============================================================================
// Utils
// =============================================================================

const BASE = "/agendamentos";

/** unwrap simples que aceita {data: ...} ou o payload direto */
function unwrap<T>(resp: any): T {
    return (resp && resp.data !== undefined ? resp.data : resp) as T;
}

/** Invalida chaves de cache prováveis sem quebrar nada */
function invalidateCommonAgendamentoQueries(queryClient?: QueryClient, extras?: Array<{ queryKey: unknown[] }>) {
    if (!queryClient) return;
    const keys: Array<{ queryKey: unknown[] }> = [
        { queryKey: ["agendamentos"] },                  // lista geral do dia
        { queryKey: ["agendamentosPorData"] },           // alguns projetos usam chave por data
        { queryKey: ["estatisticasAgendamentos"] },      // cards de estatística
        ...(extras || []),
    ];
    keys.forEach((k) => {
        try {
            queryClient.invalidateQueries(k);
        } catch {
            /* se a chave não existir, não tem problema */
        }
    });
}

// =============================================================================
/** Hook */
// =============================================================================
export function useAgendamentoOperations() {
    /**
     * Cria um novo agendamento.
     *
     * Assinatura pensada para ser drop-in na sua tela:
     *   salvarAgendamento(payload, queryClient, onSuccess, onError)
     *
     * Retorna o objeto criado (útil para capturar `id` e imprimir comprovante).
     */
    const salvarAgendamento = useCallback(
        async (
            payload: NovoAgendamentoPayload,
            queryClient?: QueryClient,
            onSuccess?: () => void,
            onError?: (err: unknown) => void
        ): Promise<AgendamentoDTO> => {
            try {
                // Sanitizações leves (se quiser, mova para um service):
                const body = {
                    ...payload,
                    // garante ISO válido
                    dataHora: new Date(payload.dataHora).toISOString(),
                    // normaliza strings
                    tipo: String(payload.tipo || "").trim(),
                    prioridade: String(payload.prioridade || "normal").trim(),
                    unidade: String(payload.unidade || "").trim(),
                    observacoes: payload.observacoes?.toString().trim() || null,
                };

                const resp = await apiService.post(BASE, body);
                const created = unwrap<AgendamentoDTO>(resp);

                // Invalida caches relevantes
                invalidateCommonAgendamentoQueries(queryClient, [
                    { queryKey: ["agendamentosPaciente", payload.pacienteId] },
                ]);

                onSuccess?.();
                return created;
            } catch (err) {
                onError?.(err);
                throw err;
            }
        },
        []
    );

    /**
     * Atualiza o status de um agendamento.
     *
     * Assinatura pensada para ser drop-in na sua tela:
     *   atualizarStatus(id, novoStatus, queryClient, refetch)
     */
    const atualizarStatus = useCallback(
        async (
            agendamentoId: number,
            novoStatus: AgendamentoStatus,
            queryClient?: QueryClient,
            refetchListaDoDia?: () => void
        ): Promise<void> => {
            // Validação mínima
            if (!agendamentoId || typeof agendamentoId !== "number") {
                throw new Error("agendamentoId inválido.");
            }
            const status = String(novoStatus || "").toUpperCase();
            if (!status) {
                throw new Error("novoStatus não informado.");
            }

            await apiService.patch(`${BASE}/${agendamentoId}/status`, { status });

            // Invalida caches relevantes
            invalidateCommonAgendamentoQueries(queryClient);

            // Se a tela passou um refetch específico, chamamos também
            try {
                refetchListaDoDia?.();
            } catch {
                /* ignore */
            }
        },
        []
    );

    return { salvarAgendamento, atualizarStatus };
}

export default useAgendamentoOperations;
