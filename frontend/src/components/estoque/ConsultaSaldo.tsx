/** Consulta de Saldos por Lote (Local + Insumo) */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Package } from 'lucide-react';
import { estoqueService } from '@/services/estoqueService';
import type { LocalArmazenamento, Insumo, SaldoPorLoteDTO } from '@/types/estoque';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ConsultaSaldos() {
    const [localSelecionado, setLocalSelecionado] = useState<number | null>(null);
    const [insumoSelecionado, setInsumoSelecionado] = useState<number | null>(null);

    const { data: locais = [] } = useQuery({ queryKey: ['locais-estoque'],  queryFn: () => estoqueService.listarLocais() });
    const { data: insumos = [] } = useQuery({ queryKey: ['insumos-estoque'], queryFn: () => estoqueService.listarInsumos() });

    const { data: saldos = [], refetch, isFetching } = useQuery({
        queryKey: ['saldos', localSelecionado, insumoSelecionado],
        queryFn: () => estoqueService.listarSaldos(localSelecionado!, insumoSelecionado!),
        enabled: false
    });

    const consultar = () => { if (localSelecionado && insumoSelecionado) refetch(); };
    const formatarSaldo = (n:number) => new Intl.NumberFormat('pt-BR', {minimumFractionDigits:3, maximumFractionDigits:3}).format(n);
    const getStatusVencimento = (d?:string) => {
        if (!d) return null; const hoje=new Date(); const v=new Date(d);
        const diff=(v.getTime()-hoje.getTime())/(1000*60*60*24);
        if (diff<0) return <Badge variant="destructive">Vencido</Badge>;
        if (diff<=30) return <Badge variant="secondary">A vencer</Badge>;
        return null;
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Consulta de Saldos por Lote</CardTitle>
                    <CardDescription>Selecione o local e o insumo para listar os saldos por lote.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm text-gray-600">Local de armazenamento</label>
                            <Select value={localSelecionado?.toString()} onValueChange={(v)=>setLocalSelecionado(Number(v))}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    {locais.map((l: LocalArmazenamento)=>(<SelectItem key={l.id} value={String(l.id)}>{l.nome}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Insumo</label>
                            <Select value={insumoSelecionado?.toString()} onValueChange={(v)=>setInsumoSelecionado(Number(v))}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent className="max-h-72">
                                    {insumos.map((i: Insumo)=>(<SelectItem key={i.id} value={String(i.id)}>{i.descricao}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={consultar} disabled={!localSelecionado || !insumoSelecionado || isFetching} className="w-full md:w-auto">
                                <Search className="h-4 w-4 mr-2" />
                                {isFetching ? 'Consultando...' : 'Consultar'}
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lote</TableHead>
                                    <TableHead>Código de Barras</TableHead>
                                    <TableHead>Vencimento</TableHead>
                                    <TableHead className="text-right">Saldo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {saldos.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center text-sm text-gray-500">Sem dados para exibir.</TableCell></TableRow>
                                ) : saldos.map((s: SaldoPorLoteDTO) => (
                                    <TableRow key={s.loteId}>
                                        <TableCell>{s.loteFabricante}</TableCell>
                                        <TableCell>{s.codigoBarras || '—'}</TableCell>
                                        <TableCell>
                                            {s.dataVencimento ? format(new Date(s.dataVencimento), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                                            <span className="ml-2">{getStatusVencimento(s.dataVencimento)}</span>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{formatarSaldo(s.saldo)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
