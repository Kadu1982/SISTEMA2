// frontend/src/types/Remume.ts

export interface MedicamentoRemume {
    id: number;
    nome: string;              // Nome do medicamento
    apresentacao?: string;      // Apresentação (ex: "500mg", "comprimidos", "solução")
    principioAtivo?: string;   // Princípio ativo
    concentracao?: string;      // Concentração
    formaFarmaceutica?: string; // Forma farmacêutica (comprimido, solução, etc)
    codigo?: string;           // Código do medicamento (se houver)
    ativo?: boolean;           // Se está ativo/disponível
}

export interface RemumeBuscaRequest {
    termo?: string;
    nome?: string;
    principioAtivo?: string;
    limite?: number;
    offset?: number;
}

