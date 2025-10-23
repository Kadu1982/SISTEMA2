// src/services/AtendimentoService.ts
// -----------------------------------------------------------------------------
// Serviço de Atendimento resiliente: tenta payload completo (rich) e
// cai para um payload mínimo (minimal) em caso de 400/422.
// Agora inclui campos da CIAP-2 e Motivo de Desfecho.
// -----------------------------------------------------------------------------

import apiService from "@/services/apiService";

/* =========================
 * Tipos
 * ========================= */
export interface Atendimento {
    id?: string | number;
    pacienteId: number;
    profissionalId?: number;
    cid10?: string;
    cid?: string; // alias em alguns backends
    diagnostico?: string;

    // Clínico
    sintomas?: string;
    examesFisicos?: string;
    prescricao?: string;
    medicamentosPrescritos?: string;
    orientacoes?: string;
    retorno?: string;

    observacoes?: string;
    observacoesInternas?: string;
    statusAtendimento?: string;
    ativo?: boolean;
    dataHora?: string;

    // 🔹 CIAP-2
    ciapRfe?: string;            // 01–29
    ciapDiagnosticos?: string[]; // 70–99
    ciapProcedimentos?: string[];// 30–69

    // 🔹 MOTIVO DE DESFECHO
    motivoDesfecho?: string;
    especialidadeEncaminhamento?: string;

    // Campos adicionais para compatibilidade
    queixaPrincipal?: string;
    anamnese?: string;
    exameClinico?: string;
    condutaMedica?: string;
}

export interface AtendimentoRequest {
    pacienteId: number | string;
    profissionalId?: number | string;
    cid10?: string;
    cid?: string;
    diagnostico?: string;

    sintomas?: string;
    examesFisicos?: string;
    prescricao?: string;
    medicamentosPrescritos?: string;
    orientacoes?: string;
    retorno?: string;

    observacoes?: string;
    observacoesInternas?: string;
    statusAtendimento?: string;
    ativo?: boolean;
    dataHoraAtendimento?: string;
    dataHora?: string;

    // Compatibilidade com versões antigas
    anamnese?: string;
    exameClinico?: string;
    condutaMedica?: string;
    listaMedicamentos?: string;
    queixaPrincipal?: string;

    // 🔹 CIAP-2
    ciapRfe?: string;
    ciapDiagnosticos?: string[];
    ciapProcedimentos?: string[];

    // 🔹 MOTIVO DE DESFECHO
    motivoDesfecho?: string;
    especialidadeEncaminhamento?: string;
}

/* =========================
 * Utils
 * ========================= */
const toNumber = (v: any): number | undefined => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
};

function sanitize<T extends Record<string, any>>(obj: T): T {
    const out: any = {};
    for (const k of Object.keys(obj || {})) {
        const v = (obj as any)[k];
        if (v === undefined || v === null) continue;
        if (typeof v === "string" && v.trim() === "") continue;
        // Manter arrays vazios para CIAP
        if (Array.isArray(v) && v.length === 0 && k.startsWith('ciap')) {
            continue;
        }
        out[k] = v;
    }
    return out;
}

function extractBackendMessage(err: any): string {
    const resp = err?.response;
    if (!resp) return err?.message || "Erro desconhecido";
    const data = resp.data;
    if (typeof data === "string") return data;
    const msg =
        data?.message ||
        data?.error ||
        data?.detail ||
        (Array.isArray(data?.errors) && data.errors.join("; ")) ||
        (Array.isArray(data?.violations) && data.violations.map((v: any) => `${v?.field}: ${v?.message}`).join("; ")) ||
        `HTTP ${resp.status} - ${resp.statusText}`;
    return msg;
}

function unwrap<T>(resp: any): T {
    return (resp?.data?.data ?? resp?.data ?? resp) as T;
}

/* =========================
 * Payload builders
 * ========================= */
function normalizeCiap(code?: string): string | undefined {
    return code ? code.toUpperCase().trim().slice(0,3) : undefined;
}

function normalizeCiapList(list?: string[], max = 5): string[] | undefined {
    if (!Array.isArray(list)) return undefined;
    const filtered = list.map(c => (c || "").toUpperCase().trim().slice(0,3)).filter(Boolean).slice(0, max);
    return filtered.length > 0 ? filtered : undefined;
}

function buildRichPayload(form: AtendimentoRequest): Atendimento {
    const pacienteId = toNumber(form.pacienteId)!;
    const profissionalId = toNumber(form.profissionalId);

    const cid10 = form.cid10 ?? form.cid ?? undefined;

    // Compatibilidade com campos antigos
    const sintomas = form.sintomas ?? form.anamnese ?? undefined;
    const examesFisicos = form.examesFisicos ?? form.exameClinico ?? undefined;
    const orientacoes = form.orientacoes ?? form.condutaMedica ?? undefined;
    const medicamentosPrescritos = form.medicamentosPrescritos ?? form.listaMedicamentos ?? undefined;

    const dataHora = form.dataHoraAtendimento ?? form.dataHora ?? new Date().toISOString();

    // 🔹 CIAP normalizado
    const ciapRfe = normalizeCiap(form.ciapRfe);
    const ciapDiagnosticos = normalizeCiapList(form.ciapDiagnosticos, 5);
    const ciapProcedimentos = normalizeCiapList(form.ciapProcedimentos, 5);

    const base: Atendimento = sanitize({
        pacienteId,
        profissionalId,
        cid10,
        diagnostico: form.diagnostico,
        queixaPrincipal: form.queixaPrincipal,

        sintomas,
        examesFisicos,
        prescricao: form.prescricao,
        medicamentosPrescritos,
        orientacoes,
        retorno: form.retorno,

        observacoes: form.observacoes,
        observacoesInternas: form.observacoesInternas,

        statusAtendimento: form.statusAtendimento || "CONCLUIDO",
        ativo: form.ativo ?? true,
        dataHora,

        // 🔹 CIAP
        ciapRfe,
        ciapDiagnosticos,
        ciapProcedimentos,

        // 🔹 MOTIVO DE DESFECHO
        motivoDesfecho: form.motivoDesfecho,
        especialidadeEncaminhamento: form.especialidadeEncaminhamento,
    });

    return base;
}

function buildMinimalPayload(form: AtendimentoRequest): Partial<Atendimento> {
    // Payload mínimo para backends mais restritos
    const pacienteId = toNumber(form.pacienteId)!;
    const cid10 = form.cid10 ?? form.cid ?? undefined;

    // Incluímos CIAP e motivo de desfecho também aqui (opcional): se o backend ignorar, tudo bem
    const ciapRfe = normalizeCiap(form.ciapRfe);
    const ciapDiagnosticos = normalizeCiapList(form.ciapDiagnosticos, 5);
    const ciapProcedimentos = normalizeCiapList(form.ciapProcedimentos, 5);

    return sanitize({
        pacienteId,
        cid10,
        diagnostico: form.diagnostico,
        sintomas: form.sintomas ?? form.anamnese ?? undefined,
        examesFisicos: form.examesFisicos ?? form.exameClinico ?? undefined,
        prescricao: form.prescricao,
        orientacoes: form.orientacoes ?? form.condutaMedica ?? undefined,
        retorno: form.retorno,
        statusAtendimento: form.statusAtendimento || "CONCLUIDO",
        // 🔹 CIAP
        ciapRfe,
        ciapDiagnosticos,
        ciapProcedimentos,
        // 🔹 MOTIVO DE DESFECHO
        motivoDesfecho: form.motivoDesfecho,
        especialidadeEncaminhamento: form.especialidadeEncaminhamento,
    });
}

/* =========================
 * Service
 * ========================= */
class AtendimentoService {
    // Ajuste a base se seu backend usar outro path
    private base = "/atendimentos";

    /**
     * Criar um novo atendimento com estratégia de fallback
     */
    async criar(form: AtendimentoRequest): Promise<Atendimento> {
        console.log("🔄 Iniciando criação do atendimento...");

        // 1ª tentativa: payload completo (rich)
        const rich = buildRichPayload(form);
        console.log("📤 Tentativa 1 (rich payload):", rich);

        try {
            const resp = await apiService.post(this.base, rich, {
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Accept": "application/json"
                },
            });
            console.log("✅ Sucesso (rich):", resp.data);
            return unwrap<Atendimento>(resp);
        } catch (err: any) {
            const status = err?.response?.status;
            console.warn("⚠️ Erro tentativa 1:", status, extractBackendMessage(err));

            if (status !== 400 && status !== 422) {
                const msg = extractBackendMessage(err);
                console.error("❌ criar(rich) - erro não recuperável:", msg, err);
                throw new Error(msg);
            }
            console.log("🔄 Tentando payload mínimo...");
        }

        // 2ª tentativa: payload mínimo
        const minimal = buildMinimalPayload(form);
        console.log("📤 Tentativa 2 (minimal payload):", minimal);

        try {
            const resp = await apiService.post(this.base, minimal, {
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "X-Payload-Mode": "minimal",
                    "Accept": "application/json"
                },
            });
            console.log("✅ Sucesso (minimal):", resp.data);
            return unwrap<Atendimento>(resp);
        } catch (err: any) {
            const status = err?.response?.status;
            console.warn("⚠️ Erro tentativa 2:", status, extractBackendMessage(err));

            if (status !== 400 && status !== 422) {
                const msg = extractBackendMessage(err);
                console.error("❌ criar(minimal) - erro não recuperável:", msg, err);
                throw new Error(msg);
            }
            console.log("🔄 Tentando payload alternativo (campo 'cid')...");
        }

        // 3ª tentativa: payload alternativo (campo 'cid')
        const alt = sanitize({
            pacienteId: toNumber(form.pacienteId)!,
            cid: form.cid10 ?? form.cid ?? undefined,
            diagnostico: form.diagnostico,
            sintomas: form.sintomas ?? form.anamnese ?? undefined,
            prescricao: form.prescricao,
            orientacoes: form.orientacoes ?? form.condutaMedica ?? undefined,
            // Incluir motivo de desfecho mesmo no payload alternativo
            motivoDesfecho: form.motivoDesfecho,
            especialidadeEncaminhamento: form.especialidadeEncaminhamento,
        });
        console.log("📤 Tentativa 3 (alt payload):", alt);

        try {
            const resp = await apiService.post(this.base, alt, {
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "X-Payload-Mode": "alt-cid",
                    "Accept": "application/json"
                },
            });
            console.log("✅ Sucesso (alt):", resp.data);
            return unwrap<Atendimento>(resp);
        } catch (err3: any) {
            const msg = extractBackendMessage(err3);
            console.error("❌ criar(alt) - todas as tentativas falharam:", msg, err3);
            throw new Error(`Falha ao criar atendimento: ${msg}`);
        }
    }

    /**
     * Buscar atendimento por ID
     */
    async buscarPorId(id: string | number): Promise<Atendimento> {
        try {
            const resp = await apiService.get(`${this.base}/${id}`);
            return unwrap<Atendimento>(resp);
        } catch (err: any) {
            const msg = extractBackendMessage(err);
            console.error("❌ buscarPorId:", msg, err);
            throw new Error(msg);
        }
    }

    /**
     * Atualizar atendimento
     */
    async atualizar(id: string | number, form: AtendimentoRequest): Promise<Atendimento> {
        const payload = buildRichPayload(form);
        try {
            const resp = await apiService.put(`${this.base}/${id}`, payload, {
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Accept": "application/json"
                },
            });
            return unwrap<Atendimento>(resp);
        } catch (err: any) {
            const msg = extractBackendMessage(err);
            console.error("❌ atualizar:", msg, err);
            throw new Error(msg);
        }
    }

    /**
     * Listar atendimentos
     */
    async listar(params?: {
        page?: number;
        size?: number;
        pacienteId?: number;
        profissionalId?: number;
        dataInicio?: string;
        dataFim?: string;
    }): Promise<Atendimento[]> {
        try {
            const resp = await apiService.get(this.base, { params });
            const data = unwrap<any>(resp);

            // Se retornar uma página, extrair o conteúdo
            if (data && Array.isArray(data.content)) {
                return data.content;
            }

            // Se retornar array direto
            return Array.isArray(data) ? data : [];
        } catch (err: any) {
            const msg = extractBackendMessage(err);
            console.error("❌ listar:", msg, err);
            throw new Error(msg);
        }
    }

    /**
     * Baixar PDF do atendimento
     */
    async baixarPdf(atendimentoId: string | number): Promise<Blob> {
        try {
            const resp = await apiService.get(`${this.base}/${atendimentoId}/pdf`, {
                responseType: "blob",
            });
            return resp.data as Blob;
        } catch (err: any) {
            const msg = extractBackendMessage(err);
            console.error("❌ baixarPdf:", msg, err);
            throw new Error(msg);
        }
    }

    /**
     * Gerar e abrir PDF do atendimento
     */
    async gerarPdf(id: string | number): Promise<void> {
        try {
            const blob = await this.baixarPdf(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `atendimento-${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(url), 30000);
        } catch (err: any) {
            console.error("❌ gerarPdf:", err);
            throw err;
        }
    }

    /**
     * Abrir PDF em nova aba
     */
    async abrirPdf(id: string | number): Promise<void> {
        try {
            const blob = await this.baixarPdf(id);
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank", "noopener,noreferrer");
            setTimeout(() => window.URL.revokeObjectURL(url), 30000);
        } catch (err: any) {
            console.error("❌ abrirPdf:", err);
            throw err;
        }
    }

    // 🔧 Alias para compatibilidade com a UI
    async salvar(req: AtendimentoRequest): Promise<Atendimento> {
        return this.criar(req);
    }
}

// Instância singleton
export const atendimentoService = new AtendimentoService();
export default atendimentoService;