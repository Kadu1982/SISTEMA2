/**
 * Lista de Centros de Custo (Estoque) da Unidade
 * - Somente leitura (alinhado ao serviço atual)
 * - Exibe políticas de código sequencial e de geração de entrada por transferência
 *
 * NOTA IMPORTANTE:
 *  - Ajuste apenas visual: "Locais de Armazenamento" -> "Centros de Custo (Estoque)".
 *  - Nenhuma lógica/fluxo foi alterado para não impactar funcionalidades existentes.
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HomeIcon, Search, Cog } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { estoqueService } from '@/services/estoqueService';
import type { LocalArmazenamento } from '@/types/estoque';
import { GeracaoEntradaTransferencia, PoliticaCodigoSequencial } from '@/types/estoque';

export default function EstoqueUnidade() {
    const [busca, setBusca] = useState('');
    const { data: locais = [], isLoading } = useQuery({
        queryKey: ['locais-estoque'],
        queryFn: () => estoqueService.listarLocais(),
    });

    const filtrados = useMemo(() => {
        const q = busca.trim().toLowerCase();
        return (locais as LocalArmazenamento[]).filter(
            (l) => !q || l.nome.toLowerCase().includes(q) || String(l.unidadeSaudeId).includes(q),
        );
    }, [locais, busca]);

    const seqLabel = (p: PoliticaCodigoSequencial) =>
        p === PoliticaCodigoSequencial.POR_LOTE
            ? 'Por Lote'
            : p === PoliticaCodigoSequencial.POR_FABRICANTE
                ? 'Por Fabricante'
                : 'Não';

    const geracaoLabel = (g: GeracaoEntradaTransferencia) =>
        g === GeracaoEntradaTransferencia.AO_TRANSFERIR
            ? 'Ao Transferir'
            : g === GeracaoEntradaTransferencia.AO_CONFIRMAR
                ? 'Ao Confirmar'
                : 'Não Gerar';

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <HomeIcon className="h-5 w-5" />
                    {/* Ajuste visual aqui */}
                    <CardTitle>Centros de Custo (Estoque)</CardTitle>
                </div>
                {/* Ajuste visual aqui */}
                <CardDescription>Configurações operacionais dos Centros de Custo (somente leitura).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        className="pl-8"
                        placeholder="Buscar por nome ou ID da unidade..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Unidade (ID)</TableHead>
                                <TableHead className="flex items-center gap-1">
                                    <Cog className="h-4 w-4" />
                                    Código Sequencial
                                </TableHead>
                                <TableHead>Entrada por Transferência</TableHead>
                                <TableHead>Código por Lote?</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-sm text-gray-500">
                                        Carregando...
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isLoading && filtrados.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-sm text-gray-500">
                                        Nenhum Centro de Custo encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filtrados.map((l) => (
                                <TableRow key={l.id}>
                                    <TableCell className="font-medium">{l.nome}</TableCell>
                                    <TableCell>{l.unidadeSaudeId}</TableCell>
                                    <TableCell>{seqLabel(l.politicaCodigoSequencial)}</TableCell>
                                    <TableCell>{geracaoLabel(l.geracaoEntradaTransferencia)}</TableCell>
                                    <TableCell>{l.usaCodigoBarrasPorLote ? 'Sim' : 'Não'}</TableCell>
                                    <TableCell>
                                        {l.ativo ? <Badge>Ativo</Badge> : <Badge variant="secondary">Inativo</Badge>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
