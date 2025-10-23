/**
 * Formulário de Configuração de Centro de Custo
 * - Reutilizável (criação/edição)
 * - Campos espelhados do manual e compatíveis com o tipo LocalArmazenamento
 *
 * Integração:
 *  - onSubmit(payload) deve chamar o service (criar/atualizar)
 *  - onCancel() fecha diálogo/modal sem salvar
 *
 * Correção de TS2339:
 *  - Alguns projetos exportam enums com chaves diferentes (ex.: NAO_GERAR ao invés de NAO).
 *  - Para não quebrar o build, resolvemos dinamicamente as chaves do enum no runtime,
 *    com fallback para strings equivalentes.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { CentroCusto } from '@/services/centroCustoService';
import { GeracaoEntradaTransferencia, PoliticaCodigoSequencial } from '@/types/estoque';

type Props = {
    initial?: Partial<CentroCusto>;
    onSubmit: (payload: Partial<CentroCusto>) => Promise<void> | void;
    onCancel?: () => void;
    submitting?: boolean;
};

/** Utilitário: resolve chave de enum com fallback (evita TS2339 em projetos com variação de chaves) */
function resolveEnumKey<E extends Record<string, any>>(en: E, ...candidates: string[]) {
    for (const key of candidates) {
        if (key in en) return (en as any)[key];
    }
    // Se não achar nenhuma, devolve o primeiro valor do enum (string ou number) como fallback seguro
    const values = Object.values(en);
    return values.length > 0 ? values[0] : undefined;
}

/**
 * Resolução dinâmica dos valores de enum usados no formulário
 * - Geração de Entrada por Transferência: tenta NAO / NAO_GERAR / NONE
 * - Política de Código Sequencial: tenta NAO / NAO_APLICA
 */
const GERACAO_VALUES = {
    NAO: resolveEnumKey(GeracaoEntradaTransferencia, 'NAO', 'NAO_GERAR', 'NONE', 'NAO_GERAR_ENTRADA'),
    AO_TRANSFERIR: resolveEnumKey(GeracaoEntradaTransferencia, 'AO_TRANSFERIR'),
    AO_CONFIRMAR: resolveEnumKey(GeracaoEntradaTransferencia, 'AO_CONFIRMAR'),
} as const;

const POLITICA_VALUES = {
    NAO: resolveEnumKey(PoliticaCodigoSequencial, 'NAO', 'NAO_APLICA', 'NONE'),
    POR_LOTE: resolveEnumKey(PoliticaCodigoSequencial, 'POR_LOTE'),
    POR_FABRICANTE: resolveEnumKey(PoliticaCodigoSequencial, 'POR_FABRICANTE'),
} as const;

export default function CentroCustoForm({ initial, onSubmit, onCancel, submitting }: Props) {
    const [nome, setNome] = useState(initial?.nome ?? '');
    const [unidadeSaudeId, setUnidadeSaudeId] = useState<number | ''>(initial?.unidadeSaudeId ?? '');

    // ✅ Estados iniciais usando valores resolvidos, sem referenciar diretamente .NAO
    const [politica, setPolitica] = useState<PoliticaCodigoSequencial>(
        (initial?.politicaCodigoSequencial as PoliticaCodigoSequencial) ??
        (POLITICA_VALUES.NAO as PoliticaCodigoSequencial)
    );
    const [geracao, setGeracao] = useState<GeracaoEntradaTransferencia>(
        (initial?.geracaoEntradaTransferencia as GeracaoEntradaTransferencia) ??
        (GERACAO_VALUES.NAO as GeracaoEntradaTransferencia)
    );

    const [codigoPorLote, setCodigoPorLote] = useState<boolean>(!!initial?.usaCodigoBarrasPorLote);
    const [ativo, setAtivo] = useState<boolean>(initial?.ativo ?? true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: Partial<CentroCusto> = {
            nome: nome?.trim(),
            unidadeSaudeId: unidadeSaudeId === '' ? undefined : Number(unidadeSaudeId),
            // Mantém os valores exatos (string/number) do enum do projeto
            politicaCodigoSequencial: politica as any,
            geracaoEntradaTransferencia: geracao as any,
            usaCodigoBarrasPorLote: codigoPorLote,
            ativo,
        };
        await onSubmit(payload);
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="nome">Nome do Centro de Custo</Label>
                    <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="unidade">Unidade de Saúde (ID)</Label>
                    <Input
                        id="unidade"
                        type="number"
                        value={unidadeSaudeId}
                        onChange={(e) => setUnidadeSaudeId(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Ex.: 12"
                    />
                </div>

                {/* Política de Código Sequencial */}
                <div>
                    <Label>Política de Código Sequencial</Label>
                    <Select
                        value={String(politica)}
                        onValueChange={(v) => setPolitica(v as unknown as PoliticaCodigoSequencial)}
                    >
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={String(POLITICA_VALUES.NAO)}>Não</SelectItem>
                            <SelectItem value={String(POLITICA_VALUES.POR_LOTE)}>Por Lote</SelectItem>
                            <SelectItem value={String(POLITICA_VALUES.POR_FABRICANTE)}>Por Fabricante</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Geração de Entrada por Transferência */}
                <div>
                    <Label>Geração de Entrada por Transferência</Label>
                    <Select
                        value={String(geracao)}
                        onValueChange={(v) => setGeracao(v as unknown as GeracaoEntradaTransferencia)}
                    >
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={String(GERACAO_VALUES.NAO)}>Não Gerar</SelectItem>
                            <SelectItem value={String(GERACAO_VALUES.AO_TRANSFERIR)}>Ao Transferir</SelectItem>
                            <SelectItem value={String(GERACAO_VALUES.AO_CONFIRMAR)}>Ao Confirmar</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Switches */}
                <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                        <Label htmlFor="codigo-por-lote">Utiliza código de barras por Lote?</Label>
                        <p className="text-xs text-muted-foreground">Quando ativo, a saída/transferência filtra lotes pelo código.</p>
                    </div>
                    <Switch id="codigo-por-lote" checked={codigoPorLote} onCheckedChange={setCodigoPorLote} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                        <Label htmlFor="ativo">Ativo</Label>
                        <p className="text-xs text-muted-foreground">Centros de Custo inativos não aparecem para operações.</p>
                    </div>
                    <Switch id="ativo" checked={ativo} onCheckedChange={setAtivo} />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Salvando...' : 'Salvar'}
                </Button>
            </div>
        </form>
    );
}
