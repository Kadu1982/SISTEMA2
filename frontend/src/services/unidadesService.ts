// src/services/unidadesService.ts
// -----------------------------------------------------------------------------
// Serviço de Unidades de Saúde (CRUD + flags de integração).
// Regras do projeto:
//  - NÃO prefixe com "/api"; o apiService já tem baseURL.
//  - Backend expõe "/api/unidades" → aqui usamos apenas "/unidades".
//  - Sanitizamos CNPJ/CNES (somente dígitos) antes de enviar.
// Integração com Imunização:
//  - Flags por unidade: exportaESUSAB, exportaRNDS (usadas no módulo Vacinas).
// -----------------------------------------------------------------------------

import api from "@/services/apiService";

// -------------------------------
// Tipos
// -------------------------------

// Enum que define os tipos de unidades de saúde (matching backend)
export enum TipoUnidadeSaude {
    GENERICA = "GENERICA",
    UBS = "UBS",
    UPA = "UPA",
    HOSPITAL = "HOSPITAL",
    CLINICA = "CLINICA",
    LABORATORIO = "LABORATORIO",
    FARMACIA = "FARMACIA",
    CENTRO_ESPECIALIDADES = "CENTRO_ESPECIALIDADES",
    SAMU = "SAMU",
    CAPS = "CAPS",
    POLICLINICA = "POLICLINICA",
    MATERNIDADE = "MATERNIDADE",
    PRONTO_SOCORRO = "PRONTO_SOCORRO"
}

export interface DocumentoUnidadeDTO {
    id?: number;
    tipo: string;
    numero: string;
    dataExpedicao?: string;
    orgaoExpeditor?: string;
    observacoes?: string;
}

export interface UnidadeDTO {
    id?: number;
    codigo?: string;
    razaoSocial?: string;
    nomeFantasia?: string;
    nome: string; // required
    cnpj?: string | null;
    codigoCnes: string; // required, 7 digits
    tipo: TipoUnidadeSaude; // required

    // Classificações
    tipoEstabelecimento?: string;
    esferaAdministrativa?: string;
    atividadeGestao?: string;
    fluxoClientela?: string;
    turnosAtendimento?: string;
    naturezaOrganizacao?: string;

    // Endereço detalhado
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    endereco?: string;
    cep?: string | null;
    cidade?: string;
    estado?: string;
    telefone?: string | null;
    email?: string | null;

    ativa?: boolean;
    horarioFuncionamento?: string;
    gestorResponsavel?: string;

    // Documentos vinculados
    documentos?: DocumentoUnidadeDTO[];

    // Timestamps
    dataCriacao?: string;
    dataAtualizacao?: string;
    criadoPor?: string;
    atualizadoPor?: string;

    // Campos calculados
    tipoDescricao?: string;
    enderecoCompleto?: string;

    // Integrações (Imunização) - mantidos para compatibilidade
    exportaESUSAB?: boolean;
    exportaRNDS?: boolean;

    // Backwards compatibility
    cnes?: string | null;

    // Perfis que podem ter acesso a esta unidade
    perfisPermitidos?: string[];
}

export interface Page<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

// -------------------------------
// Constantes / utils
// -------------------------------
const BASE_PATH = "/unidades";

function onlyDigits(v?: string | null): string | undefined {
    return v ? v.replace(/\D+/g, "") || undefined : undefined;
}

// Validates CNPJ format (14 digits)
function validateCnpj(cnpj?: string | null): string | null {
    if (!cnpj) return null;
    const digits = onlyDigits(cnpj);
    return digits && digits.length === 14 ? digits : null;
}

// Validates CNES format (7 digits)
function validateCnes(cnes?: string | null): string | null {
    if (!cnes) return null;
    const digits = onlyDigits(cnes);
    return digits && digits.length === 7 ? digits : null;
}

// Validates CEP format (8 digits)
function validateCep(cep?: string | null): string | null {
    if (!cep) return null;
    const digits = onlyDigits(cep);
    return digits && digits.length === 8 ? digits : null;
}

// Validates UF format (2 letters)
function validateUf(uf?: string | null): string | null {
    if (!uf) return null;
    const clean = uf.replace(/[^A-Za-z]/g, "").toUpperCase();
    return clean.length === 2 ? clean : null;
}

// Muitas APIs envelopam como { data: ... }.
// Este helper devolve data.data ?? data.
function unwrap<T>(data: any): T {
    return (data?.data ?? data) as T;
}

// Normaliza a resposta para sempre retornar array de unidades
function normalizeList(resp: any): UnidadeDTO[] | Page<UnidadeDTO> {
    const body = unwrap<any>(resp);
    if (body && typeof body === "object" && Array.isArray(body.content)) {
        // resposta paginada
        return body as Page<UnidadeDTO>;
    }
    // resposta simples (array)
    return body as UnidadeDTO[];
}

// -------------------------------
// CRUD BÁSICO
// -------------------------------

/**
 * Lista Unidades (paginado ou lista simples).
 * Aceita paginação/filtros; respeita AbortSignal quando informado.
 * @param skipAuth - Se true, não envia token de autenticação (útil para tela de login)
 */
export async function listarUnidades(params?: {
    page?: number;
    size?: number;
    sort?: string;
    busca?: string;
    ativa?: boolean;
    signal?: AbortSignal;
    skipAuth?: boolean;
}): Promise<Page<UnidadeDTO> | UnidadeDTO[]> {
    const { signal, skipAuth, ...queryParams } = params || {};
    const config: any = { params: queryParams, signal };
    if (skipAuth) {
        config.headers = { "X-Skip-Auth": "true" };
    }
    const { data } = await api.get(BASE_PATH, config);
    return normalizeList(data);
}

/** Alias não-quebrante para telas antigas. */
export const listar = listarUnidades;

/** Obtém uma unidade por ID. */
export async function obterUnidade(id: number, opts?: { signal?: AbortSignal }): Promise<UnidadeDTO> {
    const { data } = await api.get(`${BASE_PATH}/${id}`, { signal: opts?.signal });
    return unwrap<UnidadeDTO>(data);
}

/**
 * Cria nova unidade.
 * - Sanitiza e valida campos obrigatórios conforme backend.
 */
export async function criarUnidade(payload: UnidadeDTO): Promise<UnidadeDTO> {
    // Validações básicas
    if (!payload.nome || payload.nome.trim().length === 0) {
        throw new Error("Nome é obrigatório");
    }

    if (!payload.codigoCnes) {
        throw new Error("Código CNES é obrigatório");
    }

    if (!payload.tipo) {
        throw new Error("Tipo da unidade é obrigatório");
    }

    // Sanitiza e valida campos
    const cnesValidated = validateCnes(payload.codigoCnes || payload.cnes);
    if (!cnesValidated) {
        throw new Error("Código CNES deve ter exatamente 7 dígitos");
    }

    // Debug validações
    console.log("Dados de entrada:", {
        nome: payload.nome,
        cnes: payload.codigoCnes || payload.cnes,
        cnesValidated,
        cnpj: payload.cnpj,
        cnpjValidated: validateCnpj(payload.cnpj),
        tipo: payload.tipo
    });

    // Criar payload com campos obrigatórios
    const body: any = {
        nome: payload.nome.trim(),
        codigoCnes: cnesValidated,
        tipo: payload.tipo,
        ativa: true  // Campo obrigatório - sempre true para novas unidades
    };

    // CNPJ - só inclui se for válido, senão omite completamente (não envia string vazia)
    if (payload.cnpj && payload.cnpj.trim() !== "") {
        const cnpjValidated = validateCnpj(payload.cnpj);
        if (cnpjValidated) {
            body.cnpj = cnpjValidated;
        } else {
            throw new Error("CNPJ deve ter exatamente 14 dígitos numéricos");
        }
    }
    // Se CNPJ está vazio ou é null, não inclui no payload (omite completamente)

    // Log para debug
    console.log("Payload sendo enviado:", JSON.stringify(body, null, 2));

    // Verificar se o token está presente
    const token = localStorage.getItem('authToken') ||
                  localStorage.getItem('token') ||
                  localStorage.getItem('access_token');
    console.log("Token de autenticação:", token ? "Presente" : "Ausente");

    if (!token) {
        throw new Error("Token de autenticação não encontrado. Faça login novamente.");
    }

    try {
        const { data } = await api.post(BASE_PATH, body);
        return unwrap<UnidadeDTO>(data);
    } catch (error: any) {
        console.error("Erro detalhado:", {
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            headers: error?.response?.headers,
            request: error?.config
        });

        // Se for erro 400, mostrar detalhes de validação
        if (error?.response?.status === 400) {
            const validationErrors = error?.response?.data?.message || error?.response?.data?.errors || "Dados inválidos";
            throw new Error(`Erro de validação: ${validationErrors}`);
        }

        throw error;
    }
}

/** Alias não-quebrante para telas antigas. */
export const criar = criarUnidade;

/**
 * Atualiza unidade existente.
 * - Sanitiza e valida campos conforme backend.
 */
export async function atualizarUnidade(id: number, payload: UnidadeDTO): Promise<UnidadeDTO> {
    // Validações básicas para campos obrigatórios se fornecidos
    if (payload.nome !== undefined && payload.nome.trim().length === 0) {
        throw new Error("Nome não pode ser vazio");
    }

    if (payload.codigoCnes !== undefined && !validateCnes(payload.codigoCnes)) {
        throw new Error("Código CNES deve ter exatamente 7 dígitos");
    }

    const body: any = {
        ...payload,
        nome: payload.nome?.trim(),
        codigoCnes: payload.codigoCnes ? validateCnes(payload.codigoCnes || payload.cnes) || payload.codigoCnes : undefined,
        cnpj: payload.cnpj !== undefined ? validateCnpj(payload.cnpj) : undefined,
        cep: payload.cep !== undefined ? validateCep(payload.cep) : undefined,
        uf: payload.uf !== undefined ? validateUf(payload.uf) : undefined,
        estado: payload.estado !== undefined ? validateUf(payload.estado) : undefined,
        // Remove cnes field to avoid confusion
        cnes: undefined,
    };

    const { data } = await api.put(`${BASE_PATH}/${id}`, body);
    return unwrap<UnidadeDTO>(data);
}

/** Remove unidade (se a regra de negócio permitir). */
export async function removerUnidade(id: number): Promise<void> {
    await api.delete(`${BASE_PATH}/${id}`);
}

// -------------------------------
// AÇÕES ESPECIAIS
// -------------------------------

/** Ativa/Desativa a unidade (PATCH parcial, sem sobrescrever outros campos). */
export async function alterarAtivo(id: number, ativo: boolean): Promise<UnidadeDTO> {
    const { data } = await api.patch(`${BASE_PATH}/${id}/ativo`, { ativo });
    return unwrap<UnidadeDTO>(data);
}

/**
 * Atualiza flags de integração (Imunização):
 * - exportaESUSAB / exportaRNDS
 * - Usadas no módulo Vacinas para travar/exibir controles de exportação.
 */
export async function atualizarFlagsIntegracao(
    id: number,
    flags: Pick<UnidadeDTO, "exportaESUSAB" | "exportaRNDS">
): Promise<UnidadeDTO> {
    const { data } = await api.patch(`${BASE_PATH}/${id}/integracao`, flags);
    return unwrap<UnidadeDTO>(data);
}

/**
 * Busca por termo para autocompletes (seu backend tiver este endpoint).
 * GET /unidades/search?term=...&limit=...
 */
export async function buscarUnidades(term: string, opts?: { limit?: number; signal?: AbortSignal }): Promise<UnidadeDTO[]> {
    const { data } = await api.get(`${BASE_PATH}/search`, {
        params: { term, limit: opts?.limit },
        signal: opts?.signal,
    });
    return unwrap<UnidadeDTO[]>(data);
}

// -------------------------------
// UTILITY FUNCTIONS
// -------------------------------

/**
 * Retorna a descrição do tipo de unidade para o frontend
 */
export function getTipoUnidadeDescricao(tipo: TipoUnidadeSaude): string {
    const descriptions: Record<TipoUnidadeSaude, string> = {
        [TipoUnidadeSaude.GENERICA]: "Genérica",
        [TipoUnidadeSaude.UBS]: "Unidade Básica de Saúde",
        [TipoUnidadeSaude.UPA]: "Unidade de Pronto Atendimento",
        [TipoUnidadeSaude.HOSPITAL]: "Hospital",
        [TipoUnidadeSaude.CLINICA]: "Clínica",
        [TipoUnidadeSaude.LABORATORIO]: "Laboratório",
        [TipoUnidadeSaude.FARMACIA]: "Farmácia",
        [TipoUnidadeSaude.CENTRO_ESPECIALIDADES]: "Centro de Especialidades",
        [TipoUnidadeSaude.SAMU]: "Serviço de Atendimento Móvel de Urgência",
        [TipoUnidadeSaude.CAPS]: "Centro de Atenção Psicossocial",
        [TipoUnidadeSaude.POLICLINICA]: "Policlínica",
        [TipoUnidadeSaude.MATERNIDADE]: "Maternidade",
        [TipoUnidadeSaude.PRONTO_SOCORRO]: "Pronto Socorro"
    };
    return descriptions[tipo] || tipo;
}

/**
 * Retorna todas as opções de tipo de unidade para uso em formulários
 */
export function getTiposUnidadeOptions(): Array<{ value: TipoUnidadeSaude; label: string }> {
    return Object.values(TipoUnidadeSaude).map(tipo => ({
        value: tipo,
        label: getTipoUnidadeDescricao(tipo)
    }));
}

/**
 * Valida se um payload atende aos requisitos mínimos para criação
 */
export function validateUnidadeForCreation(payload: Partial<UnidadeDTO>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!payload.nome || payload.nome.trim().length === 0) {
        errors.push("Nome é obrigatório");
    }

    if (!payload.codigoCnes && !payload.cnes) {
        errors.push("Código CNES é obrigatório");
    } else {
        const cnes = payload.codigoCnes || payload.cnes;
        if (!validateCnes(cnes)) {
            errors.push("Código CNES deve ter exatamente 7 dígitos");
        }
    }

    if (!payload.tipo) {
        errors.push("Tipo da unidade é obrigatório");
    }

    if (payload.cnpj && !validateCnpj(payload.cnpj)) {
        errors.push("CNPJ deve ter 14 dígitos");
    }

    if (payload.cep && !validateCep(payload.cep)) {
        errors.push("CEP deve ter 8 dígitos");
    }

    if (payload.uf && !validateUf(payload.uf)) {
        errors.push("UF deve ter 2 letras");
    }

    if (payload.email && payload.email.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
            errors.push("Email deve ser válido");
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

// -------------------------------
// Export default (conveniente)
// -------------------------------
export default {
    listarUnidades,
    listar, // alias
    obterUnidade,
    criarUnidade,
    criar, // alias
    atualizarUnidade,
    removerUnidade,
    alterarAtivo,
    atualizarFlagsIntegracao,
    buscarUnidades,
    // Utility functions
    getTipoUnidadeDescricao,
    getTiposUnidadeOptions,
    validateUnidadeForCreation,
    TipoUnidadeSaude,
};
