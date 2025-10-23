// frontend/src/types/Cid.ts

// ✅ INTERFACE CORRIGIDA para resolver os erros TypeScript
export interface Cid {
    id: number;                    // ✅ ID obrigatório (chave primária)
    codigo: string;               // Código CID (ex: "A00.1")
    descricao: string;           // Descrição da doença
    categoria?: string;          // ✅ Categoria opcional (resolve erro TS2339)
    capitulo?: string;           // Capítulo do CID
    subcategoria?: string;       // Subcategoria do CID
    ativo?: boolean;             // Se o CID está ativo
    dataAtualizacao?: string;    // Data da última atualização
    versao?: string;             // Versão do CID (ex: "CID-10")
}

// ✅ INTERFACE para busca de CID
export interface CidBuscaRequest {
    codigo?: string;
    descricao?: string;
    termo?: string;
    limite?: number;
    offset?: number;
}

// ✅ INTERFACE para resposta da API
export interface CidBuscaResponse {
    resultados: Cid[];
    total: number;
    pagina?: number;
    totalPaginas?: number;
    temMais?: boolean;
}

// ✅ TIPO para operações do formulário
export interface CidSelecionado {
    cid: Cid | null;
    texto: string;
}