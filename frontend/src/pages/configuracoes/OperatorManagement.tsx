
import React, { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Check, ChevronsUpDown, MoreHorizontal, X, Users, Lock, Clock, ListChecks, Shield, Building2, FileText, Settings, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import configuracaoService from '@/services/ConfiguracaoService';
import * as opSvc from '@/services/operadoresService';

/* ================= Tipos ================= */
interface Perfil {
    id?: number;
    nome?: string;
    nomeExibicao?: string;
    nomeCustomizado?: string;
    codigo?: string;
    descricao?: string;
    sistemaPerfil?: boolean;
    ativo?: boolean;
    tipo?: string;
    permissoes?: string[];
}

interface Operador {
    id: number;
    nome: string;
    login: string;
    email?: string;
    perfis: string[];
    ativo: boolean;
    unidadeAtualId?: number | null;
}

/* ======= Form de criação de operador ======= */
const operatorFormSchema = z.object({
    nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
    login: z.string().min(4, { message: 'O login deve ter pelo menos 4 caracteres.' }),
    cpf: z.string().min(11, { message: 'CPF é obrigatório (11 caracteres).' }),
    cns: z.string().optional(),
    senha: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
    email: z.string().email({ message: 'Formato de e-mail inválido.' }),
    perfis: z.array(z.string()).min(1, { message: 'Selecione pelo menos um perfil.' }),
});
type OperatorFormValues = z.infer<typeof operatorFormSchema>;

/* =======================================================================
   COMPONENTE PRINCIPAL
   ======================================================================= */
export default function OperatorManagement() {
    const [operators, setOperators] = useState<Operador[]>([]);
    const [profiles, setProfiles] = useState<Perfil[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [search, setSearch] = useState<string>('');
    const [statusChangingId, setStatusChangingId] = useState<number | null>(null);
    const { toast } = useToast();

    // Edição (novo): dialog com abas
    const [editOpen, setEditOpen] = useState(false);
    const [editOperador, setEditOperador] = useState<Operador | null>(null);
    const [editTab, setEditTab] = useState<'perfis'|'restricoes'|'horarios'|'setores'|'modulos'|'unidades'|'termo'|'auditoria'>('perfis');

    const form = useForm<OperatorFormValues>({
        resolver: zodResolver(operatorFormSchema),
        defaultValues: { nome: '', login: '', cpf: '', cns: '', senha: '', email: '', perfis: [] },
    });

    /* ======= Opções de perfis (multi-select) ======= */
    const profileOptions = useMemo<{ value: string; label: string }[]>(() => {
        return (profiles || [])
            .filter(p => (p.nome?.trim().length ?? 0) > 0 && p.ativo !== false)
            .map(p => ({ value: p.nome!.trim(), label: (p.nomeExibicao || p.nome || p.nomeCustomizado || '').trim() || p.nome!.trim() }))
            .sort((a,b)=>a.label.localeCompare(b.label));
    }, [profiles]);

    /* ======= Carregamento inicial ======= */
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                setLoading(true);
                const [ops, profs] = await Promise.all([
                    configuracaoService.listarOperadores(),
                    configuracaoService.listarPerfis(),
                ]);
                setOperators(Array.isArray(ops) ? (ops as Operador[]) : []);
                setProfiles(Array.isArray(profs) ? (profs as Perfil[]) : []);
            } catch (error: any) {
                toast({
                    title: 'Erro ao carregar dados',
                    description: error?.response?.data?.message || 'Não foi possível buscar operadores e perfis.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, [toast]);

    /* ======= Busca (debounce) ======= */
    useEffect(() => {
        let active = true;
        const doSearch = async () => {
            try {
                setLoading(true);
                const termo = search.trim();
                const ops = termo
                    ? await configuracaoService.buscarOperadores(termo, 0, 20)
                    : await configuracaoService.listarOperadores();
                if (!active) return;
                setOperators(Array.isArray(ops) ? (ops as Operador[]) : []);
            } catch (error: any) {
                if (!active) return;
                toast({
                    title: 'Erro ao buscar operadores',
                    description: error?.response?.data?.message || 'Não foi possível executar a busca.',
                    variant: 'destructive',
                });
            } finally {
                if (active) setLoading(false);
            }
        };
        const h = setTimeout(doSearch, 350);
        return () => { active = false; clearTimeout(h); };
    }, [search, toast]);

    /* ======= Criação de Operador ======= */
    const onSubmit = async (data: OperatorFormValues) => {
        try {
            const payload = {
                nome: data.nome.trim(),
                login: data.login.trim(),
                cpf: data.cpf.trim(),
                cns: data.cns?.trim() || undefined,
                email: data.email.trim(),
                senha: data.senha,
                perfis: Array.isArray(data.perfis) ? data.perfis : [],
            };
            const created = await configuracaoService.criarOperador(payload as any);
            if (created) {
                const added: Operador = {
                    id: created.id || 0, nome: created.nome || '', login: created.login || '',
                    email: created.email, perfis: Array.isArray(created.perfis) ? created.perfis : [], ativo: Boolean(created.ativo ?? true),
                };
                setOperators(prev => [added, ...prev]);
                toast({ title: 'Sucesso!', description: `Operador "${added.nome}" criado.` });
                setIsDialogOpen(false);
                form.reset();
            } else {
                toast({ title: 'Erro ao criar', description: 'Resposta do servidor inválida.', variant: 'destructive' });
            }
        } catch (error: any) {
            toast({ title: 'Erro ao criar operador', description: error?.response?.data?.message || 'Verifique os dados e tente novamente.', variant: 'destructive' });
        }
    };

    /* ======= Ativar/Desativar ======= */
    const handleToggleStatus = async (op: Operador) => {
        const novoStatus = !op.ativo;
        if (!window.confirm(novoStatus ? `Ativar "${op.nome}"?` : `Desativar "${op.nome}"?`)) return;
        try {
            setStatusChangingId(op.id);
            const atualizado = await configuracaoService.alterarStatusOperador(op.id, novoStatus);
            if (atualizado) {
                setOperators(prev => prev.map(o => (o.id === op.id ? { ...o, ativo: Boolean(atualizado.ativo ?? novoStatus) } : o)));
                toast({ title: 'Sucesso', description: novoStatus ? 'Operador ativado.' : 'Operador desativado.' });
            } else {
                toast({ title: 'Falha ao alterar status', description: 'Tente novamente.', variant: 'destructive' });
            }
        } catch (error: any) {
            toast({ title: 'Erro ao alterar status', description: error?.response?.data?.message || 'Tente novamente.', variant: 'destructive' });
        } finally {
            setStatusChangingId(null);
        }
    };

    /* ======= Abrir edição (abas) ======= */
    const abrirEditar = (op: Operador) => {
        setEditOperador(op);
        setEditTab('perfis');
        setEditOpen(true);
    };

    // Helpers de seleção de perfil no formulário de criação
    const togglePerfil = (profileValue: string, currentPerfis: string[]) => {
        return currentPerfis.includes(profileValue)
            ? currentPerfis.filter(p => p !== profileValue)
            : [...currentPerfis, profileValue];
    };
    const removerPerfil = (profileValue: string, currentPerfis: string[]) => currentPerfis.filter(p => p !== profileValue);

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Gerenciamento de Operadores</CardTitle>
                    <CardDescription>Crie e gerencie os usuários do sistema.</CardDescription>
                </div>

                <div className="flex w-full sm:w-auto items-center gap-2">
                    <Input placeholder="Buscar por nome ou login..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-64" />
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2 h-4 w-4" />Novo Operador</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[520px]">
                            <DialogHeader>
                                <DialogTitle>Novo Operador</DialogTitle>
                                <DialogDescription>Preencha os dados para criar um novo usuário.</DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                                    <FormField name="nome" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Nome *</FormLabel><FormControl><Input placeholder="Nome completo" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="login" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Login *</FormLabel><FormControl><Input placeholder="Login" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField name="cpf" control={form.control} render={({ field }) => (
                                            <FormItem><FormLabel>CPF *</FormLabel><FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField name="cns" control={form.control} render={({ field }) => (
                                            <FormItem><FormLabel>CNS (opcional)</FormLabel><FormControl><Input placeholder="Número do CNS" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                    <FormField name="email" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>E-mail *</FormLabel><FormControl><Input type="email" placeholder="E-mail" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="senha" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Senha *</FormLabel><FormControl><Input type="password" placeholder="Senha" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>

                                    {/* Perfis (multi-select) */}
                                    <FormField name="perfis" control={form.control} render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Perfis *</FormLabel>

                                            {field.value && field.value.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {field.value.map((profileValue, index) => {
                                                        const option = profileOptions.find(opt => opt.value === profileValue);
                                                        const label = option?.label || profileValue;
                                                        return (
                                                            <Badge key={`${profileValue}-${index}`} variant="secondary" className="flex items-center gap-1">
                                                                {label}
                                                                <X className="h-3 w-3 cursor-pointer hover:text-red-500"
                                                                   onClick={() => field.onChange(removerPerfil(profileValue, field.value || []))}/>
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" role="combobox" className={cn('w-full justify-between', !field.value?.length && 'text-muted-foreground')}>
                                                            {field.value?.length ? `${field.value.length} perfil(is) selecionado(s)` : 'Clique para selecionar perfis'}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar perfil..." />
                                                        <CommandList>
                                                            <CommandEmpty>{profileOptions.length === 0 ? 'Nenhum perfil disponível.' : 'Nenhum resultado.'}</CommandEmpty>
                                                            {profileOptions.length > 0 && (
                                                                <CommandGroup>
                                                                    {profileOptions.map((opt, idx) => {
                                                                        const selected = field.value?.includes(opt.value) ?? false;
                                                                        return (
                                                                            <CommandItem key={`perfil-${opt.value}-${idx}`} onSelect={() => field.onChange(togglePerfil(opt.value, field.value || []))} className="cursor-pointer">
                                                                                <Check className={cn('mr-2 h-4 w-4', selected ? 'opacity-100' : 'opacity-0')} />
                                                                                {opt.label}
                                                                            </CommandItem>
                                                                        );
                                                                    })}
                                                                </CommandGroup>
                                                            )}
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>

                                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                        <Button type="submit" disabled={form.formState.isSubmitting}>
                                            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Operador'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" /> Carregando operadores...
                    </div>
                ) : operators.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        {search.trim() ? 'Nenhum operador encontrado com este termo.' : 'Nenhum operador cadastrado.'}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Login</TableHead>
                                <TableHead>E-mail</TableHead>
                                <TableHead>Perfis</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {operators.map((op: Operador) => (
                                <TableRow key={op.id}>
                                    <TableCell className="font-medium">{op.nome}</TableCell>
                                    <TableCell>{op.login}</TableCell>
                                    <TableCell>{op.email || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {Array.isArray(op.perfis) && op.perfis.length > 0 ? (
                                                op.perfis.map((p: string, idx: number) => (<Badge key={`${p}-${idx}`} variant="secondary">{p}</Badge>))
                                            ) : (<span className="text-muted-foreground text-sm">Nenhum perfil</span>)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={op.ativo ? 'default' : 'outline'}>{op.ativo ? 'Ativo' : 'Inativo'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => abrirEditar(op)}>Editar</DropdownMenuItem>
                                                <DropdownMenuItem
                                                    disabled={statusChangingId === op.id}
                                                    className={op.ativo ? 'text-red-600' : 'text-green-600'}
                                                    onClick={() => handleToggleStatus(op)}
                                                >
                                                    {statusChangingId === op.id ? 'Alterando...' : (op.ativo ? 'Desativar' : 'Ativar')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {/* =============== DIALOG DE EDIÇÃO (ABAS) =============== */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-[1000px] w-[98vw]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" /> {editOperador?.nome || 'Operador'}
                        </DialogTitle>
                        <DialogDescription>Gerencie as configurações de acesso deste operador.</DialogDescription>
                    </DialogHeader>

                    {/* Abas */}
                    <Tabs value={editTab} onValueChange={(v)=>setEditTab(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
                            <TabsTrigger value="perfis"><Users className="w-4 h-4 mr-1" />Perfis</TabsTrigger>
                            <TabsTrigger value="restricoes"><Lock className="w-4 h-4 mr-1" />Restrições</TabsTrigger>
                            <TabsTrigger value="horarios"><Clock className="w-4 h-4 mr-1" />Horários</TabsTrigger>
                            <TabsTrigger value="setores"><ListChecks className="w-4 h-4 mr-1" />Setores</TabsTrigger>
                            <TabsTrigger value="modulos"><Shield className="w-4 h-4 mr-1" />Módulos</TabsTrigger>
                            <TabsTrigger value="unidades"><Building2 className="w-4 h-4 mr-1" />Unidades</TabsTrigger>
                            <TabsTrigger value="termo"><FileText className="w-4 h-4 mr-1" />Termo</TabsTrigger>
                            <TabsTrigger value="auditoria"><Settings className="w-4 h-4 mr-1" />Auditoria</TabsTrigger>
                        </TabsList>

                        {/* Conteúdo de cada aba */}
                        <TabsContent value="perfis" className="mt-4">
                            {editOperador && <AbaPerfis operadorId={editOperador.id} />}
                        </TabsContent>

                        <TabsContent value="restricoes" className="mt-4">
                            {editOperador && <AbaRestricoes operadorId={editOperador.id} />}
                        </TabsContent>

                        <TabsContent value="horarios" className="mt-4">
                            {editOperador && <AbaHorarios operadorId={editOperador.id} />}
                        </TabsContent>

                        <TabsContent value="setores" className="mt-4">
                            {editOperador && <AbaSetores operadorId={editOperador.id} />}
                        </TabsContent>

                        <TabsContent value="modulos" className="mt-4">
                            {editOperador && <AbaModulos operadorId={editOperador.id} />}
                        </TabsContent>

                        <TabsContent value="unidades" className="mt-4">
                            {editOperador && <AbaUnidades operadorId={editOperador.id} />}
                        </TabsContent>

                        <TabsContent value="termo" className="mt-4">
                            {editOperador && <AbaTermo operadorId={editOperador.id} />}
                        </TabsContent>

                        <TabsContent value="auditoria" className="mt-4">
                            {editOperador && <AbaAuditoria operadorId={editOperador.id} />}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

/* ==================== Subcomponentes das abas ==================== */

/* PERFIS – só leitura aqui para não duplicar regra. (Podemos tornar editável depois.) */
function PerfisReadOnly({ operador }: { operador: Operador | null }) {
    if (!operador) return null;
    return (
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Perfis vinculados a este operador:</p>
            <div className="flex flex-wrap gap-1">
                {operador.perfis?.length ? operador.perfis.map((p,i)=>(<Badge key={`${p}-${i}`} variant="secondary">{p}</Badge>))
                    : <span className="text-sm text-muted-foreground">Nenhum perfil</span>}
            </div>
            <p className="text-xs text-muted-foreground">A edição completa de perfis está na aba "Perfis e Permissões".</p>
        </div>
    );
}

/* ===== PERFIS (editável) - ÚNICA VERSÃO ===== */
function AbaPerfis({ operadorId }: { operadorId: number }) {
    const { toast } = useToast();
    const [dominio, setDominio] = useState<{value:string; label:string}[]>([]);
    const [selecionados, setSelecionados] = useState<string[]>([]);
    const [busca, setBusca] = useState('');

    // Carrega domínio de perfis e os perfis do operador
    useEffect(() => {
        (async () => {
            try {
                // ✅ CORREÇÃO 1: Import correto
                const configService = await import('@/services/ConfiguracaoService');
                const todosPerfis = await configService.default.listarPerfis();
                const doOperador = await opSvc.listarPerfisDoOperador?.(operadorId) || [];

                const opts = (Array.isArray(todosPerfis) ? todosPerfis : [])
                    .filter((p: any) => (p?.nome || '').trim().length > 0 && p?.ativo !== false)
                    .map((p: any) => ({
                        value: String(p.nome).trim(),
                        label: String(p.nomeExibicao || p.nomeCustomizado || p.nome).trim(),
                    }))
                    .sort((a:any,b:any)=>a.label.localeCompare(b.label));

                setDominio(opts);
                setSelecionados(Array.isArray(doOperador) ? doOperador : []);
            } catch (e: any) {
                toast({ title: 'Erro', description: e?.message || 'Falha ao carregar perfis.', variant: 'destructive' });
            }
        })();
    }, [operadorId, toast]);

    const toggle = (p:string) => setSelecionados(prev => prev.includes(p) ? prev.filter(x=>x!==p) : [...prev, p]);

    const salvar = async () => {
        try {
            await opSvc.salvarPerfisDoOperador?.(operadorId, selecionados);
            toast({ title: 'Perfis salvos' });
        } catch (e:any) {
            toast({ title: 'Erro', description: e?.message || 'Falha ao salvar perfis.', variant: 'destructive' });
        }
    };

    const filtrados = dominio.filter(o => o.label.toLowerCase().includes(busca.toLowerCase()) || o.value.toLowerCase().includes(busca.toLowerCase()));

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input placeholder="Filtrar perfis..." value={busca} onChange={(e)=>setBusca(e.target.value)} />
                <Button onClick={salvar}>Salvar</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-2">
                {filtrados.map(opt => (
                    <label key={opt.value} className="border rounded px-3 py-2 flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={selecionados.includes(opt.value)} onChange={()=>toggle(opt.value)} />
                        <span className="truncate">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">({opt.value})</span>
                    </label>
                ))}
                {filtrados.length===0 && <span className="text-sm text-muted-foreground">Nenhum perfil encontrado.</span>}
            </div>
        </div>
    );
}

function AbaRestricoes({ operadorId }: { operadorId: number }) {
    const { toast } = useToast();
    const [lista, setLista] = useState<opSvc.RestricaoDTO[]>([]);
    const [form, setForm] = useState<opSvc.RestricaoDTO>({ tipo:'IP', valor:'', observacao:'', ativo:true });

    const carregar = async ()=>{
        try { setLista(await opSvc.listarRestricoes(operadorId)); }
        catch(e:any){ toast({ title: 'Erro', description: e?.message || 'Falha ao listar restrições.', variant:'destructive' }); }
    };
    useEffect(()=>{ carregar(); }, [operadorId]);

    const salvar = async ()=>{
        try {
            if(form.id) await opSvc.atualizarRestricao(operadorId, form.id, form);
            else await opSvc.criarRestricao(operadorId, form);
            setForm({ tipo:'IP', valor:'', observacao:'', ativo:true });
            carregar();
        } catch(e:any){
            toast({ title: 'Erro', description: e?.message || 'Falha ao salvar restrição.', variant:'destructive' });
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-4 gap-2">
                <select className="border rounded px-2 py-2" value={form.tipo} onChange={e=>setForm(f=>({ ...f, tipo: e.target.value as any }))}>
                    <option>IP</option><option>HOST</option><option>DATA</option><option>OUTRO</option>
                </select>
                <Input placeholder="Valor (ex.: 200.200.0.0/24)" value={form.valor} onChange={e=>setForm(f=>({ ...f, valor: e.target.value }))}/>
                <Input placeholder="Observação" value={form.observacao||''} onChange={e=>setForm(f=>({ ...f, observacao: e.target.value }))}/>
                <Button onClick={salvar}>{form.id?'Atualizar':'Adicionar'}</Button>
            </div>

            <Table>
                <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Valor</TableHead><TableHead>Obs.</TableHead><TableHead>Ativo</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                    {lista.map(r=>(
                        <TableRow key={r.id}>
                            <TableCell>{r.tipo}</TableCell><TableCell>{r.valor}</TableCell><TableCell>{r.observacao||'-'}</TableCell>
                            <TableCell>{r.ativo?'Sim':'Não'}</TableCell>
                            <TableCell className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={()=>setForm(r)}>Editar</Button>
                                <Button variant="outline" size="sm" onClick={async()=>{ await opSvc.removerRestricao(operadorId, r.id!); carregar(); }}>Remover</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {lista.length===0 && (<TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sem restrições.</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </div>
    );
}

/* HORÁRIOS */
function AbaHorarios({ operadorId }: { operadorId: number }) {
    const { toast } = useToast();
    const [lista, setLista] = useState<opSvc.HorarioDTO[]>([]);
    const [form, setForm] = useState<opSvc.HorarioDTO>({ diaSemana:1, horaInicio:'08:00', horaFim:'12:00', ativo:true });
    const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

    const carregar = async ()=> {
        try { setLista(await opSvc.listarHorarios(operadorId)); }
        catch(e:any){ toast({ title:'Erro', description:e?.message || 'Falha ao listar horários.', variant:'destructive' }); }
    };
    useEffect(()=>{ carregar(); }, [operadorId]);

    const salvar = async ()=>{
        try {
            if(form.id) await opSvc.atualizarHorario(operadorId, form.id, form);
            else await opSvc.criarHorario(operadorId, form);
            setForm({ diaSemana:1, horaInicio:'08:00', horaFim:'12:00', ativo:true });
            carregar();
        } catch(e:any){ toast({ title:'Erro', description:e?.message || 'Falha ao salvar horário.', variant:'destructive' }); }
    };

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-5 gap-2">
                <select className="border rounded px-2 py-2" value={form.diaSemana} onChange={e=>setForm(f=>({ ...f, diaSemana: Number(e.target.value) as any }))}>
                    {dias.map((d,idx)=>(<option key={idx} value={idx}>{idx} - {d}</option>))}
                </select>
                <Input type="time" value={form.horaInicio} onChange={e=>setForm(f=>({ ...f, horaInicio: e.target.value }))}/>
                <Input type="time" value={form.horaFim} onChange={e=>setForm(f=>({ ...f, horaFim: e.target.value }))}/>
                <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!form.ativo} onChange={e=>setForm(f=>({ ...f, ativo: e.target.checked }))}/> Ativo
                </label>
                <Button onClick={salvar}>{form.id?'Atualizar':'Adicionar'}</Button>
            </div>

            <Table>
                <TableHeader><TableRow><TableHead>Dia</TableHead><TableHead>Início</TableHead><TableHead>Fim</TableHead><TableHead>Ativo</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                    {lista.map(h=>(
                        <TableRow key={h.id}>
                            <TableCell>{dias[h.diaSemana]} ({h.diaSemana})</TableCell>
                            <TableCell>{h.horaInicio}</TableCell>
                            <TableCell>{h.horaFim}</TableCell>
                            <TableCell>{h.ativo?'Sim':'Não'}</TableCell>
                            <TableCell className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={()=>setForm(h)}>Editar</Button>
                                <Button variant="outline" size="sm" onClick={async()=>{ await opSvc.removerHorario(operadorId, h.id!); carregar(); }}>Remover</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {lista.length===0 && (<TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sem horários.</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </div>
    );
}

/* SETORES */
function AbaSetores({ operadorId }: { operadorId: number }) {
    const { toast } = useToast();
    const [dominio, setDominio] = useState<opSvc.SetorDTO[]>([]);
    const [selecionados, setSelecionados] = useState<number[]>([]);

    const carregar = async ()=>{
        try {
            const [dom, sel] = await Promise.all([opSvc.listarDominioSetores(), opSvc.listarSetoresDoOperador(operadorId)]);
            setDominio(dom); setSelecionados(sel);
        } catch(e:any){
            toast({ title:'Erro', description:e?.message || 'Falha ao listar setores.', variant:'destructive' });
        }
    };
    useEffect(()=>{ carregar(); }, [operadorId]);

    const toggle = (id:number)=> setSelecionados(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

    return (
        <div className="space-y-3">
            <div className="grid md:grid-cols-3 gap-2">
                {dominio.map(s=>(
                    <label key={s.id} className="border rounded px-3 py-2 flex items-center gap-2">
                        <input type="checkbox" checked={selecionados.includes(s.id)} onChange={()=>toggle(s.id)} /> {s.nome}
                    </label>
                ))}
            </div>
            <div>
                <Button onClick={async()=>{ await opSvc.salvarSetoresDoOperador(operadorId, selecionados); toast({title:'Setores salvos'}); }}>Salvar</Button>
            </div>
        </div>
    );
}

/* MÓDULOS (override) */
function AbaModulos({ operadorId }: { operadorId: number }) {
    const { toast } = useToast();
    const [texto, setTexto] = useState('');
    const [modulos, setModulos] = useState<string[]>([]);

    const carregar = async ()=> {
        try { setModulos(await opSvc.listarModulosDoOperador(operadorId)); }
        catch(e:any){ toast({ title:'Erro', description:e?.message || 'Falha ao listar módulos.', variant:'destructive' }); }
    };
    useEffect(()=>{ carregar(); }, [operadorId]);

    const adicionar = ()=>{
        const m = texto.trim().toUpperCase();
        if(!m) return;
        if(!modulos.includes(m)) setModulos([...modulos, m]);
        setTexto('');
    };
    const remover = (m:string)=> setModulos(modulos.filter(x=>x!==m));

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input placeholder="Ex.: FARMACIA" value={texto} onChange={e=>setTexto(e.target.value)} />
                <Button onClick={adicionar}>Adicionar</Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {modulos.map(m=>(
                    <span key={m} className="px-2 py-1 bg-muted rounded inline-flex items-center gap-2">
            {m}
                        <button className="text-xs opacity-70 hover:opacity-100" onClick={()=>remover(m)}>x</button>
          </span>
                ))}
                {modulos.length===0 && <span className="opacity-60 text-sm">Sem overrides; módulos virão apenas do Perfil.</span>}
            </div>
            <div>
                <Button onClick={async()=>{ await opSvc.salvarModulosDoOperador(operadorId, modulos); toast({title:'Módulos salvos'}); }}>Salvar</Button>
            </div>
        </div>
    );
}

/* UNIDADES — entrada simples por IDs (podemos evoluir para autocomplete) */
function AbaUnidades({ operadorId }: { operadorId: number }) {
    const { toast } = useToast();
    const [idsTexto, setIdsTexto] = useState('');
    const [carregado, setCarregado] = useState(false);

    const carregar = async ()=>{
        try {
            const ids = await opSvc.listarUnidadesDoOperador(operadorId);
            setIdsTexto(ids.join(', '));
            setCarregado(true);
        } catch(e:any){
            toast({ title:'Erro', description:e?.message || 'Falha ao carregar unidades.', variant:'destructive' });
        }
    };
    useEffect(()=>{ carregar(); }, [operadorId]);

    const salvar = async ()=>{
        const ids = idsTexto.split(',').map(s=>Number(String(s).trim())).filter(n=>!Number.isNaN(n));
        try { await opSvc.salvarUnidadesDoOperador(operadorId, ids); toast({ title:'Unidades salvas' }); }
        catch(e:any){ toast({ title:'Erro', description:e?.message || 'Falha ao salvar unidades.', variant:'destructive' }); }
    };

    if(!carregado) return <div className="text-sm text-muted-foreground">Carregando...</div>;

    return (
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Informe os IDs das unidades (separados por vírgula). Depois clique em Salvar.</p>
            <textarea className="w-full border rounded p-2 h-28" value={idsTexto} onChange={e=>setIdsTexto(e.target.value)} />
            <Button onClick={salvar}>Salvar</Button>
        </div>
    );
}

/* TERMO */
function AbaTermo({ operadorId }: { operadorId: number }) {
    const { toast } = useToast();
    const [lista, setLista] = useState<opSvc.TermoDTO[]>([]);
    const [versao, setVersao] = useState('v1');

    const carregar = async ()=> {
        try { setLista(await opSvc.listarTermos(operadorId)); }
        catch(e:any){ toast({ title:'Erro', description:e?.message || 'Falha ao listar termos.', variant:'destructive' }); }
    };
    useEffect(()=>{ carregar(); }, [operadorId]);

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input placeholder="Versão do termo (ex.: v5.18.2)" value={versao} onChange={e=>setVersao(e.target.value)} />
                <Button onClick={async()=>{ await opSvc.aceitarTermo(operadorId, versao); toast({title:'Aceite registrado'}); carregar(); }}>Registrar aceite</Button>
            </div>
            <Table>
                <TableHeader><TableRow><TableHead>Versão</TableHead><TableHead>Data/Hora</TableHead><TableHead>IP</TableHead><TableHead>User-Agent</TableHead></TableRow></TableHeader>
                <TableBody>
                    {lista.map(t=>(
                        <TableRow key={t.id}>
                            <TableCell>{t.versao}</TableCell>
                            <TableCell>{new Date(t.aceitoEm).toLocaleString()}</TableCell>
                            <TableCell>{t.ip || '-'}</TableCell>
                            <TableCell className="truncate max-w-[420px]">{t.userAgent || '-'}</TableCell>
                        </TableRow>
                    ))}
                    {lista.length===0 && (<TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sem registros de aceite.</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </div>
    );
}

/* AUDITORIA */
function AbaAuditoria({ operadorId }: { operadorId: number }) {
    const { toast } = useToast();
    const [lista, setLista] = useState<opSvc.AuditoriaLoginDTO[]>([]);

    const carregar = async ()=> {
        try { setLista(await opSvc.listarAuditoriaLogin(operadorId)); }
        catch(e:any){ toast({ title:'Erro', description:e?.message || 'Falha ao listar auditoria.', variant:'destructive' }); }
    };
    useEffect(()=>{ carregar(); }, [operadorId]);

    return (
        <div className="space-y-2">
            <Table>
                <TableHeader><TableRow><TableHead>Data/Hora</TableHead><TableHead>Sucesso</TableHead><TableHead>IP</TableHead><TableHead>User-Agent</TableHead><TableHead>Motivo</TableHead></TableRow></TableHeader>
                <TableBody>
                    {lista.map(l=>(
                        <TableRow key={l.id}>
                            <TableCell>{new Date(l.dataHora).toLocaleString()}</TableCell>
                            <TableCell>{l.sucesso ? '✔' : '✖'}</TableCell>
                            <TableCell>{l.ip || '-'}</TableCell>
                            <TableCell className="truncate max-w-[420px]">{l.userAgent || '-'}</TableCell>
                            <TableCell>{l.motivo || '-'}</TableCell>
                        </TableRow>
                    ))}
                    {lista.length===0 && (<TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sem registros.</TableCell></TableRow>)}
                </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground">Aba focada em login. Para auditoria geral, podemos ligar na sua tabela de logs.</p>
        </div>
    );
}