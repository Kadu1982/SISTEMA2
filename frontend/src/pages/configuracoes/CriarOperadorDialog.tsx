// pages/configuracoes/CriarOperadorDialog.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, X, Check, Building2 } from 'lucide-react';
import operadoresService from '@/services/operadoresService';
import * as perfisService from '@/services/perfisService';
import { PerfilDTO } from '@/services/perfisService';
import { listarUnidades, UnidadeDTO } from '@/services/unidadesService';

interface CriarOperadorDialogProps {
    aberto: boolean;
    onFechar: () => void;
    onCriado: () => void;
}

export function CriarOperadorDialog({ aberto, onFechar, onCriado }: CriarOperadorDialogProps) {
    // Dados básicos do operador
    const [nome, setNome] = useState('');
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');

    // Perfis
    const [perfisDisponiveis, setPerfisDisponiveis] = useState<PerfilDTO[]>([]);
    const [perfisSelecionados, setPerfisSelecionados] = useState<string[]>([]);
    const [perfilParaAdicionar, setPerfilParaAdicionar] = useState('');

    // Criar novo perfil
    const [mostrarCriarPerfil, setMostrarCriarPerfil] = useState(false);
    const [novoPerfilTipo, setNovoPerfilTipo] = useState('');
    const [novoPerfilNome, setNovoPerfilNome] = useState('');
    const [novoPerfilModulos, setNovoPerfilModulos] = useState('UPA');
    const [criandoPerfil, setCriandoPerfil] = useState(false);

    // Unidades
    const [unidadesDisponiveis, setUnidadesDisponiveis] = useState<UnidadeDTO[]>([]);
    const [unidadesSelecionadas, setUnidadesSelecionadas] = useState<number[]>([]);
    const [unidadePrincipal, setUnidadePrincipal] = useState<number | null>(null);
    const [carregandoUnidades, setCarregandoUnidades] = useState(true);

    // Estados de carregamento
    const [salvando, setSalvando] = useState(false);
    const [carregandoPerfis, setCarregandoPerfis] = useState(true);
    const [erro, setErro] = useState('');

    // Carregar perfis e unidades disponíveis
    useEffect(() => {
        if (aberto) {
            carregarPerfis();
            carregarUnidades();
        }
    }, [aberto]);

    const carregarPerfis = async () => {
        setCarregandoPerfis(true);
        try {
            const perfis = await perfisService.listarPerfis();
            setPerfisDisponiveis(perfis);
        } catch (error) {
            console.error('Erro ao carregar perfis:', error);
        } finally {
            setCarregandoPerfis(false);
        }
    };

    const carregarUnidades = async () => {
        setCarregandoUnidades(true);
        try {
            const response = await listarUnidades();
            setUnidadesDisponiveis(response.content || []);
        } catch (error) {
            console.error('Erro ao carregar unidades:', error);
        } finally {
            setCarregandoUnidades(false);
        }
    };

    const adicionarPerfil = () => {
        if (!perfilParaAdicionar) return;
        if (!perfisSelecionados.includes(perfilParaAdicionar)) {
            setPerfisSelecionados([...perfisSelecionados, perfilParaAdicionar]);
        }
        setPerfilParaAdicionar('');
    };

    const removerPerfil = (perfil: string) => {
        setPerfisSelecionados(perfisSelecionados.filter(p => p !== perfil));
    };

    const toggleUnidade = (unidadeId: number) => {
        if (unidadesSelecionadas.includes(unidadeId)) {
            // Remover
            setUnidadesSelecionadas(unidadesSelecionadas.filter(id => id !== unidadeId));
            // Se era a principal, limpar
            if (unidadePrincipal === unidadeId) {
                setUnidadePrincipal(null);
            }
        } else {
            // Adicionar
            setUnidadesSelecionadas([...unidadesSelecionadas, unidadeId]);
            // Se é a primeira, definir como principal
            if (unidadesSelecionadas.length === 0) {
                setUnidadePrincipal(unidadeId);
            }
        }
    };

    const definirComoPrincipal = (unidadeId: number) => {
        if (unidadesSelecionadas.includes(unidadeId)) {
            setUnidadePrincipal(unidadeId);
        }
    };

    const criarNovoPerfil = async () => {
        if (!novoPerfilTipo || !novoPerfilNome) {
            setErro('Tipo e nome do perfil são obrigatórios');
            return;
        }

        setCriandoPerfil(true);
        setErro('');

        try {
            const modulos = novoPerfilModulos.split(',').map(m => m.trim()).filter(m => m);

            await perfisService.criarPerfilCompleto(
                novoPerfilTipo,
                novoPerfilNome,
                modulos,
                ['UPA_ACESSAR', 'UPA_VISUALIZAR'] // Permissões básicas
            );

            // Recarregar lista de perfis
            await carregarPerfis();

            // Adicionar automaticamente aos perfis selecionados
            setPerfisSelecionados([...perfisSelecionados, novoPerfilTipo]);

            // Limpar form
            setNovoPerfilTipo('');
            setNovoPerfilNome('');
            setNovoPerfilModulos('UPA');
            setMostrarCriarPerfil(false);

        } catch (error: any) {
            setErro(error.message || 'Erro ao criar perfil');
        } finally {
            setCriandoPerfil(false);
        }
    };

    const criarOperador = async () => {
        // Validações
        if (!nome || !login || !senha || !cpf) {
            setErro('Preencha todos os campos obrigatórios');
            return;
        }

        if (perfisSelecionados.length === 0) {
            setErro('Selecione pelo menos um perfil');
            return;
        }

        if (unidadesSelecionadas.length === 0) {
            setErro('Selecione pelo menos uma unidade de saúde');
            return;
        }

        if (!unidadePrincipal) {
            setErro('Defina uma unidade principal');
            return;
        }

        setSalvando(true);
        setErro('');

        try {
            // 1. Criar operador com unidade principal
            const operadorCriado = await operadoresService.criar({
                nome,
                login,
                senha,
                cpf,
                email: email || undefined,
                ativo: true,
                unidadeId: unidadePrincipal,
                perfis: [],
            });

            // 2. Adicionar perfis ao operador
            await operadoresService.salvarPerfis(operadorCriado.id!, perfisSelecionados);

            // 3. Adicionar todas as unidades (incluindo a principal)
            await operadoresService.salvarUnidadesDoOperador(
                operadorCriado.id!,
                unidadesSelecionadas
            );

            // Limpar formulário
            limparFormulario();

            // Notificar sucesso
            onCriado();
            onFechar();

        } catch (error: any) {
            setErro(error.message || 'Erro ao criar operador');
        } finally {
            setSalvando(false);
        }
    };

    const limparFormulario = () => {
        setNome('');
        setLogin('');
        setSenha('');
        setCpf('');
        setEmail('');
        setPerfisSelecionados([]);
        setUnidadesSelecionadas([]);
        setUnidadePrincipal(null);
    };

    const usarTemplate = async (templateKey: keyof typeof perfisService.PERFIS_TEMPLATES) => {
        try {
            const perfil = await perfisService.criarPerfilDoTemplate(templateKey);
            await carregarPerfis();
            setPerfisSelecionados([...perfisSelecionados, perfil.tipo]);
        } catch (error: any) {
            setErro(error.message || 'Erro ao criar perfil do template');
        }
    };

    return (
        <Dialog open={aberto} onOpenChange={onFechar}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Criar Novo Operador</DialogTitle>
                    <DialogDescription>
                        Preencha os dados do operador e selecione os perfis de acesso
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Dados Básicos */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm">Dados Básicos</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="nome">Nome *</Label>
                                <Input
                                    id="nome"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Nome completo"
                                />
                            </div>

                            <div>
                                <Label htmlFor="login">Login *</Label>
                                <Input
                                    id="login"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                    placeholder="usuario.login"
                                />
                            </div>

                            <div>
                                <Label htmlFor="senha">Senha *</Label>
                                <Input
                                    id="senha"
                                    type="password"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    placeholder="Senha@123"
                                />
                            </div>

                            <div>
                                <Label htmlFor="cpf">CPF *</Label>
                                <Input
                                    id="cpf"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                    placeholder="000.000.000-00"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Perfis */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">Perfis de Acesso</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMostrarCriarPerfil(!mostrarCriarPerfil)}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Novo Perfil
                            </Button>
                        </div>

                        {/* Templates Rápidos */}
                        <div className="flex gap-2 flex-wrap">
                            <span className="text-sm text-muted-foreground">Templates:</span>
                            {Object.entries(perfisService.PERFIS_TEMPLATES).map(([key, template]) => (
                                <Button
                                    key={key}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => usarTemplate(key as any)}
                                >
                                    {template.nome}
                                </Button>
                            ))}
                        </div>

                        {/* Criar novo perfil */}
                        {mostrarCriarPerfil && (
                            <div className="border rounded p-4 space-y-3 bg-muted/50">
                                <h4 className="text-sm font-medium">Criar Novo Perfil</h4>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="novo-perfil-tipo">Código/Tipo *</Label>
                                        <Input
                                            id="novo-perfil-tipo"
                                            value={novoPerfilTipo}
                                            onChange={(e) => setNovoPerfilTipo(e.target.value)}
                                            placeholder="NOME_PERFIL"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="novo-perfil-nome">Nome *</Label>
                                        <Input
                                            id="novo-perfil-nome"
                                            value={novoPerfilNome}
                                            onChange={(e) => setNovoPerfilNome(e.target.value)}
                                            placeholder="Nome do Perfil"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <Label htmlFor="novo-perfil-modulos">Módulos (separados por vírgula)</Label>
                                        <Input
                                            id="novo-perfil-modulos"
                                            value={novoPerfilModulos}
                                            onChange={(e) => setNovoPerfilModulos(e.target.value)}
                                            placeholder="UPA, RECEPCAO"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={criarNovoPerfil}
                                        disabled={criandoPerfil}
                                        size="sm"
                                    >
                                        {criandoPerfil ? (
                                            <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Criando...</>
                                        ) : (
                                            <><Check className="h-4 w-4 mr-1" /> Criar Perfil</>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setMostrarCriarPerfil(false)}
                                        size="sm"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Selecionar perfil existente */}
                        <div className="flex gap-2">
                            <Select value={perfilParaAdicionar} onValueChange={setPerfilParaAdicionar}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Selecione um perfil..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {carregandoPerfis ? (
                                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                                    ) : perfisDisponiveis.length === 0 ? (
                                        <SelectItem value="empty" disabled>Nenhum perfil disponível</SelectItem>
                                    ) : (
                                        perfisDisponiveis.map((perfil) => (
                                            <SelectItem key={perfil.id} value={perfil.tipo}>
                                                {perfil.nome} ({perfil.tipo})
                                                {perfil.modulos && perfil.modulos.length > 0 && (
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        - {perfil.modulos.join(', ')}
                                                    </span>
                                                )}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <Button onClick={adicionarPerfil} disabled={!perfilParaAdicionar}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Lista de perfis selecionados */}
                        <div className="border rounded">
                            {perfisSelecionados.length === 0 ? (
                                <div className="p-3 text-sm text-muted-foreground text-center">
                                    Nenhum perfil selecionado
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {perfisSelecionados.map((perfil) => {
                                        const perfilInfo = perfisDisponiveis.find(p => p.tipo === perfil);
                                        return (
                                            <div key={perfil} className="flex items-center justify-between px-3 py-2">
                                                <div>
                                                    <span className="font-mono text-sm">{perfil}</span>
                                                    {perfilInfo?.modulos && perfilInfo.modulos.length > 0 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Módulos: {perfilInfo.modulos.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removerPerfil(perfil)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Unidades de Saúde */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            <h3 className="font-semibold text-sm">Unidades de Saúde</h3>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Selecione as unidades onde o operador pode atuar. A unidade marcada como
                            "Principal" será a unidade padrão do operador.
                        </p>

                        {/* Lista de unidades com checkboxes */}
                        <div className="border rounded divide-y max-h-64 overflow-y-auto">
                            {carregandoUnidades ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                                    Carregando unidades...
                                </div>
                            ) : unidadesDisponiveis.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Nenhuma unidade de saúde cadastrada
                                </div>
                            ) : (
                                unidadesDisponiveis.map((unidade) => {
                                    const selecionada = unidadesSelecionadas.includes(unidade.id!);
                                    const ehPrincipal = unidadePrincipal === unidade.id;

                                    return (
                                        <div
                                            key={unidade.id}
                                            className={`flex items-center justify-between p-3 hover:bg-muted/50 ${
                                                ehPrincipal ? 'bg-primary/5 border-l-2 border-primary' : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <Checkbox
                                                    checked={selecionada}
                                                    onCheckedChange={() => toggleUnidade(unidade.id!)}
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">
                                                        {unidade.nome || unidade.razaoSocial}
                                                        {ehPrincipal && (
                                                            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                                                Principal
                                                            </span>
                                                        )}
                                                    </div>
                                                    {unidade.tipo && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Tipo: {unidade.tipo}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {selecionada && !ehPrincipal && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => definirComoPrincipal(unidade.id!)}
                                                >
                                                    Definir como Principal
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Resumo */}
                        {unidadesSelecionadas.length > 0 && (
                            <div className="text-sm bg-muted/50 p-3 rounded">
                                <strong>{unidadesSelecionadas.length}</strong> unidade(s) selecionada(s)
                                {unidadePrincipal && (
                                    <div className="text-muted-foreground mt-1">
                                        Unidade principal:{' '}
                                        {unidadesDisponiveis.find(u => u.id === unidadePrincipal)?.nome || 'N/A'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Erro */}
                    {erro && (
                        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded text-sm">
                            {erro}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onFechar}>
                        Cancelar
                    </Button>
                    <Button onClick={criarOperador} disabled={salvando}>
                        {salvando ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Criando...</>
                        ) : (
                            'Criar Operador'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
