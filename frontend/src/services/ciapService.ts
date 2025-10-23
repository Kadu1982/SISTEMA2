// src/services/ciapService.ts
// Serviço de leitura/pesquisa local do arquivo de códigos da CIAP-2.
// Aponta para "src/assets/ciap/ciap.json", gerado pelo script valida-ciap.ts.

import type { CiapItem } from "@/types/ciap";
import { isCiapCode } from "@/types/ciap";

// Import estático do JSON gerado (bundler do Vite suporta)
import ciap from "@/assets/ciap/ciap.json";

// Cache local para evitar parsing toda hora
const cache: CiapItem[] = Array.isArray(ciap) ? (ciap as unknown as CiapItem[]) : [];

export function getAllCiap(): CiapItem[] {
    return cache;
}

export function getByCode(codigo: string): CiapItem | undefined {
    const c = (codigo || "").toUpperCase().trim();
    if (!isCiapCode(c)) return undefined;
    return cache.find(i => i.codigo === c);
}

// Busca simples por código ou texto (case-insensitive) com corte
export function searchCiap(query: string, limit = 30): CiapItem[] {
    const q = (query || "").trim().toLowerCase();
    if (!q) return [];
    const res = cache.filter(i =>
        i.codigo.toLowerCase().includes(q) ||
        i.titulo.toLowerCase().includes(q)
    );
    return res.slice(0, limit);
}
