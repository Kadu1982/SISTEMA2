/** Verificação de Vencimentos (Local + Data Limite) */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Search } from 'lucide-react';
import { estoqueService } from '@/services/estoqueService';
import type { LocalArmazenamento, SaldoPorLoteDTO } from '@/types/estoque';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function VencimentosReport() {
    const [localSelecionado, setLocalSelecionado] = useState<number | null>(null);
    const [dataLimite, setDataLimite] = useState<string>('');

    const { data: locais = [] } = useQuery({ queryKey: ['locais-estoque'], queryFn: () => estoqueService.listarLocais() });
    const { data: vencimentos = [], refetch, isFetching } = useQuery({
        queryKey: ['vencimentos', localSelecionado, dataLimite],
        queryFn: () => estoqueService.listarVencimentos(localSelecionado!, dataLimite),
        enabled: false
    });

    const consultar = () => { if (localSelecionado && dataLimite) refetch(); };
    const fmt = (n:number) => new Intl.NumberFormat('pt-BR',{minimumFractionDigits:3,maximumFractionDigits:3}).format(n);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Verificação de Vencimentos</CardTitle>
                    <CardDescription>Selecione o local e a data limite para ver lotes vencidos/à vencer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm text-gray-600">Local</label>
                            <Select value={localSelecionado?.toString()} onValueChange={(v)=>setLocalSelecionado(Number(v))}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>{locais.map((l: LocalArmazenamento)=>(<SelectItem key={l.id} value={String(l.id)}>{l.nome}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Data limite</label>
                            <div className="flex gap-2">
                                <Input type="date" value={dataLimite} onChange={(e)=>setDataLimite(e.target.value)} className="w-full"/>
                                <Button onClick={consultar} disabled={!localSelecionado || !dataLimite || isFetching}>
                                    <Search className="h-4 w-4 mr-2" />{isFetching ? 'Consultando...' : 'Consultar'}
                                </Button>
                            </div>
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
                                {vencimentos.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center text-sm text-gray-500">Sem dados.</TableCell></TableRow>
                                ) : vencimentos.map((item: SaldoPorLoteDTO)=>(
                                    <TableRow key={item.loteId}>
                                        <TableCell>{item.loteFabricante}</TableCell>
                                        <TableCell>{item.codigoBarras || '—'}</TableCell>
                                        <TableCell>{item.dataVencimento ? format(new Date(item.dataVencimento), 'dd/MM/yyyy', { locale: ptBR }) : '—'}</TableCell>
                                        <TableCell className="text-right font-mono">{fmt(item.saldo)}</TableCell>
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
