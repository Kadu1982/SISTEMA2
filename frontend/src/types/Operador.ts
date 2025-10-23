// src/types/Operador.ts

export type Operador = {
    id: number;
    nome: string;
    login: string;
    email?: string;
    cpf?: string | null;
    cargo: string;
    perfil?: string;
    perfis: string[];
    permissoes?: string[];
    templateId?: string;
    unidadeAtual?: string | null;
    unidadeId: number;
    isMaster: boolean;
};