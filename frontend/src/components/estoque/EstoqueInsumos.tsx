/**
 * Lista de Insumos do Estoque (somente leitura)
 * - Busca/filtra por descrição
 * - Filtro por tipo de controle de estoque
 * - Tabela com apresentação, unidade de medida, controle e status
 *
 * Mantém a identidade visual do projeto (shadcn/ui + Tailwind).
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PackageSearch, Filter } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import { estoqueService } from '@/services/estoqueService';
import type { Insumo } from '@/types/estoque';
import { TipoControleEstoque } from '@/types/estoque';

export default function EstoqueInsumos() {
    const [busca, setBusca] = useState('');
    const [filtroControle, setFiltroControle] = useState<string>('TODOS');

    const { data: insumos = [], isLoading } = useQuery({
        queryKey: ['insumos-estoque'],
        queryFn: () => estoqueService.listarInsumos(),
    });

    const filtrados = useMemo(() => {
        const q = busca.trim().toLowerCase();
        return (insumos as Insumo[]).filter((i) => {
            const matchBusca =
                !q ||
                i.descricao.toLowerCase().includes(q) ||
                (i.descricaoCompleta || '').toLowerCase().includes(q);
            const matchControle =
                filtroControle === 'TODOS' || i.controleEstoque === (filtroControle as any);
            return matchBusca && matchControle;
        });
    }, [insumos, busca, filtroControle]);

    const controleLabel = (c?: TipoControleEstoque) => {
        switch (c) {
            case TipoControleEstoque.NAO: return 'Não';
            case TipoControleEstoque.QUANTIDADE: return 'Quantidade';
            case TipoControleEstoque.VENCIMENTO: return 'Vencimento';
            case TipoControleEstoque.LOTE: return 'Lote do fabricante';
            default: return '—';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <PackageSearch className="h-5 w-5" />
                    <CardTitle>Insumos</CardTitle>
                </div>
                <CardDescription>Catálogo de insumos utilizados nas movimentações.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                        <PackageSearch className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            className="pl-8"
                            placeholder="Buscar por descrição..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                            <Filter className="h-4 w-4" /> Controle de estoque
                        </div>
                        <Select value={filtroControle} onValueChange={setFiltroControle}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TODOS">Todos</SelectItem>
                                <SelectItem value={TipoControleEstoque.NAO}>Não</SelectItem>
                                <SelectItem value={TipoControleEstoque.QUANTIDADE}>Quantidade</SelectItem>
                                <SelectItem value={TipoControleEstoque.VENCIMENTO}>Vencimento</SelectItem>
                                <SelectItem value={TipoControleEstoque.LOTE}>Lote do fabricante</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tabela */}
                <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Apresentação • Dosagem</TableHead>
                                <TableHead>Unidade</TableHead>
                                <TableHead>Controle</TableHead>
                                <TableHead>Cód. de Barras</TableHead>
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
                                        Nenhum insumo encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filtrados.map((i) => (
                                <TableRow key={i.id}>
                                    <TableCell className="font-medium">{i.descricao}</TableCell>
                                    <TableCell>{[i.apresentacao, i.dosagem].filter(Boolean).join(' • ') || '—'}</TableCell>
                                    <TableCell>{i.unidadeMedida || '—'}</TableCell>
                                    <TableCell>{controleLabel(i.controleEstoque)}</TableCell>
                                    <TableCell>{i.codigoBarrasPadrao || '—'}</TableCell>
                                    <TableCell>
                                        {i.ativo ? (
                                            <Badge>Ativo</Badge>
                                        ) : (
                                            <Badge variant="secondary">Inativo</Badge>
                                        )}
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
