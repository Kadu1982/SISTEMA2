// src/services/pacientesService.ts
// -----------------------------------------------------------------------------
// Serviço de Pacientes — Fase 2 (Pacientes → Recepção → Triagem)
// Padrões do projeto:
//  - NÃO prefixar com "/api": o apiService já define a baseURL.
//  - Se o backend envelopar { data: ... }, fazemos unwrap.
//  - Sanitizamos CPF/CNS/CEP/Telefones antes de enviar.
// Endpoints possíveis (tentamos o "novo" e caímos para o "clássico" em fallback):
//  NOVO:
//    GET    /pacientes/search?term=             -> PacienteDTO[]
//    GET    /pacientes/por-documento?cpf=&cns=  -> PacienteDTO | 404
//  CLÁSSICO (fallback):
//    GET    /pacientes?busca=                   -> Page<PacienteDTO> | PacienteDTO[]
//    GET    /pacientes?cpf=&cns=                -> PacienteDTO | 404
//
//  CRUD:
//    GET    /pacientes?busca=&page=&size=       -> Page<PacienteDTO> | PacienteDTO[]
//    GET    /pacientes/{id}                     -> PacienteDTO
//    POST   /pacientes                          -> PacienteDTO
//    PUT    /pacientes/{id}                     -> PacienteDTO
//    DELETE /pacientes/{id}                     -> void
//
//  LGPD/Histórico/Triagens idem aos seus endpoints atuais
// -----------------------------------------------------------------------------

import api from "@/services/apiService";

// -----------------------------------------------------------------------------
// Tipos
// -----------------------------------------------------------------------------

export interface EnderecoDTO {
    logradouro?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    municipio?: string | null;
    uf?: string | null; // "SP", "RJ", etc.
    cep?: string | null; // apenas dígitos no envio
}

export interface PacienteDTO {
    id?: number;

    // Identificação principal
    nomeCompleto: string;
    nomeMae?: string | null;
    dataNascimento?: string | null; // ISO "YYYY-MM-DD"
    sexo?: "M" | "F" | "I" | string | null;

    // Documentos
    cpf?: string | null; // apenas dígitos
    cns?: string | null; // apenas dígitos

    // Contatos
    telefone?: string | null; // apenas dígitos
    celular?: string | null;  // apenas dígitos
    email?: string | null;

    // Endereço
    endereco?: EnderecoDTO;

    // Status / flags
    ativo?: boolean;
    observacoes?: string | null;

    // LGPD
    consentimentoLgpd?: boolean;
    bloqueadoCompartilhamento?: boolean;
    termoVersao?: string | null;
    dataConsentimento?: string | null; // ISO

    // Extras do domínio
    [k: string]: any;
}

export interface PacienteInput extends PacienteDTO {}

export interface Page<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface HistoricoAtendimento {
    id: number;
    data: string; // ISO
    setor?: string | null;
    profissional?: string | null;
    resumo?: string | null;
    [k: string]: any;
}

export interface TriagemResumo {
    id: number;
    data: string; // ISO
    classificacao?: string | null; // "Vermelha/Amarela/Verde/Azul"
    sinais?: Record<string, string | number | null>; // { PA: "120x80", FC: 88, ... }
    [k: string]: any;
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const BASE = "/pacientes";

function unwrap<T>(payload: any): T {
    return (payload && payload.data !== undefined ? payload.data : payload) as T;
}

function onlyDigits(v?: string | null): string | undefined {
    return v ? v.replace(/\D+/g, "") || undefined : undefined;
}

function toUpperOr(v?: string | null, fallback: string | null = null): string | null {
    if (!v) return fallback;
    return v.toString().trim().toUpperCase();
}

function normalizeEndereco(e?: EnderecoDTO): EnderecoDTO | undefined {
    if (!e) return undefined;
    return {
        ...e,
        cep: onlyDigits(e.cep) ?? null,
        uf: toUpperOr(e.uf, null),
    };
}

function normalizePayload(p: PacienteDTO): PacienteDTO {
    return {
        ...p,
        nomeCompleto: (p.nomeCompleto || "").trim(),
        nomeMae: (p.nomeMae || null) as any,
        cpf: onlyDigits(p.cpf) ?? null,
        cns: onlyDigits(p.cns) ?? null,
        telefone: onlyDigits(p.telefone) ?? null,
        celular: onlyDigits(p.celular) ?? null,
        email: p.email ? p.email.trim().toLowerCase() : null,
        endereco: normalizeEndereco(p.endereco),
        termoVersao: p.termoVersao?.trim() || null,
        dataConsentimento: p.dataConsentimento || null,
    };
}

function normalizeList<T>(payload: any): Page<T> | T[] {
    const body = unwrap<any>(payload);
    if (body && typeof body === "object" && Array.isArray(body.content)) {
        return body as Page<T>;
    }
    return body as T[];
}

function isFallbackWorthy(err: any): boolean {
    // Fallback quando o endpoint não existe/não aceita params atuais
    const status = err?.response?.status;
    return status === 400 || status === 404 || status === 405;
}

// -----------------------------------------------------------------------------
// CRUD (mantidos)
// -----------------------------------------------------------------------------

export async function listarPacientes(params?: {
    page?: number;
    size?: number;
    sort?: string;
    busca?: string;
    unidadeId?: number;
    ativo?: boolean;
    signal?: AbortSignal;
}): Promise<Page<PacienteDTO> | PacienteDTO[]> {
    const { data } = await api.get(BASE, { params, signal: params?.signal });
    return normalizeList<PacienteDTO>(data);
}

export async function obterPaciente(id: number, opts?: { signal?: AbortSignal }): Promise<PacienteDTO> {
    const { data } = await api.get(`${BASE}/${id}`, { signal: opts?.signal });
    return unwrap<PacienteDTO>(data);
}

export async function criarPaciente(payload: PacienteDTO): Promise<PacienteDTO> {
    const body = normalizePayload(payload);
    const { data } = await api.post(BASE, body);
    return unwrap<PacienteDTO>(data);
}

export async function atualizarPaciente(id: number, payload: PacienteDTO): Promise<PacienteDTO> {
    const body = normalizePayload(payload);
    const { data } = await api.put(`${BASE}/${id}`, body);
    return unwrap<PacienteDTO>(data);
}

export async function removerPaciente(id: number): Promise<void> {
    await api.delete(`${BASE}/${id}`);
}

// -----------------------------------------------------------------------------
// Buscas (com FALLBACKS automáticos)
// -----------------------------------------------------------------------------

/**
 * Busca por nome (ou termo livre).
 * Estratégia:
 *  1) Tenta NOVO endpoint: GET /pacientes/search?term=
 *  2) Se 400/404/405, cai para CLÁSSICO: GET /pacientes?busca=
 */
export async function buscarPacientes(
    term: string,
    opts?: { limit?: number; signal?: AbortSignal }
): Promise<PacienteDTO[]> {
    const t = (term || "").trim();
    if (!t) return [];

    try {
        const { data } = await api.get(`${BASE}/search`, {
            params: { term: t, limit: opts?.limit },
            signal: opts?.signal,
        });
        return unwrap<PacienteDTO[]>(data);
    } catch (err: any) {
        if (!isFallbackWorthy(err)) throw err;
        // FALLBACK: /pacientes?busca=
        const { data } = await api.get(BASE, {
            params: { busca: t, size: opts?.limit },
            signal: opts?.signal,
        });
        const result = normalizeList<PacienteDTO>(data);
        if (Array.isArray(result)) return result;
        return result.content ?? [];
    }
}

/**
 * Busca por documentos.
 * Estratégia:
 *  1) Tenta NOVO endpoint: GET /pacientes/por-documento?cpf=&cns=
 *  2) Se 400/404/405, cai para CLÁSSICO: GET /pacientes?cpf=&cns=
 */
export async function buscarPorDocumento(
    params: { cpf?: string; cns?: string },
    opts?: { signal?: AbortSignal }
): Promise<PacienteDTO | null> {
    const cpf = onlyDigits(params.cpf) ?? undefined;
    const cns = onlyDigits(params.cns) ?? undefined;

    if (!cpf && !cns) return null;

    try {
        const { data } = await api.get(`${BASE}/por-documento`, {
            params: { cpf, cns },
            signal: opts?.signal,
        });
        return unwrap<PacienteDTO>(data);
    } catch (err: any) {
        // 404 significa "não encontrado" - retorna null, não é erro
        if (err?.response?.status === 404) {
            return null;
        }
        // Outros erros podem tentar fallback
        if (!isFallbackWorthy(err)) throw err;
        // FALLBACK: /pacientes?cpf=&cns=
        try {
            const { data } = await api.get(BASE, {
                params: { cpf, cns },
                signal: opts?.signal,
            });
            const body = unwrap<any>(data);
            // Alguns backends retornam um único objeto, outros lista/página
            if (!body) return null;
            if (Array.isArray(body)) return body[0] ?? null;
            if (body.content && Array.isArray(body.content)) return body.content[0] ?? null;
            return body as PacienteDTO;
        } catch {
            return null;
        }
    }
}

// -----------------------------------------------------------------------------
// LGPD
// -----------------------------------------------------------------------------

export async function salvarConsentimentoLgpd(
    id: number,
    body: { consentimento: boolean; termoVersao?: string | null; data?: string | null }
): Promise<{ id: number; consentimento: boolean; termoVersao?: string | null; data?: string | null }> {
    const { data } = await api.patch(`${BASE}/${id}/lgpd-consentimento`, {
        consentimento: Boolean(body.consentimento),
        termoVersao: body.termoVersao?.trim() || null,
        data: body.data || null,
    });
    return unwrap<{ id: number; consentimento: boolean; termoVersao?: string | null; data?: string | null }>(data);
}

export async function salvarBloqueioCompartilhamento(
    id: number,
    bloqueado: boolean
): Promise<{ id: number; bloqueadoCompartilhamento: boolean }> {
    const { data } = await api.patch(`${BASE}/${id}/lgpd-compartilhamento`, {
        bloqueadoCompartilhamento: Boolean(bloqueado),
    });
    return unwrap<{ id: number; bloqueadoCompartilhamento: boolean }>(data);
}

// -----------------------------------------------------------------------------
// Histórico e Triagens
// -----------------------------------------------------------------------------

export async function listarHistoricoAtendimentos(
    id: number,
    params?: { page?: number; size?: number; sort?: string; signal?: AbortSignal }
): Promise<Page<HistoricoAtendimento> | HistoricoAtendimento[]> {
    const { data } = await api.get(`${BASE}/${id}/historico`, { params, signal: params?.signal });
    return normalizeList<HistoricoAtendimento>(data);
}

export async function listarTriagens(
    id: number,
    params?: { page?: number; size?: number; sort?: string; signal?: AbortSignal }
): Promise<Page<TriagemResumo> | TriagemResumo[]> {
    const { data } = await api.get(`${BASE}/${id}/triagens`, { params, signal: params?.signal });
    return normalizeList<TriagemResumo>(data);
}

// ========================================
// ✅ ALIASES PARA COMPATIBILIDADE
// ========================================

export const getPacienteById = obterPaciente;

export async function getAllPacientes(): Promise<PacienteDTO[]> {
    const result = await listarPacientes();
    if ("content" in (result as any)) {
        return (result as Page<PacienteDTO>).content;
    }
    return result as PacienteDTO[];
}

export const buscarPacientesPorNome = buscarPacientes;
export const createPaciente = criarPaciente;
export const updatePaciente = atualizarPaciente;
export const deletePaciente = removerPaciente;

// -----------------------------------------------------------------------------
// Export default
// -----------------------------------------------------------------------------

const pacientesService = {
    listarPacientes,
    obterPaciente,
    criarPaciente,
    atualizarPaciente,
    removerPaciente,
    buscarPacientes,
    buscarPorDocumento,
    salvarConsentimentoLgpd,
    salvarBloqueioCompartilhamento,
    listarHistoricoAtendimentos,
    listarTriagens,

    // Aliases para compatibilidade
    getPacienteById,
    getAllPacientes,
    buscarPacientesPorNome,
    createPaciente,
    updatePaciente,
    deletePaciente,
};

export default pacientesService;
