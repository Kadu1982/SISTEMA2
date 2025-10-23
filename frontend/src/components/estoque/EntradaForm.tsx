/** Formulário de ENTRADA de Estoque (react-hook-form + zod) */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save } from 'lucide-react';
import { estoqueService } from '@/services/estoqueService';
import type { EntradaDTO, LocalArmazenamento, Operacao, Insumo, Fabricante } from '@/types/estoque';
import { TipoOperacao as TO } from '@/types/estoque';

const entradaItemSchema = z.object({
    insumoId: z.number().min(1, 'Insumo obrigatório'),
    fabricanteId: z.number().optional(),
    loteFabricante: z.string().optional(),
    codigoBarras: z.string().optional(),
    dataVencimento: z.string().optional(),
    quantidade: z.number().positive('Informe a quantidade'),
    valorUnitario: z.number().optional(),
    localizacaoFisica: z.string().optional()
});
const entradaSchema = z.object({
    localId: z.number().min(1, 'Selecione um local'),
    operacaoId: z.number().min(1, 'Selecione uma operação'),
    observacao: z.string().optional(),
    itens: z.array(entradaItemSchema).min(1, 'Adicione pelo menos um item')
});
type EntradaFormData = z.infer<typeof entradaSchema>;

export function EntradaForm() {
    const queryClient = useQueryClient();
    const { data: locais = [] } = useQuery({ queryKey: ['locais-estoque'], queryFn: () => estoqueService.listarLocais() });
    const { data: operacoes = [] } = useQuery({ queryKey: ['operacoes-entrada'], queryFn: () => estoqueService.listarOperacoes(TO.ENTRADA) });
    const { data: insumos = [] } = useQuery({ queryKey: ['insumos-estoque'],  queryFn: () => estoqueService.listarInsumos() });
    const { data: fabricantes = [] } = useQuery({ queryKey: ['fabricantes-estoque'], queryFn: () => estoqueService.listarFabricantes() });

    const form = useForm<EntradaFormData>({
        resolver: zodResolver(entradaSchema),
        defaultValues: { localId: undefined as unknown as number, operacaoId: undefined as unknown as number, observacao: '', itens: [{ insumoId: undefined as unknown as number, quantidade: 1 }] }
    });
    const { fields, append, remove } = useFieldArray({ control: form.control, name: 'itens' });

    const mutacao = useMutation({
        mutationFn: (dados: EntradaFormData) => estoqueService.criarEntrada(dados as unknown as EntradaDTO),
        onSuccess: () => { alert('Entrada registrada com sucesso!'); form.reset(); queryClient.invalidateQueries({ queryKey: ['saldos'] }); },
        onError: (e:any) => { alert(e?.response?.data?.message || e?.message || 'Falha ao registrar entrada'); }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((dados)=>mutacao.mutate(dados))} className="space-y-4">
                <Card>
                    <CardHeader><CardTitle>Nova Entrada</CardTitle><CardDescription>Informe o local, a operação e os itens da entrada.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Local */}
                            <FormField control={form.control} name="localId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Local</FormLabel>
                                    <Select value={field.value?.toString()} onValueChange={(v)=>field.onChange(Number(v))}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                        <SelectContent>{locais.map((l: LocalArmazenamento)=>(<SelectItem key={l.id} value={String(l.id)}>{l.nome}</SelectItem>))}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Operação */}
                            <FormField control={form.control} name="operacaoId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Operação</FormLabel>
                                    <Select value={field.value?.toString()} onValueChange={(v)=>field.onChange(Number(v))}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                        <SelectContent>{operacoes.map((o: Operacao)=>(<SelectItem key={o.id} value={String(o.id)}>{o.descricao}</SelectItem>))}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Observação */}
                            <FormField control={form.control} name="observacao" render={({ field }) => (
                                <FormItem><FormLabel>Observações</FormLabel><Input placeholder="Opcional" {...field} /></FormItem>
                            )} />
                        </div>

                        {/* Tabela de itens */}
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Insumo</TableHead>
                                        <TableHead>Fabricante</TableHead>
                                        <TableHead>Lote</TableHead>
                                        <TableHead>Vencimento</TableHead>
                                        <TableHead>Cód. Barras</TableHead>
                                        <TableHead className="text-right">Qtd</TableHead>
                                        <TableHead className="text-right">Vlr Unit.</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((f, idx) => (
                                        <TableRow key={f.id}>
                                            <TableCell className="min-w-[220px]">
                                                <FormField control={form.control} name={`itens.${idx}.insumoId`} render={({ field }) => (
                                                    <FormItem>
                                                        <Select value={field.value?.toString()} onValueChange={(v)=>field.onChange(Number(v))}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                            <SelectContent className="max-h-72">
                                                                {insumos.map((i: Insumo)=>(<SelectItem key={i.id} value={String(i.id)}>{i.descricao}</SelectItem>))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </TableCell>

                                            <TableCell className="min-w-[200px]">
                                                <FormField control={form.control} name={`itens.${idx}.fabricanteId`} render={({ field }) => (
                                                    <FormItem>
                                                        <Select value={field.value?.toString()} onValueChange={(v)=>field.onChange(Number(v))}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger></FormControl>
                                                            <SelectContent className="max-h-72">
                                                                {fabricantes.map((f: Fabricante)=>(<SelectItem key={f.id} value={String(f.id)}>{f.razaoSocial}</SelectItem>))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )} />
                                            </TableCell>

                                            <TableCell>
                                                <FormField control={form.control} name={`itens.${idx}.loteFabricante`} render={({ field }) => (<FormItem><Input placeholder="Lote" {...field} /></FormItem>)} />
                                            </TableCell>

                                            <TableCell>
                                                <FormField control={form.control} name={`itens.${idx}.dataVencimento`} render={({ field }) => (<FormItem><Input type="date" {...field} /></FormItem>)} />
                                            </TableCell>

                                            <TableCell>
                                                <FormField control={form.control} name={`itens.${idx}.codigoBarras`} render={({ field }) => (<FormItem><Input placeholder="GTIN/EAN" {...field} /></FormItem>)} />
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <FormField control={form.control} name={`itens.${idx}.quantidade`} render={({ field }) => (
                                                    <FormItem><Input type="number" step="0.001" min={0.001} {...field} onChange={(e)=>field.onChange(Number(e.target.value))} /></FormItem>
                                                )} />
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <FormField control={form.control} name={`itens.${idx}.valorUnitario`} render={({ field }) => (
                                                    <FormItem><Input type="number" step="0.000001" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} /></FormItem>
                                                )} />
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <Button type="button" variant="ghost" onClick={()=>remove(idx)}><Trash2 className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <Button type="button" variant="outline" onClick={()=>append({ insumoId: undefined as unknown as number, quantidade: 1 })} className="mt-2">
                                                <Plus className="h-4 w-4 mr-2" /> Adicionar item
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={mutacao.isPending} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />{mutacao.isPending ? 'Salvando...' : 'Registrar Entrada'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
