/**
 * src/services/upaService.ts
 * -----------------------------------------------------------------------------
 * Serviço REST do módulo UPA — versão completa e alinhada com backend.
 *
 * - Compatível com ApiResponse<T> do backend Spring
 * - Endpoints corretos: /api/upa e /api/upa/triagem/* e /api/upa/atendimentos/*
 * - Headers multiunidade/tenant automaticamente anexados
 * - Fallbacks resilientes para operações críticas
 * - Mantém todos os aliases para compatibilidade com componentes existentes
 */

import apiService from '@/lib/api';

// ----------------------------- Tipos do domínio -----------------------------

export type UpaStatus = 'ABERTO' | 'EM_ATENDIMENTO' | 'ALTA' | 'ENCAMINHADO';
export type UpaPrioridade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type ClassificacaoRisco = 'VERMELHO' | 'LARANJA' | 'AMARELO' | 'VERDE' | 'AZUL';

export interface UpaPayload {
    pacienteId: number;
    dataEntrada: string;      // YYYY-MM-DD
    horaEntrada?: string;     // HH:mm
    prioridade?: UpaPrioridade;
    motivo?: string;
    status?: UpaStatus;
    unidadeId?: number;
    observacoes?: string;
}

export interface Upa extends UpaPayload {
    id: number;
    dataHoraRegistro?: string;
    atualizadoEm?: string;
    ativo?: boolean;
    pacienteNome?: string; // para exibição
}

/** Tipo ApiResponse compatível com backend Spring */
type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data: T | null;
};

/** DTOs específicos da triagem UPA */
export type UpaAguardandoDTO = {
    upaId: number;
    pacienteId: number;
    pacienteNome: string;
    dataHoraRegistro: string;
    prioridade?: string;
};

export type UpaTriadoDTO = {
    triagemId: number;
    upaId: number;
    pacienteId: number;
    pacienteNome: string;
    criadoEm: string;
    classificacaoRisco?: string;
};

/** Tipo para criação de triagem UPA - alinhado com backend */
export interface CriarTriagemUpaRequest {
    ocorrenciaId: number;
    pacienteId: number;
    motivoConsulta?: string;
    queixaPrincipal: string;
    observacoes?: string;
    alergias?: string;
    pressaoArterial?: string;
    temperatura?: number;
    peso?: number;
    altura?: number;
    frequenciaCardiaca?: number;
    frequenciaRespiratoria?: number;
    saturacaoOxigenio?: number;
    escalaDor?: number;
    dumInformada?: string;
    gestanteInformado?: boolean;
    semanasGestacaoInformadas?: number;
    classificacaoRisco?: ClassificacaoRisco;
}

/** Tipo para desfecho de atendimento */
export interface DesfechoAtendimentoRequest {
    setorDestino?: string;
    observacoes?: string;
    prazoMinutos?: number; // Para reavaliação
}

/** Tipo para criação de atendimento UPA */
export interface CriarAtendimentoUpaRequest {
    triagemId: number;
    pacienteId: number;
    observacoes?: string;
}

// --------------------------------- Base URL ---------------------------------

const baseUrl = '/upa'; // apiService já prefixa com /api

// ------------------------- Util: headers e opções comuns --------------------

function getExtraHeaders(): Record<string, string> {
    const h: Record<string, string> = {};

    // Multiunidade/tenant – ajuste os nomes das chaves se sua app usar outros
    const unidade =
        localStorage.getItem('unidadeId') ??
        localStorage.getItem('unidadeAtualId') ??
        undefined;
    if (unidade) h['X-Unidade-Id'] = String(unidade);

    const tenant =
        localStorage.getItem('X-Tenant-ID') ??
        localStorage.getItem('tenantId') ??
        localStorage.getItem('tenant') ??
        undefined;
    if (tenant) h['X-Tenant-ID'] = String(tenant);

    return h;
}

function opts(extra?: { params?: Record<string, unknown>; headers?: Record<string, string> }) {
    return {
        withCredentials: true,
        ...(extra ?? {}),
        headers: { ...getExtraHeaders(), ...(extra?.headers ?? {}) },
    };
}

// --------------------------------- CRUD UPA --------------------------------

/**
 * Lista UPA com filtros opcionais
 * GET /api/upa → ApiResponse<List<Upa>>
 */
export async function listarUpas(params?: Record<string, unknown>): Promise<Upa[]> {
    try {
        // Sanitize parameters - remove undefined, null, empty strings
        const cleanParams = params ? Object.fromEntries(
            Object.entries(params).filter(([_, value]) => 
                value !== undefined && value !== null && value !== ''
            )
        ) : undefined;
        
        const res = await apiService.get<ApiResponse<Upa[]>>(baseUrl, opts({ params: cleanParams }));
        if (res.data?.success) {
            return res.data.data ?? [];
        }
        throw new Error(res.data?.message || 'Falha ao listar UPAs');
    } catch (err: any) {
        const status = err?.response?.status;
        if (status !== 401 && status !== 403) throw err;

        // Fallback: tentar por status individuais se GET geral falhou
        try {
            const [aberto, emAt, enc, alta] = await Promise.allSettled([
                apiService.get<ApiResponse<Upa[]>>(baseUrl, opts({ params: { ...(params ?? {}), status: 'ABERTO' } })),
                apiService.get<ApiResponse<Upa[]>>(baseUrl, opts({ params: { ...(params ?? {}), status: 'EM_ATENDIMENTO' } })),
                apiService.get<ApiResponse<Upa[]>>(baseUrl, opts({ params: { ...(params ?? {}), status: 'ENCAMINHADO' } })),
                apiService.get<ApiResponse<Upa[]>>(baseUrl, opts({ params: { ...(params ?? {}), status: 'ALTA' } })),
            ]);

            const collected: Upa[] = [];
            const push = (r: PromiseSettledResult<any>) => {
                if (r.status === 'fulfilled' && r.value?.data?.success) {
                    const data = r.value.data.data ?? [];
                    if (Array.isArray(data)) collected.push(...data);
                }
            };
            push(aberto); push(emAt); push(enc); push(alta);

            if (collected.length) return dedupeById(collected);
        } catch {
            // ignore; rethrow original error
        }

        throw err;
    }
}

/**
 * Busca um registro por ID
 * GET /api/upa/{id} → ApiResponse<Upa>
 */
export async function obterUpaPorId(id: number): Promise<Upa | null> {
    try {
        const res = await apiService.get<ApiResponse<Upa>>(`${baseUrl}/${id}`, opts());
        if (res.data?.success) return res.data.data ?? null;
        return null;
    } catch (err: any) {
        if (err?.response?.status === 404) return null;
        throw err;
    }
}

/**
 * Cria um registro
 * POST /api/upa → ApiResponse<Upa>
 */
export async function criarUpa(payload: UpaPayload): Promise<Upa> {
    const res = await apiService.post<ApiResponse<Upa>>(baseUrl, payload, opts());
    if (res.data?.success && res.data.data) return res.data.data;
    throw new Error(res.data?.message || 'Erro ao criar UPA');
}

/**
 * Atualiza um registro
 * PUT /api/upa/{id} → ApiResponse<Upa>
 */
export async function atualizarUpa(id: number, payload: UpaPayload): Promise<Upa> {
    const res = await apiService.put<ApiResponse<Upa>>(`${baseUrl}/${id}`, payload, opts());
    if (res.data?.success && res.data.data) return res.data.data;
    throw new Error(res.data?.message || 'Erro ao atualizar UPA');
}

/**
 * Remove um registro
 * DELETE /api/upa/{id} → ApiResponse<Void>
 */
export async function deletarUpa(id: number): Promise<void> {
    const res = await apiService.delete<ApiResponse<void>>(`${baseUrl}/${id}`, opts());
    if (!res.data?.success) throw new Error(res.data?.message || 'Erro ao deletar UPA');
}

// -------------------------------- Ações/Helpers UPA ------------------------

/**
 * Alterar status do atendimento
 * PATCH /api/upa/{id}/status → ApiResponse<Upa>
 */
export async function alterarStatus(id: number, status: UpaStatus): Promise<Upa> {
    try {
        const res = await apiService.patch<ApiResponse<Upa>>(`${baseUrl}/${id}/status`, { status }, opts());
        if (res.data?.success && res.data.data) return res.data.data;
        throw new Error(res.data?.message || 'Erro ao alterar status da UPA');
    } catch (err: any) {
        if (err?.response?.status !== 404) throw err;

        // Fallback: GET + PUT completo se PATCH não existir
        const atual = await obterUpaPorId(id);
        if (!atual) throw new Error('UPA não encontrada para alterar status.');

        const payload: UpaPayload = {
            pacienteId: atual.pacienteId,
            dataEntrada: atual.dataEntrada,
            horaEntrada: atual.horaEntrada,
            prioridade: atual.prioridade,
            motivo: atual.motivo,
            status,
            unidadeId: atual.unidadeId,
            observacoes: atual.observacoes,
        };
        return atualizarUpa(id, payload);
    }
}

/**
 * Registra encaminhamento interno UPA (legacy)
 * POST /api/upa/{id}/encaminhamento → ApiResponse<Void>
 */
export async function encaminhamentoAtendimentoUPA(id: number, request: DesfechoAtendimentoRequest): Promise<void> {
    try {
        const res = await apiService.post<ApiResponse<void>>(`/upa/atendimentos/${id}/encaminhamento`, request, opts());
        if (!res.data?.success) {
            throw new Error(res.data?.message || 'Erro ao registrar encaminhamento UPA');
        }
    } catch (err: any) {
        throw err;
    }
}

// ------------------------ Endpoints TRIAGEM UPA ----------------------------

/**
 * Aguardando triagem UPA
 * GET /api/upa/triagem/aguardando → ApiResponse<List<UpaAguardandoDTO>>
 */
export async function listarAguardandoUPA(params?: Record<string, unknown>): Promise<UpaAguardandoDTO[]> {
    try {
        const res = await apiService.get<ApiResponse<UpaAguardandoDTO[]>>(`${baseUrl}/triagem/aguardando`, opts({ params }));
        if (res.data?.success) return res.data.data ?? [];
        throw new Error(res.data?.message || 'Erro ao carregar aguardando triagem UPA');
    } catch (err: any) {
        const s = err?.response?.status;
        if (s && (s === 401 || s === 403)) return [];
        throw err;
    }
}

/**
 * Triados UPA (triagem feita, sem atendimento)
 * GET /api/upa/triagem/triados → ApiResponse<List<UpaTriadoDTO>>
 */
export async function listarTriadosUPA(params?: Record<string, unknown>): Promise<UpaTriadoDTO[]> {
    try {
        const res = await apiService.get<ApiResponse<UpaTriadoDTO[]>>(`${baseUrl}/triagem/triados`, opts({ params }));
        if (res.data?.success) return res.data.data ?? [];
        throw new Error(res.data?.message || 'Erro ao carregar triados UPA');
    } catch (err: any) {
        const s = err?.response?.status;
        if (s && (s === 401 || s === 403)) return [];
        throw err;
    }
}

/**
 * Salva triagem UPA
 * POST /api/upa/triagem → ApiResponse<Long>
 */
export async function salvarTriagemUPA(request: CriarTriagemUpaRequest): Promise<number> {
    try {
        const res = await apiService.post<ApiResponse<number>>(`${baseUrl}/triagem`, request, opts());
        if (res.data?.success && res.data.data) {
            return res.data.data;
        }
        throw new Error(res.data?.message || 'Erro ao salvar triagem UPA');
    } catch (err: any) {
        throw err;
    }
}

// ------------------------ Endpoints ATENDIMENTO UPA ------------------------

/**
 * Cria um atendimento médico UPA
 * POST /api/upa/atendimentos → ApiResponse<Long>
 */
export async function criarAtendimentoUPA(request: CriarAtendimentoUpaRequest): Promise<number> {
    try {
        const res = await apiService.post<ApiResponse<number>>('/upa/atendimentos', request, opts());
        if (res.data?.success && res.data.data) {
            return res.data.data;
        }
        throw new Error(res.data?.message || 'Erro ao criar atendimento UPA');
    } catch (err: any) {
        throw err;
    }
}

/**
 * Libera usuário (FINALIZADO)
 * POST /api/upa/atendimentos/{id}/liberar → ApiResponse<Void>
 */
export async function liberarAtendimentoUPA(id: number, observacoes?: string): Promise<void> {
    try {
        const body = observacoes ? { observacoes } : {};
        const res = await apiService.post<ApiResponse<void>>('/upa/atendimentos/' + id + '/liberar', body, opts());
        if (!res.data?.success) {
            throw new Error(res.data?.message || 'Erro ao liberar usuário');
        }
    } catch (err: any) {
        throw err;
    }
}

/**
 * Encaminha para observação
 * POST /api/upa/atendimentos/{id}/observacao → ApiResponse<Void>
 */
export async function observacaoAtendimentoUPA(id: number, reqOrSetor?: DesfechoAtendimentoRequest | string, observacoes?: string): Promise<void> {
    try {
        const body: DesfechoAtendimentoRequest = (typeof reqOrSetor === 'object' && reqOrSetor !== null)
            ? (reqOrSetor as DesfechoAtendimentoRequest)
            : { setorDestino: (reqOrSetor as string | undefined), observacoes };
        const res = await apiService.post<ApiResponse<void>>('/upa/atendimentos/' + id + '/observacao', body, opts());
        if (!res.data?.success) {
            throw new Error(res.data?.message || 'Erro ao encaminhar para observação');
        }
    } catch (err: any) {
        throw err;
    }
}

/**
 * Encaminhamento interno
 * POST /api/upa/atendimentos/{id}/encaminhamento → ApiResponse<Void>
 */
export async function encaminhamentoInternoUPA(id: number, setorDestino?: string, observacoes?: string): Promise<void> {
    try {
        const body: DesfechoAtendimentoRequest = { setorDestino, observacoes };
        const res = await apiService.post<ApiResponse<void>>('/upa/atendimentos/' + id + '/encaminhamento', body, opts());
        if (!res.data?.success) {
            throw new Error(res.data?.message || 'Erro ao registrar encaminhamento interno');
        }
    } catch (err: any) {
        throw err;
    }
}

/**
 * Programa reavaliação
 * POST /api/upa/atendimentos/{id}/reavaliacao → ApiResponse<Void>
 */
export async function reavaliacaoAtendimentoUPA(id: number, prazoMinutos?: number, observacoes?: string): Promise<void> {
    try {
        const body = { prazoMinutos, observacoes };
        const res = await apiService.post<ApiResponse<void>>('/upa/atendimentos/' + id + '/reavaliacao', body, opts());
        if (!res.data?.success) {
            throw new Error(res.data?.message || 'Erro ao programar reavaliação');
        }
    } catch (err: any) {
        throw err;
    }
}

// ------------------------ Listagens por STATUS (filtros) --------------------

/** Lista UPAs por status específico */
export async function listarPorStatusUPA(status: UpaStatus, params?: Record<string, unknown>): Promise<Upa[]> {
    return listarUpas({ status, ...(params ?? {}) });
}

/** Aguardando triagem/atendimento → status 'ABERTO' */
export async function listarAguardandoUpaStatus(params?: Record<string, unknown>): Promise<Upa[]> {
    return listarPorStatusUPA('ABERTO', params);
}

/** Em atendimento → status 'EM_ATENDIMENTO' */
export async function listarEmAtendimentoUPA(params?: Record<string, unknown>): Promise<Upa[]> {
    return listarPorStatusUPA('EM_ATENDIMENTO', params);
}

/** Encaminhados → status 'ENCAMINHADO' */
export async function listarEncaminhadosUPA(params?: Record<string, unknown>): Promise<Upa[]> {
    return listarPorStatusUPA('ENCAMINHADO', params);
}

/** Altas → status 'ALTA' */
export async function listarAltaUPA(params?: Record<string, unknown>): Promise<Upa[]> {
    return listarPorStatusUPA('ALTA', params);
}

// ------------------------ Outros helpers -----------------------------------

export async function buscarUpasPorPaciente(
    pacienteId: number,
    params?: Record<string, unknown>
): Promise<Upa[]> {
    // Sanitize parameters - remove undefined, null, empty strings
    const cleanParams = params ? Object.fromEntries(
        Object.entries(params).filter(([_, value]) => 
            value !== undefined && value !== null && value !== ''
        )
    ) : undefined;
    
    const res = await apiService.get<ApiResponse<Upa[]>>(`${baseUrl}/paciente/${pacienteId}`, opts({ params: cleanParams }));
    if (res.data?.success) return res.data.data ?? [];
    throw new Error(res.data?.message || 'Erro ao buscar UPAs do paciente');
}

export async function getPrioridades(): Promise<UpaPrioridade[]> {
    return ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'];
}

export async function getStatuses(): Promise<UpaStatus[]> {
    return ['ABERTO', 'EM_ATENDIMENTO', 'ALTA', 'ENCAMINHADO'];
}

// -------------------------------- Aliases -----------------------------------

// Lista
export const fetchUpas = listarUpas;
export const searchUpas = listarUpas;
export const getUpas = listarUpas;
export const listUpas = listarUpas;
export const listUpa = listarUpas;

// Get por ID
export const getUpaById = obterUpaPorId;
export const getUpa = obterUpaPorId;

// Create/Update/Delete
export const createUpa = criarUpa;
export const updateUpa = atualizarUpa;
export const removeUpa = deletarUpa;
export const deleteUpa = deletarUpa;

// Helpers semânticos
export async function finalizarUpa(id: number): Promise<Upa> { return alterarStatus(id, 'ALTA'); }
export async function encaminarUpa(id: number): Promise<Upa> { return alterarStatus(id, 'ENCAMINHADO'); }

export const buscarUpaPorPaciente = buscarUpasPorPaciente;
export const changeUpaStatus = alterarStatus;
export const setUpaStatus = alterarStatus;
export const getPrioridadesUpa = getPrioridades;
export const getStatusesUpa = getStatuses;

// Aliases para filtros por status
export const listarPorStatusUpa = listarPorStatusUPA;
export const listarAguardandoUpa = listarAguardandoUpaStatus;
export const listAguardandoUPA = listarAguardandoUpaStatus;
export const listAguardandoUpa = listarAguardandoUpaStatus;

export const listarTriadosUpa = listarTriadosUPA;
export const listTriadosUPA = listarTriadosUPA;
export const listTriadosUpa = listarTriadosUPA;

export const listarEmAtendimentoUpa = listarEmAtendimentoUPA;
export const listarEncaminhadosUpa = listarEncaminhadosUPA;
export const listarAltaUpa = listarAltaUPA;

// Triagem UPA - aliases
export const criarTriagemUPA = salvarTriagemUPA;
export const saveTriagemUPA = salvarTriagemUPA;

// Encaminhamento - aliases (legacy)
export const registrarEncaminhamentoUPA = encaminhamentoAtendimentoUPA;
export const encaminhamentoUPA = encaminhamentoAtendimentoUPA;

// Atendimento UPA - aliases
export const criarAtendimentoUpa = criarAtendimentoUPA;
export const saveAtendimentoUPA = criarAtendimentoUPA;
export const liberarUsuarioUPA = liberarAtendimentoUPA;
export const liberarAtendimento = liberarAtendimentoUPA;
export const observacaoUPA = observacaoAtendimentoUPA;
export const encaminhamentoInterno = encaminhamentoInternoUPA;
export const reavaliacaoUPA = reavaliacaoAtendimentoUPA;
export const programarReavaliacao = reavaliacaoAtendimentoUPA;

// Compat de nomes esperados por componentes
export const salvarAtendimentoUPA = criarAtendimentoUPA;
export type CriarAtendimentoUPARequest = CriarAtendimentoUpaRequest;
export type CriarTriagemUPARequest = CriarTriagemUpaRequest;

// -------------------------------- Utilitários -------------------------------

function dedupeById(list: Upa[]): Upa[] {
    const seen = new Set<number>();
    const out: Upa[] = [];
    for (const u of list) {
        if (!u || u.id == null) continue;
        if (seen.has(u.id)) continue;
        seen.add(u.id);
        out.push(u);
    }
    return out;
}

// ---------------------------- Export default -------------------------------

const upaService = {
    // CRUD UPA
    listarUpas, obterUpaPorId, criarUpa, atualizarUpa, deletarUpa,

    // Helpers UPA
    alterarStatus, buscarUpasPorPaciente, getPrioridades, getStatuses,

    // Triagem UPA
    listarAguardandoUPA, listarTriadosUPA, salvarTriagemUPA,

    // Atendimento UPA
    criarAtendimentoUPA, liberarAtendimentoUPA, observacaoAtendimentoUPA,
    encaminhamentoInternoUPA, reavaliacaoAtendimentoUPA,

    // Encaminhamento UPA (legacy)
    encaminhamentoAtendimentoUPA,

    // Filtros por status
    listarPorStatusUPA, listarAguardandoUpaStatus,
    listarEmAtendimentoUPA, listarEncaminhadosUPA, listarAltaUPA,

    // Aliases CRUD
    fetchUpas, searchUpas, getUpas, listUpas, listUpa,
    getUpaById, getUpa, createUpa, updateUpa, removeUpa, deleteUpa,
    finalizarUpa, encaminarUpa,
    buscarUpaPorPaciente: buscarUpasPorPaciente,
    changeUpaStatus: alterarStatus, setUpaStatus: alterarStatus,
    getPrioridadesUpa: getPrioridades, getStatusesUpa: getStatuses,

    // Aliases filtros
    listarPorStatusUpa: listarPorStatusUPA,
    listarAguardandoUpa: listarAguardandoUpaStatus,
    listAguardandoUPA: listarAguardandoUpaStatus,
    listAguardandoUpa: listarAguardandoUpaStatus,
    listarTriadosUpa: listarTriadosUPA,
    listTriadosUPA: listarTriadosUPA,
    listTriadosUpa: listarTriadosUPA,
    listarEmAtendimentoUpa: listarEmAtendimentoUPA,
    listarEncaminhadosUpa: listarEncaminhadosUPA,
    listarAltaUpa: listarAltaUPA,

    // Aliases triagem
    criarTriagemUPA: salvarTriagemUPA,
    saveTriagemUPA: salvarTriagemUPA,

    // Aliases encaminhamento (legacy)
    registrarEncaminhamentoUPA: encaminhamentoAtendimentoUPA,
    encaminhamentoUPA: encaminhamentoAtendimentoUPA,

    // Aliases atendimento
    criarAtendimentoUpa: criarAtendimentoUPA,
    saveAtendimentoUPA: criarAtendimentoUPA,
    liberarUsuarioUPA: liberarAtendimentoUPA,
    liberarAtendimento: liberarAtendimentoUPA,
    observacaoUPA: observacaoAtendimentoUPA,
    encaminhamentoInterno: encaminhamentoInternoUPA,
    reavaliacaoUPA: reavaliacaoAtendimentoUPA,
    programarReavaliacao: reavaliacaoAtendimentoUPA,
};

export default upaService;