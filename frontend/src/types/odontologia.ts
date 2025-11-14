// src/types/odontologia.ts
// -----------------------------------------------------------------------------
// Tipos de domínio do módulo de Odontologia centralizados em um único arquivo.
// - Sem dependências de UI (pode ser usado no backend se desejar).
// - Mantém os mesmos nomes usados nos componentes/serviços que criamos.
// -----------------------------------------------------------------------------

/**
 * Faces odontológicas (FDI/ISO)
 * M: Mesial | D: Distal | O: Oclusal | V: Vestibular | P: Palatina | L: Lingual
 */
export type Face = "M" | "D" | "O" | "V" | "P" | "L";

/** Tratamentos/estados possíveis em um dente no odontograma */
export type TipoTratamento =
    | "sadio"
    | "carie"
    | "obturado"
    | "perdido"
    | "implante"
    | "protese"
    | "restauracao"
    | "canal"
    | "coroa"
    | "ponte"
    | "extracao"
    | "gengivite"
    | "periodontite"
    | "mobilidade"
    | "fratura"
    | "ausente";

/** Registro completo de um dente no odontograma (FDI/ISO: 11..48) */
export interface Dente {
    /** Número do dente no padrão FDI/ISO (ex.: 11..18, 21..28, 31..38, 41..48) */
    numero: number;
    /** Estado/tratamento atual do dente */
    estado: TipoTratamento;
    /** Faces afetadas (M, D, O, V, P, L) */
    faces?: Face[];
    /** Observações livres (opcional) */
    observacoes?: string;
    /** Data do último tratamento */
    dataUltimoTratamento?: string;
    /** Histórico de tratamentos */
    historico?: TratamentoHistorico[];
}

/** Registro de tratamento histórico */
export interface TratamentoHistorico {
    /** Data do tratamento */
    data: string;
    /** Tipo de tratamento realizado */
    tipo: TipoTratamento;
    /** Faces tratadas */
    faces?: Face[];
    /** Observações do tratamento */
    observacoes?: string;
    /** Profissional que realizou */
    profissional?: string;
}

/** Procedimento SIA/SUS (domínio reduzido, suficiente para registro) */
export interface ProcedimentoSUS {
    /** Código SIA/SUS do procedimento (ex.: "0701010030") */
    codigo: string;
    /** Descrição textual (ex.: "Consulta odontológica") */
    descricao: string;
    /** Valor na tabela (opcional, depende do seu backend) */
    valor?: number;
    /** Indica se o procedimento exige um dente específico */
    exigeDente?: boolean;
    /** Indica se o procedimento exige marcação de face(s) */
    exigeFace?: boolean;
}

/** Item selecionado em um atendimento odontológico */
export interface ProcedimentoSelecionado {
    procedimento: ProcedimentoSUS;
    /** Quantidade (mínimo 1) */
    quantidade: number;
    /** Dente no padrão FDI/ISO (quando aplicável) */
    dente?: number;
    /** Lista de faces marcadas (quando aplicável) */
    faces?: Face[];
    /** Observações adicionais */
    observacao?: string;
}

/* -----------------------------------------------------------------------------
   Utilitários leves (opcionais) — puros, sem dependência de UI
----------------------------------------------------------------------------- */

/** Lista de faces com rótulo — útil para construir checkboxes e legends */
export const FACES_LIST: ReadonlyArray<{ key: Face; label: string }> = [
    { key: "M", label: "Mesial" },
    { key: "D", label: "Distal" },
    { key: "O", label: "Oclusal" },
    { key: "V", label: "Vestibular" },
    { key: "P", label: "Palatina" },
    { key: "L", label: "Lingual" },
] as const;

/** Verifica se um número está no intervalo de dentes permanentes (FDI/ISO) */
export function isDentePermanente(numero: number): boolean {
    return (
        (numero >= 11 && numero <= 18) ||
        (numero >= 21 && numero <= 28) ||
        (numero >= 31 && numero <= 38) ||
        (numero >= 41 && numero <= 48)
    );
}

/** Gera o conjunto padrão de dentes permanentes (FDI/ISO) */
export function gerarDentesPermanentes(): Dente[] {
    const out: Dente[] = [];
    for (let i = 18; i >= 11; i--) out.push({ numero: i, estado: "sadio" });
    for (let i = 21; i <= 28; i++) out.push({ numero: i, estado: "sadio" });
    for (let i = 48; i >= 41; i--) out.push({ numero: i, estado: "sadio" });
    for (let i = 31; i <= 38; i++) out.push({ numero: i, estado: "sadio" });
    return out;
}

/** Mapa de cores padrão por tratamento (útil para legendas) */
export const CORES_TRATAMENTO: Readonly<Record<TipoTratamento, string>> = {
    sadio: "#4ade80",        // Verde claro
    carie: "#ef4444",        // Vermelho
    obturado: "#3b82f6",     // Azul
    perdido: "#6b7280",      // Cinza
    implante: "#8b5cf6",    // Roxo
    protese: "#f59e0b",     // Amarelo
    restauracao: "#06b6d4", // Ciano
    canal: "#6366f1",       // Índigo
    coroa: "#ec4899",       // Rosa
    ponte: "#14b8a6",       // Teal
    extracao: "#dc2626",    // Vermelho escuro
    gengivite: "#f97316",   // Laranja
    periodontite: "#991b1b", // Vermelho muito escuro
    mobilidade: "#7c3aed",  // Violeta
    fratura: "#b91c1c",     // Vermelho escuro
    ausente: "#1f2937",     // Cinza escuro
} as const;

/** Ícones para cada tipo de tratamento */
export const ICONES_TRATAMENTO: Readonly<Record<TipoTratamento, string>> = {
    sadio: "✓",
    carie: "⚠",
    obturado: "●",
    perdido: "✕",
    implante: "◉",
    protese: "◯",
    restauracao: "■",
    canal: "◼",
    coroa: "◾",
    ponte: "▮",
    extracao: "✖",
    gengivite: "▲",
    periodontite: "▼",
    mobilidade: "◄",
    fratura: "►",
    ausente: "○",
} as const;

/** Labels descritivos para cada tipo de tratamento */
export const LABELS_TRATAMENTO: Readonly<Record<TipoTratamento, string>> = {
    sadio: "São",
    carie: "Cárie",
    obturado: "Obturado",
    perdido: "Perdido",
    implante: "Implante",
    protese: "Prótese",
    restauracao: "Restauração",
    canal: "Canal",
    coroa: "Coroa",
    ponte: "Ponte",
    extracao: "Extração",
    gengivite: "Gengivite",
    periodontite: "Periodontite",
    mobilidade: "Mobilidade",
    fratura: "Fratura",
    ausente: "Ausente",
} as const;
