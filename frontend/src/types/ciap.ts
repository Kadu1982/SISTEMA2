// src/types/ciap.ts
// Tipos e utilidades da CIAP-2 (ICPC-2 em PT)

export type CiapCodigo = string; // Ex.: "A01", "K86"

export interface CiapItem {
    codigo: CiapCodigo; // letra + 2 dígitos
    titulo: string;     // rótulo em PT
    capitulo: string;   // A, B, D, F, H, K, L, N, P, R, S, T, U, W, X, Y, Z
}

// Faixas por componente (pela numeração)
export type CiapComponente = "RFE" | "PROCESSO" | "DIAGNOSTICO";

// Validação básica: 1 letra + 2 dígitos
export const isCiapCode = (c: string) => /^[A-Z][0-9]{2}$/.test(c);

// Identifica a “faixa” (componente) pelo número
export const getFaixa = (c: string): CiapComponente | null => {
    if (!isCiapCode(c)) return null;
    const n = parseInt(c.slice(1), 10);
    if (n >= 1 && n <= 29) return "RFE";         // Motivo de Encontro
    if (n >= 30 && n <= 69) return "PROCESSO";   // Processos/Procedimentos
    if (n >= 70 && n <= 99) return "DIAGNOSTICO";// Diagnósticos/Doenças
    return null;
};
