/**
 * Serviço HTTP para Centros de Custo (alias de "Locais de Armazenamento" do Estoque).
 * - Padrão do projeto: usar `apiService` de '@/lib/api'
 * - Rotas preferenciais (novas):
 *      GET    /api/estoque/centros-custos
 *      GET    /api/estoque/centros-custos/:id
 *      POST   /api/estoque/centros-custos
 *      PATCH  /api/estoque/centros-custos/:id
 *      PUT    /api/estoque/centros-custos/:id
 * - Fallback legado (compat):
 *      /api/estoque/locais[/:id]
 *
 * OBS IMPORTANTE:
 * - Não removi/alterei `estoqueService.ts`. Este arquivo é aditivo.
 * - Tipos locais: ApiResponse<T> para evitar erros de import inexistente.
 */

import { apiService } from '@/lib/api';
import type { LocalArmazenamento } from '@/types/estoque';

// Tipo de resposta padrão do backend (compatível com seu ApiResponse<T>)
type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data: T;
};

// Alias: CentroCusto <-> LocalArmazenamento (sem quebrar o que já existe)
export type CentroCusto = LocalArmazenamento;

// Utilitário: tenta a rota preferencial e, em caso de erro (rota ausente/404), cai na rota legada
async function preferOrFallback<T>(
    prefer: () => Promise<{ data: ApiResponse<T> }>,
    fallback: () => Promise<{ data: ApiResponse<T> }>
): Promise<T> {
    try {
        const { data } = await prefer();
        if (!data?.success) throw new Error(data?.message || 'Falha na rota preferencial');
        return data.data;
    } catch (_err) {
        const { data } = await fallback();
        if (!data?.success) throw new Error(data?.message || 'Falha na rota fallback');
        return data.data;
    }
}

/** Lista todos os Centros de Custo */
export async function listarCentrosCusto(): Promise<CentroCusto[]> {
    return preferOrFallback<CentroCusto[]>(
        () => apiService.get('/estoque/centros-custos'),
        () => apiService.get('/estoque/locais')
    );
}

/** Obtém um Centro de Custo por ID */
export async function obterCentroCusto(id: number): Promise<CentroCusto> {
    return preferOrFallback<CentroCusto>(
        () => apiService.get(`/estoque/centros-custos/${id}`),
        () => apiService.get(`/estoque/locais/${id}`)
    );
}

/**
 * Cria um Centro de Custo
 * - Campos aceitos (parciais): nome, unidadeSaudeId, politicaCodigoSequencial,
 *   geracaoEntradaTransferencia, usaCodigoBarrasPorLote, ativo.
 */
export async function criarCentroCusto(payload: Partial<CentroCusto>): Promise<CentroCusto> {
    return preferOrFallback<CentroCusto>(
        () => apiService.post('/estoque/centros-custos', payload),
        () => apiService.post('/estoque/locais', payload)
    );
}

/**
 * Atualiza parcialmente (PATCH) um Centro de Custo por ID
 * - Somente aplica os campos enviados no payload.
 */
export async function atualizarCentroCusto(id: number, payload: Partial<CentroCusto>): Promise<CentroCusto> {
    return preferOrFallback<CentroCusto>(
        () => apiService.patch(`/estoque/centros-custos/${id}`, payload),
        () => apiService.put(`/estoque/locais/${id}`, payload) // fallback usa PUT legado
    );
}

/** Ativa/Desativa um Centro de Custo (atalho) */
export async function ativarDesativarCentroCusto(id: number, ativo: boolean): Promise<CentroCusto> {
    return atualizarCentroCusto(id, { ativo });
}

/** Export agrupado (conveniente para import) */
export const centroCustoService = {
    listarCentrosCusto,
    obterCentroCusto,
    criarCentroCusto,
    atualizarCentroCusto,
    ativarDesativarCentroCusto,
};
