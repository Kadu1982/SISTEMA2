// src/services/operadoresService.ts
// -----------------------------------------------------------------------------
// Serviço de Operadores (Configurações) — compatível com OperadoresConfig.tsx.
//
// Padrões do projeto:
//   - Não prefixar com "/api": o apiService já define a baseURL.
//   - Caso a API responda com { data: ... }, este service faz unwrap.
// Endpoints esperados (ajuste se seus paths diferirem):
//   GET    /operadores?busca=          -> OperadorResumo[]
//   GET    /operadores/{id}            -> OperadorDetalhe
//   POST   /operadores                 -> OperadorDetalhe
//   PATCH  /operadores/{id}            -> OperadorDetalhe
//   PATCH  /operadores/{id}/ativo      -> { id, ativo }
//
//   GET    /operadores/{id}/restricoes -> objeto livre
//   PUT    /operadores/{id}/restricoes -> objeto livre
//
//   GET    /operadores/{id}/setores    -> number[]
//   PUT    /operadores/{id}/setores    -> void
//
//   GET    /operadores/{id}/locais     -> number[]
//   PUT    /operadores/{id}/locais     -> void
//
//   GET    /operadores/{id}/horarios   -> HorarioAcesso[]
//   PUT    /operadores/{id}/horarios   -> void
//
//   GET    /operadores/{id}/modulos    -> string[]
//   PUT    /operadores/{id}/modulos    -> void
//
//   GET    /operadores/{id}/perfis     -> string[]
//   PUT    /operadores/{id}/perfis     -> void
// -----------------------------------------------------------------------------

import api from "@/services/apiService";

/** Desembrulha respostas no formato { data: ... } */
function unwrap<T>(payload: any): T {
    return (payload && payload.data !== undefined ? payload.data : payload) as T;
}

// -----------------------------------------------------------------------------
// Tipos
// -----------------------------------------------------------------------------

/** Registro compacto para listagem */
export interface OperadorResumo {
    id: number;
    nome: string;
    login: string;
    ativo: boolean;
}

/** Registro completo para edição */
export interface OperadorDetalhe extends OperadorResumo {
    email?: string | null;
    perfis?: string[];
    roles?: string[];
    permissoes?: string[];
    [k: string]: any;
}

/** Janela de acesso usada na aba Horários */
export interface HorarioAcesso {
    diaSemana: number;      // 1=Seg ... 7=Dom
    horaInicio: string;     // "HH:mm"
    horaFim: string;        // "HH:mm"
    unidadeId: number | null;
}

// -----------------------------------------------------------------------------
// Listagem / CRUD básico
// -----------------------------------------------------------------------------

/** Lista operadores; aceita busca por nome/login. */
export async function listar(
    busca?: string,
    opts?: { signal?: AbortSignal }
): Promise<OperadorResumo[]> {
    const { data } = await api.get("/operadores", { params: { busca }, signal: opts?.signal });
    return unwrap<OperadorResumo[]>(data);
}

/** Obtém detalhes de um operador. */
export async function obter(
    id: number,
    opts?: { signal?: AbortSignal }
): Promise<OperadorDetalhe> {
    const { data } = await api.get(`/operadores/${id}`, { signal: opts?.signal });
    return unwrap<OperadorDetalhe>(data);
}

/** Cria novo operador (opcional na sua tela atual). */
export async function criar(
    payload: Partial<OperadorDetalhe>
): Promise<OperadorDetalhe> {
    const { data } = await api.post("/operadores", payload);
    return unwrap<OperadorDetalhe>(data);
}

/** Atualiza parcialmente (PATCH) um operador. */
export async function atualizar(
    id: number,
    patch: Partial<OperadorDetalhe>
): Promise<OperadorDetalhe> {
    const { data } = await api.patch(`/operadores/${id}`, patch);
    return unwrap<OperadorDetalhe>(data);
}

/** Ativa/Desativa operador. */
export async function alterarAtivo(
    id: number,
    ativo: boolean
): Promise<{ id: number; ativo: boolean }> {
    const { data } = await api.patch(`/operadores/${id}/ativo`, { ativo });
    return unwrap<{ id: number; ativo: boolean }>(data);
}

// -----------------------------------------------------------------------------
// Restrições (objeto livre em JSON)
// -----------------------------------------------------------------------------

export async function listarRestricoes(id: number): Promise<Record<string, any>> {
    const { data } = await api.get(`/operadores/${id}/restricoes`);
    return unwrap<Record<string, any>>(data) || {};
}

export async function salvarRestricoes(
    id: number,
    json: Record<string, any>
): Promise<Record<string, any>> {
    const { data } = await api.put(`/operadores/${id}/restricoes`, json);
    return unwrap<Record<string, any>>(data);
}

// -----------------------------------------------------------------------------
// Setores (array de IDs numéricos)
// -----------------------------------------------------------------------------

export async function listarSetores(id: number): Promise<number[]> {
    const { data } = await api.get(`/operadores/${id}/setores`);
    return unwrap<number[]>(data) || [];
}

export async function salvarSetores(id: number, ids: number[]): Promise<void> {
    await api.put(`/operadores/${id}/setores`, ids, {
        headers: { "Content-Type": "application/json" },
    });
}

// -----------------------------------------------------------------------------
// Locais (array de IDs numéricos)
// -----------------------------------------------------------------------------

export async function listarLocais(id: number): Promise<number[]> {
    const { data } = await api.get(`/operadores/${id}/locais`);
    return unwrap<number[]>(data) || [];
}

export async function salvarLocais(id: number, ids: number[]): Promise<void> {
    await api.put(`/operadores/${id}/locais`, ids, {
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * Salva as unidades de saúde vinculadas ao operador
 * Usa o endpoint /operadores/{id}/unidades que espera { unidadeIds: [...] }
 */
export async function salvarUnidadesOperador(id: number, unidadeIds: number[]): Promise<void> {
    await api.put(`/operadores/${id}/unidades`, { unidadeIds }, {
        headers: { "Content-Type": "application/json" },
    });
}

// -----------------------------------------------------------------------------
// Horários (array de janelas)
// -----------------------------------------------------------------------------

export async function listarHorarios(id: number): Promise<HorarioAcesso[]> {
    const { data } = await api.get(`/operadores/${id}/horarios`);
    return unwrap<HorarioAcesso[]>(data) || [];
}

export async function salvarHorarios(
    id: number,
    arr: HorarioAcesso[]
): Promise<void> {
    await api.put(`/operadores/${id}/horarios`, arr, {
        headers: { "Content-Type": "application/json" },
    });
}

// -----------------------------------------------------------------------------
// Módulos (array de strings)
// -----------------------------------------------------------------------------

export async function listarModulos(id: number): Promise<string[]> {
    const { data } = await api.get(`/operadores/${id}/modulos`);
    return unwrap<string[]>(data) || [];
}

export async function salvarModulos(id: number, vals: string[]): Promise<void> {
    await api.put(`/operadores/${id}/modulos`, vals, {
        headers: { "Content-Type": "application/json" },
    });
}

// -----------------------------------------------------------------------------
// Perfis (array de strings)
// -----------------------------------------------------------------------------

export async function listarPerfis(id: number): Promise<string[]> {
    const { data } = await api.get(`/operadores/${id}/perfis`);
    return unwrap<string[]>(data) || [];
}

export async function salvarPerfis(id: number, vals: string[]): Promise<void> {
    await api.put(`/operadores/${id}/perfis`, vals, {
        headers: { "Content-Type": "application/json" },
    });
}

// -----------------------------------------------------------------------------
// Restrições individuais (CRUD)
// -----------------------------------------------------------------------------

export async function criarRestricao(
    id: number,
    restricao: Record<string, any>
): Promise<Record<string, any>> {
    const restricoes = await listarRestricoes(id);
    const novasRestricoes = { ...restricoes, ...restricao };
    return salvarRestricoes(id, novasRestricoes);
}

export async function atualizarRestricao(
    id: number,
    restricao: Record<string, any>
): Promise<Record<string, any>> {
    return criarRestricao(id, restricao);
}

export async function removerRestricao(
    id: number,
    chave: string
): Promise<Record<string, any>> {
    const restricoes = await listarRestricoes(id);
    delete restricoes[chave];
    return salvarRestricoes(id, restricoes);
}

// -----------------------------------------------------------------------------
// Horários individuais (CRUD)
// -----------------------------------------------------------------------------

export async function criarHorario(
    id: number,
    horario: HorarioAcesso
): Promise<void> {
    const horarios = await listarHorarios(id);
    horarios.push(horario);
    return salvarHorarios(id, horarios);
}

export async function atualizarHorario(
    id: number,
    index: number,
    horario: HorarioAcesso
): Promise<void> {
    const horarios = await listarHorarios(id);
    horarios[index] = horario;
    return salvarHorarios(id, horarios);
}

export async function removerHorario(
    id: number,
    index: number
): Promise<void> {
    const horarios = await listarHorarios(id);
    horarios.splice(index, 1);
    return salvarHorarios(id, horarios);
}

// -----------------------------------------------------------------------------
// Aliases para compatibilidade com OperatorManagement.tsx
// -----------------------------------------------------------------------------

export const listarPerfisDoOperador = listarPerfis;
export const salvarPerfisDoOperador = salvarPerfis;
export const listarSetoresDoOperador = listarSetores;
export const salvarSetoresDoOperador = salvarSetores;
export const listarModulosDoOperador = listarModulos;
export const salvarModulosDoOperador = salvarModulos;
export const listarUnidadesDoOperador = listarLocais;
export const salvarUnidadesDoOperador = salvarUnidadesOperador;

// -----------------------------------------------------------------------------
// Domínios e Termos de Uso
// -----------------------------------------------------------------------------

export async function listarDominioSetores(): Promise<any[]> {
    const { data } = await api.get('/dominios/setores');
    return unwrap<any[]>(data) || [];
}

export async function listarTermos(id: number): Promise<any[]> {
    const { data } = await api.get(`/operadores/${id}/termos`);
    return unwrap<any[]>(data) || [];
}

export async function aceitarTermo(
    id: number,
    termoId: number
): Promise<void> {
    await api.post(`/operadores/${id}/termos/${termoId}/aceitar`);
}

// -----------------------------------------------------------------------------
// Auditoria de Login
// -----------------------------------------------------------------------------

export async function listarAuditoriaLogin(filtros?: {
    operadorId?: number;
    dataInicio?: string;
    dataFim?: string;
}): Promise<any[]> {
    const { data } = await api.get('/operadores/auditoria/login', { params: filtros });
    return unwrap<any[]>(data) || [];
}

// -----------------------------------------------------------------------------
// Export default — facilita import como objeto
// -----------------------------------------------------------------------------
const operadoresService = {
    listar,
    obter,
    criar,
    atualizar,
    alterarAtivo,
    listarRestricoes,
    salvarRestricoes,
    criarRestricao,
    atualizarRestricao,
    removerRestricao,
    listarSetores,
    salvarSetores,
    listarLocais,
    salvarLocais,
    salvarUnidadesOperador,
    listarHorarios,
    salvarHorarios,
    criarHorario,
    atualizarHorario,
    removerHorario,
    listarModulos,
    salvarModulos,
    listarPerfis,
    salvarPerfis,
    listarPerfisDoOperador,
    salvarPerfisDoOperador,
    listarSetoresDoOperador,
    salvarSetoresDoOperador,
    listarModulosDoOperador,
    salvarModulosDoOperador,
    listarUnidadesDoOperador,
    salvarUnidadesDoOperador,
    listarDominioSetores,
    listarTermos,
    aceitarTermo,
    listarAuditoriaLogin,
};

export default operadoresService;
