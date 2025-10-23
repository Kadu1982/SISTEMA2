/**
 * Centralização de rótulos para manter a identidade do produto.
 * - Exporta constantes em formato UPPER_SNAKE para fácil reutilização.
 * - "as const" preserva o literal dos valores.
 * - Sem dependências externas.
 */

export const LABEL_CENTRO_CUSTO = 'Centro de Custo' as const;
export const LABEL_CENTRO_CUSTO_PLURAL = 'Centros de Custo' as const;

// (Opcional) variações padronizadas para títulos/descrições
export const LABELS = {
    singular: LABEL_CENTRO_CUSTO,
    plural: LABEL_CENTRO_CUSTO_PLURAL,
    tituloConfig: 'Configuração de Centro de Custo',
    tituloLista: 'Centros de Custo (Estoque)',
} as const;

// (Opcional) helper para interpolar textos de forma consistente
export function tituloPaginaBase(sufixo?: string) {
    return sufixo ? `${LABEL_CENTRO_CUSTO} - ${sufixo}` : LABEL_CENTRO_CUSTO;
}
