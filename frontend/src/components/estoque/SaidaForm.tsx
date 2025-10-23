/** Formulário de SAÍDA de Estoque (por LOTE) */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, Search, AlertCircle } from 'lucide-react';
import { estoqueService } from '@/services/estoqueService';
import type { SaidaDTO, LocalArmazenamento, Operacao, SaldoPorLoteDTO, Insumo } from '@/types/estoque';
import { TipoOperacao as TO, TipoSaida as TS } from '@/types/estoque';

const saidaItemSchema = z.object({
    loteId: z.number().min(1,'Selecione um lote'),
    quantidade: z.number().positive('Informe a quantidade')
});

const saidaSchema = z.object({
    localId: z.number().min(1,'Selecione um local'),
    operacaoId: z.number().min(1,'Selecione uma operação'),
    tipoSaida: z.nativeEnum(TS),
    pacienteId: z.number().optional(),
    profissionalId: z.number().optional(),
    setorConsumo: z.string().optional(),
    observacao: z.string().optional(),
    itens: z.array(saidaItemSchema).min(1,'Adicione pelo menos um item')
});

type SaidaFormData = z.infer<typeof saidaSchema>;

export function SaidaForm() {
    const queryClient = useQueryClient();
    const [insumoConsulta, setInsumoConsulta] = useState<number | null>(null);
    const [saldos, setSaldos] = useState<SaldoPorLoteDTO[]>([]);

    const { data: locais = [] } = useQuery({
        queryKey: ['locais-estoque'],
        queryFn: () => estoqueService.listarLocais()
    });

    const { data: operacoes = [] } = useQuery({
        queryKey: ['operacoes-saida'],
        queryFn: () => estoqueService.listarOperacoes(TO.SAIDA)
    });

    const { data: insumos = [] } = useQuery({
        queryKey: ['insumos-estoque'],
        queryFn: () => estoqueService.listarInsumos()
    });

    const form = useForm<SaidaFormData>({
        resolver: zodResolver(saidaSchema),
        defaultValues: {
            localId: undefined as unknown as number,
            operacaoId: undefined as unknown as number,
            tipoSaida: TS.USUARIO,
            itens: [{ loteId: undefined as unknown as number, quantidade: 1 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'itens'
    });

    const tipoSaida = form.watch('tipoSaida');

    const mutacao = useMutation({
        mutationFn: (dados: SaidaFormData) => estoqueService.criarSaida(dados as unknown as SaidaDTO),
        onSuccess: () => {
            alert('Saída registrada com sucesso!');
            form.reset();
            setSaldos([]);
            queryClient.invalidateQueries({ queryKey: ['saldos'] });
        },
        onError: (e:any) => alert(e?.response?.data?.message || e?.message || 'Falha ao registrar saída')
    });

    const consultarSaldos = async () => {
        const localId = form.getValues('localId');
        if (!localId || !insumoConsulta) {
            alert('Selecione Local e Insumo para consultar lotes.');
            return;
        }
        try {
            const resultados = await estoqueService.listarSaldos(localId, insumoConsulta);
            setSaldos(resultados.filter(s => s.saldo > 0)); // Só mostra lotes com saldo
        } catch (error) {
            console.error('Erro ao consultar saldos:', error);
            alert('Erro ao consultar saldos dos lotes');
        }
    };

    const fmt = (n:number) => new Intl.NumberFormat('pt-BR',{
        minimumFractionDigits:3,
        maximumFractionDigits:3
    }).format(n);

    const getLoteInfo = (loteId: number): SaldoPorLoteDTO | undefined => {
        return saldos.find(s => s.loteId === loteId);
    };

    const validarQuantidade = (quantidade: number, loteId: number): boolean => {
        const loteInfo = getLoteInfo(loteId);
        return loteInfo ? quantidade <= loteInfo.saldo : false;
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((dados)=>mutacao.mutate(dados))} className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Nova Saída</CardTitle>
                        <CardDescription>
                            Informe o local, a operação, o tipo e os itens (por lote).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Local */}
                            <FormField control={form.control} name="localId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Local de Armazenamento</FormLabel>
                                    <Select value={field.value?.toString()} onValueChange={(v)=>field.onChange(Number(v))}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {locais.map((l: LocalArmazenamento)=>(
                                                <SelectItem key={l.id} value={String(l.id)}>
                                                    {l.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Operação */}
                            <FormField control={form.control} name="operacaoId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Operação</FormLabel>
                                    <Select value={field.value?.toString()} onValueChange={(v)=>field.onChange(Number(v))}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {operacoes.map((o: Operacao)=>(
                                                <SelectItem key={o.id} value={String(o.id)}>
                                                    {o.descricao}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Tipo de Saída */}
                            <FormField control={form.control} name="tipoSaida" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Saída</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={TS.USUARIO}>Usuário</SelectItem>
                                            <SelectItem value={TS.CONSUMO_PROPRIO}>Consumo Próprio</SelectItem>
                                            <SelectItem value={TS.AJUSTE}>Ajuste</SelectItem>
                                            <SelectItem value={TS.TRANSFERENCIA}>Transferência</SelectItem>
                                            <SelectItem value={TS.PROFISSIONAL}>Profissional</SelectItem>
                                            <SelectItem value={TS.OUTRAS}>Outras</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Campos condicionais baseados no tipo de saída */}
                            {tipoSaida === TS.USUARIO && (
                                <FormField control={form.control} name="pacienteId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID do Paciente</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="ID do paciente"
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}

                            {tipoSaida === TS.PROFISSIONAL && (
                                <FormField control={form.control} name="profissionalId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID do Profissional</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="ID do profissional"
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}

                            {(tipoSaida === TS.CONSUMO_PROPRIO || tipoSaida === TS.AJUSTE) && (
                                <FormField control={form.control} name="setorConsumo" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Setor de Consumo</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Enfermaria, Consultório A"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}
                        </div>

                        {/* Observações */}
                        <FormField control={form.control} name="observacao" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Observações</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Observações sobre a saída..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Busca de lotes pelo Insumo para montar itens */}
                        <div className="rounded-md border p-3 space-y-2">
                            <div className="flex items-end gap-2">
                                <div className="flex-1">
                                    <label className="text-sm text-gray-600">Filtrar por Insumo</label>
                                    <Select value={insumoConsulta?.toString()} onValueChange={(v)=>setInsumoConsulta(Number(v))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um insumo..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-72">
                                            {insumos.map((i: Insumo)=>(
                                                <SelectItem key={i.id} value={String(i.id)}>
                                                    {i.descricao}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="button" onClick={consultarSaldos}>
                                    <Search className="h-4 w-4 mr-2"/>
                                    Buscar lotes
                                </Button>
                            </div>
                            {saldos.length > 0 && (
                                <div className="text-xs text-gray-600">
                                    {saldos.length} lote(s) com saldo disponível encontrados. Use-os nos itens abaixo.
                                </div>
                            )}
                        </div>

                        {/* Itens */}
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Lote</TableHead>
                                        <TableHead>Vencimento</TableHead>
                                        <TableHead className="text-right">Saldo</TableHead>
                                        <TableHead className="text-right">Qtd</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((f, idx) => (
                                        <TableRow key={f.id}>
                                            <TableCell className="min-w-[260px]">
                                                <FormField control={form.control} name={`itens.${idx}.loteId`} render={({ field }) => (
                                                    <FormItem>
                                                        <Select value={field.value?.toString()} onValueChange={(v)=>field.onChange(Number(v))}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecione..." />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="max-h-72">
                                                                {saldos.map((s)=>(
                                                                    <SelectItem key={s.loteId} value={String(s.loteId)}>
                                                                        <div className="flex flex-col">
                                                                            <span>{s.loteFabricante} • {s.codigoBarras || '—'}</span>
                                                                            <span className="text-xs text-gray-500">
                                                                                Saldo: {fmt(s.saldo)}
                                                                            </span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const l = saldos.find(x => x.loteId === form.getValues(`itens.${idx}.loteId`));
                                                    return l?.dataVencimento || '—';
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {(() => {
                                                    const l = saldos.find(x => x.loteId === form.getValues(`itens.${idx}.loteId`));
                                                    return l ? <span className="font-mono">{fmt(l.saldo)}</span> : '—';
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <FormField control={form.control} name={`itens.${idx}.quantidade`} render={({ field }) => {
                                                    const loteId = form.watch(`itens.${idx}.loteId`);
                                                    const loteInfo = getLoteInfo(loteId);
                                                    const quantidadeValida = field.value ? validarQuantidade(field.value, loteId) : true;

                                                    return (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.001"
                                                                    min={0.001}
                                                                    placeholder="0,000"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                                    className={!quantidadeValida ? 'border-red-500' : ''}
                                                                />
                                                            </FormControl>
                                                            {loteInfo && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Disponível: {fmt(loteInfo.saldo)}
                                                                </p>
                                                            )}
                                                            {!quantidadeValida && (
                                                                <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    Excede saldo disponível
                                                                </div>
                                                            )}
                                                            <FormMessage />
                                                        </FormItem>
                                                    );
                                                }} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => remove(idx)}
                                                    disabled={fields.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => append({
                                                    loteId: undefined as unknown as number,
                                                    quantidade: 1
                                                })}
                                                className="mt-2"
                                                disabled={saldos.length === 0}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Adicionar item
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={mutacao.isPending}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {mutacao.isPending ? 'Salvando...' : 'Registrar Saída'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}