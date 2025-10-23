// src/services/odontologiaService.ts
// -----------------------------------------------------------------------------
// Serviço de Odontologia (SIA/SUS)
// - Agora importa os tipos de src/types/odontologia.ts (sem duplicar).
// - Buscar procedimentos (com normalização) e salvar no atendimento.
// -----------------------------------------------------------------------------

import apiService from "@/services/apiService";
import type {
    ProcedimentoSUS,
    ProcedimentoSelecionado,
} from "@/types/odontologia";

/** Normaliza diferentes formatos de retorno do backend para ProcedimentoSUS[] */
function normalizeProcedimentos(data: any): ProcedimentoSUS[] {
    let arr: any[] = [];
    if (Array.isArray(data)) arr = data;
    else if (Array.isArray(data?.itens)) arr = data.itens;
    else if (Array.isArray(data?.items)) arr = data.items;
    else if (Array.isArray(data?.content)) arr = data.content;
    else if (Array.isArray(data?.resultados)) arr = data.resultados;

    // Heurísticas simples (ajuste conforme seu backend)
    const exigeDenteRegex = /(dente|unitári|unidade|elemento dentário)/i;
    const exigeFaceRegex = /(face|superfície)/i;

    return (arr || []).map((p: any) => ({
        codigo: String(p.codigo ?? p.cod ?? p.procedimento ?? ""),
        descricao: String(p.descricao ?? p.nome ?? p.ds_procedimento ?? ""),
        valor: p.valor ?? p.vl ?? undefined,
        exigeDente: !!exigeDenteRegex.test(String(p.descricao ?? "")),
        exigeFace: !!exigeFaceRegex.test(String(p.descricao ?? "")),
    })) as ProcedimentoSUS[];
}

/** Busca procedimentos SIA/SUS por termo (código ou descrição) */
export async function buscarProcedimentos(
    termo: string,
    limite = 20
): Promise<ProcedimentoSUS[]> {
    const params = { termo, limite };
    try {
        const { data } = await apiService.get("/odonto/procedimentos", { params });
        return normalizeProcedimentos(data).slice(0, limite);
    } catch {
        try {
            const { data } = await apiService.get("/procedimentos-sus", { params });
            return normalizeProcedimentos(data).slice(0, limite);
        } catch (e) {
            console.error("buscarProcedimentos falhou:", e);
            return [];
        }
    }
}

/** Salva os procedimentos selecionados de um atendimento */
export async function salvarProcedimentosAtendimento(
    atendimentoId: number | string,
    itens: ProcedimentoSelecionado[]
): Promise<{ success: boolean; message?: string }> {
    try {
        const payload = itens.map((i) => ({
            codigo: i.procedimento.codigo,
            quantidade: i.quantidade,
            dente: i.dente ?? null,
            faces: i.faces ?? [],
            observacao: i.observacao ?? null,
        }));
        await apiService.post(
            `/odonto/atendimentos/${atendimentoId}/procedimentos`,
            payload
        );
        return { success: true };
    } catch (e: any) {
        console.error("salvarProcedimentosAtendimento:", e);
        return { success: false, message: e?.message || "Falha ao salvar procedimentos." };
    }
}

const odontologiaService = {
    buscarProcedimentos,
    salvarProcedimentosAtendimento,
};
export default odontologiaService;
