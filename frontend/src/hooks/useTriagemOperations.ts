// src/hooks/useTriagemOperations.ts
// -----------------------------------------------------------------------------
// Hook de operações da TRIAGEM, usado por <TriagemPaciente />.
// Mantém nomes e padrões já utilizados na sua UI.
// Agora com normalização de datas-com-recepcionados -> sempre { date, count }
// para evitar TS2339 e variações de payload da API.
// -----------------------------------------------------------------------------
//
// Endpoints esperados (ajuste se o seu backend usar outros):
//  GET    /triagem/aguardando?dataReferencia=YYYY-MM-DD
//  GET    /triagem/triados
//  GET    /triagem/datas-com-recepcionados           -> [{ date: "YYYY-MM-DD", count: number }] (ou { data, quantidade })
//        (fallback) /agendamentos/recepcionados/datas -> idem
//  POST   /triagem
//  DELETE /triagem/{id}
//
// Observação: se o seu apiService já faz unwrap ({data: ...}),
// as funções abaixo lidam com ambos os casos (com/sem {data}).
// -----------------------------------------------------------------------------

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";

// =====================
// Enums / Constantes
// =====================

export type MotivoConsulta =
    | "CONSULTA"
    | "RETORNO"
    | "PRE_NATAL"
    | "ACOLHIMENTO"
    | "PAPANICOLAU"
    | "PUERPERIO";

export const MOTIVOS_CONSULTA: Array<{ value: MotivoConsulta; label: string }> = [
    { value: "CONSULTA", label: "Consulta" },
    { value: "RETORNO", label: "Retorno" },
    { value: "PRE_NATAL", label: "Pré-natal" },
    { value: "ACOLHIMENTO", label: "Acolhimento" },
    { value: "PAPANICOLAU", label: "Papanicolau" },
    { value: "PUERPERIO", label: "Puerpério" },
];

// 4..42 semanas (UI usa um select com estas opções)
export const SEMANAS_GESTACAO: Array<{ value: number; label: string }> = Array.from(
    { length: 42 - 4 + 1 },
    (_, i) => {
        const v = 4 + i;
        return { value: v, label: `${v} semanas` };
    }
);

// =====================
// Tipos de dados
// =====================

/** Paciente recepcionado aguardando triagem */
export interface PacienteParaTriagem {
    agendamentoId: number;
    pacienteId: number;
    nomeCompleto: string;
    cartaoSus?: string | null;
    idade?: number | null;
    horarioRecepcao?: string | null; // "HH:mm"
    tipoConsulta?: string | null;
    sexo?: string | null;
    [k: string]: any;
}

/** Paciente já triado (para listas secundárias) */
export interface PacienteTriado {
    triagemId: number;
    agendamentoId: number;
    pacienteId: number;
    nomeCompleto: string;
    cartaoSus?: string | null;
    idade?: number | null;
    horarioTriagem: string; // "HH:mm"
    tipoConsulta: string;
    classificacaoRisco?: "VERMELHO" | "LARANJA" | "AMARELO" | "VERDE" | "AZUL";
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
    isUpaTriagem?: boolean;
    // Saúde da mulher
    dumInformada?: string;
    gestanteInformado?: boolean;
    semanasGestacaoInformadas?: number;
}

/** Payload padrão para criar triagem */
export interface CriarTriagemRequest {
    agendamentoId: number;
    pacienteId: number;
    motivoConsulta: MotivoConsulta;

    // Sinais vitais
    pressaoArterial?: string;
    temperatura?: number;
    peso?: number;
    altura?: number;
    frequenciaCardiaca?: number;
    frequenciaRespiratoria?: number;
    saturacaoOxigenio?: number;
    escalaDor?: number;

    // Texto livre
    queixaPrincipal: string;
    observacoes?: string;
    alergias?: string;

    // Saúde da Mulher
    dumInformada?: string; // YYYY-MM-DD
    gestanteInformado?: boolean;
    semanasGestacaoInformadas?: number;

    // Controle
    dataReferencia?: string; // YYYY-MM-DD (dia da triagem)
}

/** Datas com recepcionados (TIPO CANÔNICO) */
export interface DataComPacientesRecepcionados {
    date: string;  // "YYYY-MM-DD"
    count: number; // quantidade no dia
}

// =====================
// Utils internas
// =====================

function unwrap<T>(payload: any): T {
    return (payload && (payload.data !== undefined ? payload.data : payload)) as T;
}
function getMesFromIso(d: string): string {
    return (d || "").slice(0, 7); // "YYYY-MM"
}

/** Normaliza qualquer formato -> { date, count } */
function normalizeDatasComRecepcionados(input: any): DataComPacientesRecepcionados[] {
    const arr = unwrap<any[]>(input);
    if (!Array.isArray(arr)) return [];
    return arr
        .map((item) => {
            const date = String(item?.date ?? item?.data ?? "").slice(0, 10);
            const count = Number(item?.count ?? item?.quantidade ?? 0);
            return { date, count };
        })
        .filter((d) => !!d.date);
}

// =====================
// Chamadas de API
// =====================

async function fetchPacientesAguardando(dataReferencia?: string): Promise<PacienteParaTriagem[]> {
    const params = dataReferencia ? { dataReferencia } : undefined;
    const resp = await apiService.get("/triagem/aguardando", { params });
    return unwrap<PacienteParaTriagem[]>(resp);
}

async function fetchPacientesTriados(): Promise<PacienteTriado[]> {
    const resp = await apiService.get("/triagem/triados");
    return unwrap<PacienteTriado[]>(resp);
}

async function fetchDatasComPacientesRecepcionados(mes: string): Promise<DataComPacientesRecepcionados[]> {
    // Tenta rota oficial da triagem; se falhar, usa a rota de agendamentos como fallback.
    try {
        const resp = await apiService.get("/triagem/datas-com-recepcionados", { params: { mes } });
        return normalizeDatasComRecepcionados(resp);
    } catch {
        const resp2 = await apiService.get("/agendamentos/recepcionados/datas", { params: { mes } });
        return normalizeDatasComRecepcionados(resp2);
    }
}

async function postTriagem(payload: CriarTriagemRequest): Promise<any> {
    const resp = await apiService.post("/triagem", payload);
    return unwrap<any>(resp);
}

async function deleteTriagem(triagemId: number): Promise<void> {
    await apiService.delete(`/triagem/${triagemId}`);
}

// =====================
// Hook principal
// =====================

export function useTriagemOperations(selectedDate: string) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Data referência (YYYY-MM-DD) e mês
    const dataReferencia = (selectedDate || new Date().toISOString().slice(0, 10)).slice(0, 10);
    const mes = getMesFromIso(dataReferencia);

    // --- Queries ---

    const {
        data: pacientesAguardando = [],
        isLoading: isLoadingAguardando,
        isError: isErrorAguardando,
    } = useQuery({
        queryKey: ["pacientesAguardandoTriagem", dataReferencia],
        queryFn: () => fetchPacientesAguardando(dataReferencia),
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });

    const {
        data: pacientesTriados = [],
        isLoading: isLoadingTriados,
        isError: isErrorTriados,
    } = useQuery({
        queryKey: ["pacientesTriados"],
        queryFn: fetchPacientesTriados,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const {
        data: datasComPacientesRecepcionados = [],
        isLoading: isLoadingDatasRecepcionados,
        isError: isErrorDatasRecepcionados,
    } = useQuery({
        queryKey: ["datasComPacientesRecepcionados", mes],
        queryFn: () => fetchDatasComPacientesRecepcionados(mes),
        staleTime: 5 * 60_000,
        refetchOnWindowFocus: false,
    });

    // --- Mutations ---

    const { mutate: salvarTriagem, isPending: isSaving } = useMutation({
        mutationFn: postTriagem,
        onSuccess: () => {
            toast({
                title: "✅ Triagem salva",
                description: "Paciente encaminhado para atendimento.",
                className: "bg-green-100 text-green-800",
            });
            queryClient.invalidateQueries({ queryKey: ["pacientesAguardandoTriagem", dataReferencia] });
            queryClient.invalidateQueries({ queryKey: ["pacientesTriados"] });
            queryClient.invalidateQueries({ queryKey: ["datasComPacientesRecepcionados"] });
        },
        onError: (err: any) => {
            toast({
                title: "❌ Erro ao salvar triagem",
                description: err?.response?.data?.message ?? "Não foi possível salvar a triagem.",
                variant: "destructive",
            });
        },
    });

    const { mutate: cancelarTriagem, isPending: isCanceling } = useMutation({
        mutationFn: deleteTriagem,
        onSuccess: () => {
            toast({
                title: "✅ Triagem cancelada",
                description: "Registro de triagem removido.",
                className: "bg-yellow-100 text-yellow-800",
            });
            queryClient.invalidateQueries({ queryKey: ["pacientesTriados"] });
            queryClient.invalidateQueries({ queryKey: ["pacientesAguardandoTriagem", dataReferencia] });
            queryClient.invalidateQueries({ queryKey: ["datasComPacientesRecepcionados"] });
        },
        onError: (err: any) => {
            toast({
                title: "❌ Erro ao cancelar triagem",
                description: err?.response?.data?.message ?? "Não foi possível cancelar a triagem.",
                variant: "destructive",
            });
        },
    });

    // --- Helpers para o calendário (agora só usa {date,count}) ---

    /** Diz se há recepcionados no dia e a quantidade — nome mantido para sua UI. */
    function hasRecepcioandosPorData(diaIso: string): { has: boolean; quantidade: number } {
        const key = (diaIso || "").slice(0, 10);
        const item = (datasComPacientesRecepcionados || []).find(
            (d) => (d.date || "").slice(0, 10) === key
        );
        const q = Number(item?.count ?? 0);
        return { has: q > 0, quantidade: q };
    }

    return {
        // Fila e triados
        pacientesAguardando,
        isLoadingAguardando,
        isErrorAguardando,

        pacientesTriados,
        isLoadingTriados,
        isErrorTriados,

        // Datas/Calendário
        datasComPacientesRecepcionados,
        isLoadingDatasRecepcionados,
        isErrorDatasRecepcionados,
        hasRecepcioandosPorData,

        // Ações
        salvarTriagem,
        isSaving,
        cancelarTriagem,
        isCanceling,
    };
}
