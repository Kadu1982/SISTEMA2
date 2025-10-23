/**
 * Página de Configuração de Centro de Custo (Estoque)
 * - Lista com busca
 * - Criar/Editar via diálogo com form reutilizável
 * - Integra com centroCustoService (com fallback para rotas antigas)
 *
 * ROTAS: você pode montar em App.tsx como:
 *   <Route path="/estoque/config-centros" element={<CentroCustoConfig />} />
 *
 * Obs: Não altera componentes existentes; é uma nova página opcional.
 */
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Settings, Search } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

import CentroCustoForm from '@/components/estoque/CentroCustoForm';
import { centroCustoService, type CentroCusto } from '@/services/centroCustoService';
import { GeracaoEntradaTransferencia, PoliticaCodigoSequencial } from '@/types/estoque';

export default function CentroCustoConfig() {
    const { toast } = useToast();
    const [busca, setBusca] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editando, setEditando] = useState<CentroCusto | null>(null);

    const { data: centros = [], isFetching, refetch } = useQuery({
        queryKey: ['centros-custos'],
        queryFn: () => centroCustoService.listarCentrosCusto(),
    });

    const criarMut = useMutation({
        mutationFn: (payload: Partial<CentroCusto>) => centroCustoService.criarCentroCusto(payload),
        onSuccess: () => {
            toast({ title: 'Centro de Custo criado', description: 'As configurações foram salvas com sucesso.' });
            refetch();
            setDialogOpen(false);
            setEditando(null);
        },
        onError: (e: any) => toast({ title: 'Falha ao criar', description: e?.message || 'Erro desconhecido', variant: 'destructive' }),
    });

    const atualizarMut = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Partial<CentroCusto> }) =>
            centroCustoService.atualizarCentroCusto(id, payload),
        onSuccess: () => {
            toast({ title: 'Centro de Custo atualizado', description: 'Configurações aplicadas com sucesso.' });
            refetch();
            setDialogOpen(false);
            setEditando(null);
        },
        onError: (e: any) =>
            toast({ title: 'Falha ao atualizar', description: e?.message || 'Erro desconhecido', variant: 'destructive' }),
    });

    const filtrados = useMemo(() => {
        const q = busca.trim().toLowerCase();
        return centros.filter(
            (c) => !q || c.nome.toLowerCase().includes(q) || String(c.unidadeSaudeId || '').includes(q),
        );
    }, [centros, busca]);

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

    const abrirCriacao = () => {
        setEditando(null);
        setDialogOpen(true);
    };

    const abrirEdicao = (c: CentroCusto) => {
        setEditando(c);
        setDialogOpen(true);
    };

    const handleSubmit = async (payload: Partial<CentroCusto>) => {
        if (editando?.id) {
            await atualizarMut.mutateAsync({ id: editando.id, payload });
        } else {
            await criarMut.mutateAsync(payload);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    <CardTitle>Configuração de Centro de Custo (Estoque)</CardTitle>
                </div>
                <CardDescription>Gerencie as políticas de código, transferência e status dos Centros de Custo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            className="pl-8"
                            placeholder="Buscar por nome ou ID da unidade..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={abrirCriacao}>
                                <Plus className="h-4 w-4 mr-1" />
                                Novo Centro de Custo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{editando ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}</DialogTitle>
                                <DialogDescription>
                                    Defina as políticas de código sequencial, geração de entrada por transferência e status.
                                </DialogDescription>
                            </DialogHeader>
                            <CentroCustoForm
                                initial={editando ?? undefined}
                                submitting={criarMut.isPending || atualizarMut.isPending}
                                onSubmit={handleSubmit}
                                onCancel={() => {
                                    setDialogOpen(false);
                                    setEditando(null);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Unidade (ID)</TableHead>
                                <TableHead>Código Sequencial</TableHead>
                                <TableHead>Entrada por Transferência</TableHead>
                                <TableHead>Código por Lote?</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-24 text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isFetching && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-sm text-gray-500">
                                        Carregando...
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isFetching && filtrados.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-sm text-gray-500">
                                        Nenhum Centro de Custo encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filtrados.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.nome}</TableCell>
                                    <TableCell>{c.unidadeSaudeId ?? '-'}</TableCell>
                                    <TableCell>{seqLabel(c.politicaCodigoSequencial)}</TableCell>
                                    <TableCell>{geracaoLabel(c.geracaoEntradaTransferencia)}</TableCell>
                                    <TableCell>{c.usaCodigoBarrasPorLote ? 'Sim' : 'Não'}</TableCell>
                                    <TableCell>
                                        {c.ativo ? <Badge>Ativo</Badge> : <Badge variant="secondary">Inativo</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => abrirEdicao(c)}>
                                            <Pencil className="h-4 w-4 mr-1" />
                                            Editar
                                        </Button>
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
