/**
 * Hub de Movimentações de Estoque
 * - Abas para Entrada, Saída e Transferência
 * - Reutiliza os formulários existentes (EntradaForm e SaidaForm)
 * - Inclui um formulário simples de Transferência (MVP) para não deixar a aba pendente
 *
 * Observação:
 *  - A Transferência usa os saldos do Local de ORIGEM para escolher os Lotes.
 *  - Unidade de cada local é deduzida do próprio Local (unidadeSaudeId).
 */
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { EntradaForm } from '@/components/estoque/EntradaForm';
import { SaidaForm } from '@/components/estoque/SaidaForm';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Save, ArrowLeftRight, Search } from 'lucide-react';

import { estoqueService } from '@/services/estoqueService';
import type { LocalArmazenamento, SaldoPorLoteDTO, TransferenciaDTO } from '@/types/estoque';

function TransferenciaForm() {
    // Schemas
    const itemSchema = z.object({
        loteId: z.number().min(1, 'Selecione um lote'),
        quantidade: z.number().positive('Informe a quantidade'),
    });
    const formSchema = z.object({
        localOrigemId: z.number().min(1, 'Selecione a origem'),
        localDestinoId: z.number().min(1, 'Selecione o destino'),
        observacoes: z.string().optional(),
        itens: z.array(itemSchema).min(1, 'Adicione pelo menos um item'),
    });
    type FormData = z.infer<typeof formSchema>;

    // State utilitário
    const [locais, setLocais] = useState<LocalArmazenamento[]>([]);
    const [saldosOrigem, setSaldosOrigem] = useState<SaldoPorLoteDTO[]>([]);
    const [insumoFiltro, setInsumoFiltro] = useState<number | null>(null);

    // Form
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            localOrigemId: undefined as unknown as number,
            localDestinoId: undefined as unknown as number,
            observacoes: '',
            itens: [{ loteId: undefined as unknown as number, quantidade: 1 }],
        },
    });
    const { fields, append, remove } = useFieldArray({ control: form.control, name: 'itens' });

    // Carrega locais na primeira interação
    useState(() => {
        estoqueService.listarLocais().then(setLocais).catch(console.error);
    });

    // Buscar lotes do local de origem por INSUMO (opcional)
    const consultarLotes = async () => {
        const origem = form.getValues('localOrigemId');
        if (!origem || !insumoFiltro) {
            alert('Selecione o Local de ORIGEM e um Insumo para buscar os lotes.');
            return;
        }
        const saldos = await estoqueService.listarSaldos(origem, insumoFiltro);
        setSaldosOrigem(saldos);
    };

    const mutacao = useMutation({
        mutationFn: async (dados: FormData) => {
            const origem = locais.find((l) => l.id === dados.localOrigemId);
            const destino = locais.find((l) => l.id === dados.localDestinoId);
            if (!origem || !destino) throw new Error('Local inválido');

            const payload: TransferenciaDTO = {
                unidadeOrigemId: origem.unidadeSaudeId,
                localOrigemId: origem.id,
                unidadeDestinoId: destino.unidadeSaudeId,
                localDestinoId: destino.id,
                observacoes: dados.observacoes || undefined,
                itens: dados.itens.map((i) => ({ loteId: i.loteId, quantidade: i.quantidade })),
            };
            return estoqueService.criarTransferencia(payload);
        },
        onSuccess: () => {
            alert('Transferência registrada! Se o destino estiver configurado "Ao Confirmar", faça o aceite lá.');
            form.reset();
            setSaldosOrigem([]);
            setInsumoFiltro(null);
        },
        onError: (e: any) => alert(e?.response?.data?.message || e?.message || 'Erro ao registrar transferência'),
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5" />
                    <CardTitle>Transferência entre Locais</CardTitle>
                </div>
                <CardDescription>
                    Selecione um Local de <b>Origem</b> e um de <b>Destino</b>, escolha os lotes da origem e informe as quantidades.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Local de Origem</div>
                        <Select
                            value={form.watch('localOrigemId')?.toString()}
                            onValueChange={(v) => form.setValue('localOrigemId', Number(v))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {locais.map((l) => (
                                    <SelectItem key={l.id} value={String(l.id)}>
                                        {l.nome} (Unid. {l.unidadeSaudeId})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <div className="text-sm text-gray-600 mb-1">Local de Destino</div>
                        <Select
                            value={form.watch('localDestinoId')?.toString()}
                            onValueChange={(v) => form.setValue('localDestinoId', Number(v))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {locais.map((l) => (
                                    <SelectItem key={l.id} value={String(l.id)}>
                                        {l.nome} (Unid. {l.unidadeSaudeId})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <div className="text-sm text-gray-600 mb-1">Observações</div>
                        <Input
                            placeholder="Opcional"
                            value={form.watch('observacoes') || ''}
                            onChange={(e) => form.setValue('observacoes', e.target.value)}
                        />
                    </div>
                </div>

                {/* Consulta de lotes do local de origem por insumo */}
                <div className="rounded-md border p-3 space-y-2">
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <div className="text-sm text-gray-600 mb-1">Filtrar lotes por Insumo</div>
                            <Input
                                placeholder="ID do insumo (rápido) — use a Consulta de Saldos para detalhes"
                                value={insumoFiltro || ''}
                                onChange={(e) => setInsumoFiltro(e.target.value ? Number(e.target.value) : null)}
                            />
                        </div>
                        <Button type="button" onClick={consultarLotes}>
                            <Search className="mr-2 h-4 w-4" />
                            Buscar Lotes
                        </Button>
                    </div>
                    {saldosOrigem.length > 0 && (
                        <div className="text-xs text-gray-600">
                            {saldosOrigem.length} lote(s) encontrados. Selecione-os na tabela de itens abaixo.
                        </div>
                    )}
                </div>

                {/* Itens da transferência */}
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Lote (Origem)</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead className="text-right">Saldo</TableHead>
                                <TableHead className="text-right">Quantidade</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((f, idx) => (
                                <TableRow key={f.id}>
                                    <TableCell className="min-w-[280px]">
                                        <Select
                                            value={form.watch(`itens.${idx}.loteId`)?.toString()}
                                            onValueChange={(v) => form.setValue(`itens.${idx}.loteId`, Number(v))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um lote..." />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-72">
                                                {saldosOrigem.map((s) => (
                                                    <SelectItem key={s.loteId} value={String(s.loteId)}>
                                                        {s.loteFabricante} • {s.codigoBarras || '—'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        {(() => {
                                            const l = saldosOrigem.find(
                                                (x) => x.loteId === form.getValues(`itens.${idx}.loteId`),
                                            );
                                            return l?.dataVencimento || '—';
                                        })()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {(() => {
                                            const l = saldosOrigem.find(
                                                (x) => x.loteId === form.getValues(`itens.${idx}.loteId`),
                                            );
                                            return l ? (
                                                <span className="font-mono">
                          {new Intl.NumberFormat('pt-BR', {
                              minimumFractionDigits: 3,
                              maximumFractionDigits: 3,
                          }).format(l.saldo)}
                        </span>
                                            ) : (
                                                '—'
                                            );
                                        })()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Input
                                            type="number"
                                            step="0.001"
                                            min={0.001}
                                            value={form.watch(`itens.${idx}.quantidade`) ?? ''}
                                            onChange={(e) =>
                                                form.setValue(`itens.${idx}.quantidade`, Number(e.target.value))
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button type="button" variant="outline" onClick={() => remove(idx)}>
                                            Remover
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            append({ loteId: undefined as unknown as number, quantidade: 1 })
                                        }
                                        className="mt-2"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Adicionar item
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={form.handleSubmit(() => mutacao.mutate(form.getValues()))}
                        disabled={mutacao.isPending}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {mutacao.isPending ? 'Salvando...' : 'Registrar Transferência'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function MovimentacaoEstoque() {
    return (
        <div className="space-y-6">
            <Tabs defaultValue="entrada">
                <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="entrada">Entrada</TabsTrigger>
                    <TabsTrigger value="saida">Saída</TabsTrigger>
                    <TabsTrigger value="transferencia">Transferência</TabsTrigger>
                </TabsList>

                <TabsContent value="entrada">
                    <EntradaForm />
                </TabsContent>

                <TabsContent value="saida">
                    <SaidaForm />
                </TabsContent>

                <TabsContent value="transferencia">
                    <TransferenciaForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}
