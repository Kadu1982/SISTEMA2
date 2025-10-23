// frontend/src/services/documentosService.ts
// Serviço centralizado para documentos de atendimento.
// Mantém padrão do projeto: usa apiService de "@/lib/api" (default export).
// Todos os métodos retornam objetos tipados. PDFs: preferimos Base64 (JSON)
// e, quando necessário, usamos ArrayBuffer (blob) para download/visualização.

import apiService from "@/lib/api";

// ===== Tipos comuns =====
export type TipoAtestado = "AFASTAMENTO" | "COMPARECIMENTO";

export interface AtestadoPayload {
    pacienteId: number;             // obrigatório para vínculo ao prontuário
    profissionalId?: number | string;
    unidadeId?: number | string;
    // Campos de conteúdo
    tipo: TipoAtestado;
    motivo: string;
    diasAfastamento?: number;       // quando AFASTAMENTO
    horaInicio?: string;            // quando COMPARECIMENTO
    horaFim?: string;               // quando COMPARECIMENTO
    consentimentoCid?: boolean;
    cid?: string;                   // opcional (respeita consentimento)
}

export interface ReceituarioItem {
    nome: string;
    dosagem?: string;
    posologia?: string;
    duracao?: string;
    via?: string;
    quantidade?: string;
    instrucoes?: string;
    observacoes?: string;
}

export interface ReceituarioPayload {
    pacienteId: number;
    profissionalId?: number | string;
    unidadeId?: number | string;
    itens: ReceituarioItem[];
}

export interface JsonPdfResponse {
    success: boolean;
    message?: string;
    fileName?: string;
    pdfBase64?: string; // PDF em Base64
}

// ===== Atestado =====
export async function gerarAtestado(payload: AtestadoPayload): Promise<JsonPdfResponse> {
    const { data } = await apiService.post("/documentos/atestado/gerar", payload);
    return data as JsonPdfResponse;
}

// ===== Receituário =====
export async function gerarReceituario(payload: ReceituarioPayload): Promise<JsonPdfResponse> {
    const { data } = await apiService.post("/documentos/receituario/gerar", payload);
    return data as JsonPdfResponse;
}

// ===== Ficha de Atendimento (PDF binário) =====
export async function baixarFichaAtendimento(atendimentoId: string | number): Promise<Blob> {
    const { data } = await apiService.get<ArrayBuffer>(`/atendimentos/${atendimentoId}/pdf`, { responseType: "arraybuffer" });
    return new Blob([data], { type: "application/pdf" });
}

// ===== Comprovante de Agendamento (PDF binário) =====
export async function baixarComprovanteAgendamento(agendamentoId: number): Promise<Blob> {
    const { data } = await apiService.get<ArrayBuffer>(`/agendamentos/${agendamentoId}/comprovante/pdf`, { responseType: "arraybuffer" });
    return new Blob([data], { type: "application/pdf" });
}

// ===== SADT (retorno em JSON com Base64) =====
export interface GerarSadtRequest {
    pacienteId: number | string;
    agendamentoId: number;
    prioridade?: string;
    procedimentos: Array<{ codigo: string; descricao?: string }>;
    cid?: string;
}

export interface SadtResponse {
    sucesso: boolean;
    numeroSadt?: string;
    pdfBase64?: string;
    erro?: string;
}

export async function gerarSadt(req: GerarSadtRequest): Promise<SadtResponse> {
    const { data } = await apiService.post("/sadt/gerar", req);
    return data as SadtResponse;
}
