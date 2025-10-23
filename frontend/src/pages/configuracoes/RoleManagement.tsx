import React, { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Shield, RefreshCw, Trash2, Edit3, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { useToast } from '@/components/ui/use-toast.ts';
import configuracaoService, { Perfil } from '@/services/ConfiguracaoService.ts';

const profileFormSchema = z.object({
    nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
    descricao: z.string().min(3, { message: 'A descrição deve ter pelo menos 3 caracteres.' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const RoleManagement: React.FC = () => {
    const { toast } = useToast();

    const [perfis, setPerfis] = useState<Perfil[]>([]);
    const [permissoes, setPermissoes] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Estados de dialogs e formulário
    const [openCreateOrEdit, setOpenCreateOrEdit] = useState<boolean>(false);
    const [openPermissions, setOpenPermissions] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState<boolean>(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formLoading, setFormLoading] = useState<boolean>(false);
    const [perfilSelecionado, setPerfilSelecionado] = useState<Perfil | null>(null);

    // Formulário (nome/descrição)
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: { nome: '', descricao: '' },
    });

    // Estado controlado para permissões do perfil em edição (para o modal de permissões)
    const [permissoesPerfil, setPermissoesPerfil] = useState<string[]>([]);

    // Carrega a lista de perfis e permissões disponíveis
    const carregarDados = async () => {
        try {
            setLoading(true);
            const [listaPerfis, listaPermissoes] = await Promise.all([
                configuracaoService.listarPerfis(),
                configuracaoService.listarPermissoes(),
            ]);
            setPerfis(listaPerfis || []);
            setPermissoes(listaPermissoes || []);
        } catch (e: any) {
            toast({
                title: 'Erro ao carregar dados',
                description: e?.response?.data?.message || 'Não foi possível listar perfis e permissões.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    const totalPerfis = useMemo(() => perfis.length, [perfis]);

    // Ações: criar/editar
    const abrirCriar = () => {
        setFormMode('create');
        form.reset({ nome: '', descricao: '' });
        setOpenCreateOrEdit(true);
    };

    const abrirEditar = (p: Perfil) => {
        setFormMode('edit');
        form.reset({
            nome: p.nome ?? '',
            descricao: p.descricao ?? '',
        });
        setPerfilSelecionado(p);
        setOpenCreateOrEdit(true);
    };

    const salvarPerfil = async (data: ProfileFormValues) => {
        setFormLoading(true);
        try {
            if (formMode === 'create') {
                const novo: Perfil = {
                    nome: data.nome.trim(),
                    descricao: data.descricao.trim(),
                    ativo: true,
                    sistemaPerfil: false,
                    permissoes: [],
                    tipo: null, // backend pode inferir/padrão
                };
                const criado = await configuracaoService.criarPerfil(novo);
                if (criado) {
                    toast({ title: 'Perfil criado', description: `Perfil "${criado.nome}" criado com sucesso.` });
                    setOpenCreateOrEdit(false);
                    form.reset();
                    await carregarDados();
                }
            } else {
                if (!perfilSelecionado?.id) return;
                const atualizado: Perfil = {
                    ...perfilSelecionado,
                    nome: data.nome.trim(),
                    descricao: data.descricao.trim(),
                };
                const ret = await configuracaoService.atualizarPerfil(perfilSelecionado.id, atualizado);
                if (ret) {
                    toast({ title: 'Perfil atualizado', description: `Perfil "${ret.nome}" atualizado com sucesso.` });
                    setOpenCreateOrEdit(false);
                    setPerfilSelecionado(null);
                    await carregarDados();
                }
            }
        } catch (e: any) {
            toast({
                title: 'Erro ao salvar perfil',
                description: e?.response?.data?.message || 'Verifique os dados e tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setFormLoading(false);
        }
    };

    // Ações: permissões
    const abrirPermissoes = (p: Perfil) => {
        setPerfilSelecionado(p);
        setPermissoesPerfil(Array.isArray(p.permissoes) ? p.permissoes : []);
        setOpenPermissions(true);
    };

    const togglePermissao = (perm: string) => {
        setPermissoesPerfil(prev => (prev.includes(perm) ? prev.filter(x => x !== perm) : [...prev, perm]));
    };

    const salvarPermissoes = async () => {
        if (!perfilSelecionado?.id) return;
        setFormLoading(true);
        try {
            const ret = await configuracaoService.atribuirPermissoes(perfilSelecionado.id!, permissoesPerfil);

            if (ret) {
                toast({ title: 'Permissões atualizadas', description: `Permissões do perfil "${ret.nome}" atualizadas.` });
                setOpenPermissions(false);
                setPerfilSelecionado(null);
                await carregarDados();
            } else {
                toast({
                    title: 'Falha ao salvar permissões',
                    description: 'A API retornou erro ao atribuir as permissões.',
                    variant: 'destructive',
                });
            }
        } catch (e: any) {
            toast({
                title: 'Erro ao atualizar permissões',
                description: e?.response?.data?.message || 'Não foi possível atualizar as permissões.',
                variant: 'destructive',
            });
        } finally {
            setFormLoading(false);
        }
    };

    // Ações: excluir
    const abrirExcluir = (p: Perfil) => {
        setPerfilSelecionado(p);
        setOpenDelete(true);
    };

    const excluirPerfil = async () => {
        if (!perfilSelecionado?.id) return;
        setFormLoading(true);
        try {
            const ok = await configuracaoService.excluirPerfil(perfilSelecionado.id!);
            if (ok) {
                toast({ title: 'Perfil excluído', description: `Perfil "${perfilSelecionado.nome}" excluído.` });
                setOpenDelete(false);
                setPerfilSelecionado(null);
                await carregarDados();
            }
        } catch (e: any) {
            toast({
                title: 'Erro ao excluir perfil',
                description: e?.response?.data?.message || 'Não foi possível excluir o perfil.',
                variant: 'destructive',
            });
        } finally {
            setFormLoading(false);
        }
    };

    // Agrupa permissões por categoria (prefixo antes do primeiro "_")
    const permissoesAgrupadas = useMemo(() => {
        return (permissoes || []).reduce((acc, perm) => {
            const parts = perm.split('_');
            const cat = parts.length > 1 ? parts[0] : 'OUTROS';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(perm);
            return acc;
        }, {} as Record<string, string[]>);
    }, [permissoes]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Gerenciamento de Perfis e Permissões</CardTitle>
                    <CardDescription>Crie, edite e gerencie os perfis de acesso e suas permissões.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={carregarDados} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </Button>
                    <Button onClick={abrirCriar}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Novo Perfil
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Carregando perfis...
                    </div>
                ) : perfis.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Nenhum perfil cadastrado.</div>
                ) : (
                    <>
                        <div className="mb-3 text-sm text-muted-foreground">{totalPerfis} perfil(is) encontrado(s)</div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Permissões</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {perfis.map(p => {
                                    const qtd = Array.isArray(p.permissoes) ? p.permissoes.length : 0;
                                    return (
                                        <TableRow key={p.id ?? p.nome}>
                                            <TableCell className="font-medium">{p.nome}</TableCell>
                                            <TableCell className="max-w-[420px] truncate">{p.descricao || '-'}</TableCell>
                                            <TableCell>{qtd} permissão(ões)</TableCell>
                                            <TableCell>
                                                {p.sistemaPerfil ? (
                                                    <Badge variant="secondary">Sistema</Badge>
                                                ) : (
                                                    <Badge variant="outline">Custom</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    title="Gerenciar permissões"
                                                    onClick={() => abrirPermissoes(p)}
                                                >
                                                    <Shield className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    title="Editar perfil"
                                                    disabled={p.sistemaPerfil}
                                                    onClick={() => abrirEditar(p)}
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    title="Excluir perfil"
                                                    className="text-red-600"
                                                    disabled={p.sistemaPerfil}
                                                    onClick={() => abrirExcluir(p)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </>
                )}
            </CardContent>

            {/* Dialog Criar/Editar */}
            <Dialog open={openCreateOrEdit} onOpenChange={setOpenCreateOrEdit}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>{formMode === 'create' ? 'Criar Novo Perfil' : 'Editar Perfil'}</DialogTitle>
                        <DialogDescription>
                            {formMode === 'create' ? 'Preencha os dados para criar um novo perfil.' : 'Atualize as informações do perfil.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(salvarPerfil)} className="space-y-4 py-2">
                            <FormField
                                name="nome"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex.: Médico ESF" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="descricao"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl>
                                            <Textarea rows={3} placeholder="Breve descrição do perfil" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpenCreateOrEdit(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={formLoading}>
                                    {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {formMode === 'create' ? 'Criar Perfil' : 'Salvar Alterações'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Dialog Permissões */}
            <Dialog open={openPermissions} onOpenChange={setOpenPermissions}>
                <DialogContent className="sm:max-w-[720px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Permissões</DialogTitle>
                        <DialogDescription>Selecione as permissões para o perfil {perfilSelecionado?.nome || ''}.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-6">
                        {Object.entries(permissoesAgrupadas).map(([categoria, lista]) => (
                            <div key={categoria}>
                                <h3 className="text-sm font-semibold mb-2 text-primary">{categoria}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-md p-3">
                                    {lista.map(perm => {
                                        const id = `perm-${categoria}-${perm}`;
                                        const checked = permissoesPerfil.includes(perm);
                                        return (
                                            <label key={id} htmlFor={id} className="flex items-center gap-2 cursor-pointer text-sm">
                                                <Checkbox id={id} checked={checked} onCheckedChange={() => togglePermissao(perm)} />
                                                {perm}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenPermissions(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={salvarPermissoes} disabled={formLoading}>
                            {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Permissões
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Excluir */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir o perfil {perfilSelecionado?.nome}? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDelete(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={excluirPerfil} disabled={formLoading}>
                            {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Excluir Perfil
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default RoleManagement;