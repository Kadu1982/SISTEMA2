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
import { aplicarMascaraCpf, removerMascaraCpf } from '@/lib/pacienteUtils';

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
        setErro(''); // Limpar erros anteriores
        try {
            console.log('🔍 Carregando perfis...');
            const perfis = await perfisService.listarPerfis();
            console.log('✅ Perfis recebidos:', perfis);
            console.log('✅ Primeiro perfil (debug):', perfis[0]);
            console.log('✅ Tipo do primeiro perfil:', typeof perfis[0]?.tipo, perfis[0]?.tipo);
            
            if (!perfis || perfis.length === 0) {
                console.warn('⚠️ Nenhum perfil retornado');
                setErro('Nenhum perfil cadastrado no sistema. Por favor, cadastre um perfil primeiro.');
                setPerfisDisponiveis([]);
            } else {
                console.log(`✅ ${perfis.length} perfis definidos no estado`);
                // Garante que tipo seja sempre uma string
                const perfisNormalizados = perfis.map(p => ({
                    ...p,
                    tipo: typeof p.tipo === 'string' ? p.tipo : (p.tipo?.name || p.tipo?.toString() || String(p.tipo) || '')
                }));
                console.log('✅ Perfis normalizados:', perfisNormalizados);
                setPerfisDisponiveis(perfisNormalizados);
            }
        } catch (error: any) {
            console.error('❌ Erro ao carregar perfis:', error);
            
            // Tratamento específico para diferentes tipos de erro
            let mensagem = 'Erro ao carregar perfis';
            
            if (error?.response) {
                const status = error.response.status;
                const data = error.response.data;
                
                if (status === 403) {
                    mensagem = 'Acesso negado. Você não tem permissão para visualizar perfis. Entre como administrador do sistema.';
                } else if (status === 401) {
                    mensagem = 'Sessão expirada. Por favor, faça login novamente.';
                } else if (status === 404) {
                    mensagem = 'Endpoint de perfis não encontrado. Verifique a configuração do servidor.';
                } else if (data?.message) {
                    mensagem = `Erro ao carregar perfis: ${data.message}`;
                } else {
                    mensagem = `Erro ao carregar perfis (Status: ${status})`;
                }
            } else if (error?.message) {
                mensagem = `Erro ao carregar perfis: ${error.message}`;
            }
            
            setErro(mensagem);
            setPerfisDisponiveis([]);
        } finally {
            setCarregandoPerfis(false);
        }
    };

    const carregarUnidades = async () => {
        setCarregandoUnidades(true);
        // Não limpar erro aqui para não apagar erro de perfis
        try {
            const response = await listarUnidades();
            const unidades = response.content || [];
            if (unidades.length === 0) {
                setErro((prev) => {
                    const novoErro = 'Nenhuma unidade de saúde cadastrada no sistema. Por favor, cadastre uma unidade primeiro.';
                    return prev ? `${prev}\n${novoErro}` : novoErro;
                });
                setUnidadesDisponiveis([]);
            } else {
                setUnidadesDisponiveis(unidades);
            }
        } catch (error: any) {
            console.error('Erro ao carregar unidades:', error);
            const mensagem = error?.response?.data?.message || error?.message || 'Erro ao carregar unidades';
            setErro((prev) => {
                const novoErro = `Erro ao carregar unidades: ${mensagem}`;
                return prev ? `${prev}\n${novoErro}` : novoErro;
            });
            setUnidadesDisponiveis([]);
        } finally {
            setCarregandoUnidades(false);
        }
    };

    const adicionarPerfil = () => {
        console.log('🔍 adicionarPerfil chamado, perfilParaAdicionar:', perfilParaAdicionar);
        if (!perfilParaAdicionar) {
            console.warn('⚠️ Nenhum perfil selecionado');
            return;
        }
        
        // O valor já é o tipo do perfil (ou ID como fallback)
        // Busca o perfil pelo tipo ou ID
        const perfilEncontrado = perfisDisponiveis.find(p => {
            const tipo = p.tipo || '';
            const id = p.id?.toString() || '';
            return tipo === perfilParaAdicionar || id === perfilParaAdicionar;
        });
        
        if (!perfilEncontrado) {
            console.warn('⚠️ Perfil não encontrado:', perfilParaAdicionar);
            console.warn('⚠️ Perfis disponíveis:', perfisDisponiveis.map(p => ({
                id: p.id,
                tipo: p.tipo,
                nome: p.nome
            })));
            return;
        }
        
        console.log('✅ Perfil encontrado:', perfilEncontrado);
        
        // Usa o tipo do perfil como identificador (compatibilidade com backend)
        // Se não tiver tipo, usa o ID como fallback
        const perfilTipo = perfilEncontrado.tipo || perfilEncontrado.id?.toString() || perfilParaAdicionar;
        
        if (!perfilTipo) {
            console.error('❌ Não foi possível determinar o tipo do perfil');
            return;
        }
        
        if (perfisSelecionados.includes(perfilTipo)) {
            console.warn('⚠️ Perfil já está selecionado:', perfilTipo);
            setPerfilParaAdicionar(''); // Limpa a seleção mesmo assim
            return;
        }
        
        console.log('✅ Adicionando perfil:', perfilTipo);
        setPerfisSelecionados([...perfisSelecionados, perfilTipo]);
        setPerfilParaAdicionar(''); // Limpa o select após adicionar
        console.log('✅ Perfis selecionados atualizados:', [...perfisSelecionados, perfilTipo]);
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
        // Validações com mensagens mais específicas
        if (!nome || nome.trim().length < 3) {
            setErro('Nome é obrigatório e deve ter no mínimo 3 caracteres.');
            return;
        }

        if (!login || login.trim().length < 4) {
            setErro('Login é obrigatório e deve ter no mínimo 4 caracteres.');
            return;
        }

        if (!senha || senha.length < 6) {
            setErro('Senha é obrigatória e deve ter no mínimo 6 caracteres.');
            return;
        }

        const cpfLimpo = removerMascaraCpf(cpf);
        if (!cpfLimpo || cpfLimpo.length !== 11) {
            setErro('CPF é obrigatório e deve ter 11 caracteres (apenas números).');
            return;
        }

        // Validação de email (se fornecido)
        if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErro('Email deve ter um formato válido (exemplo: usuario@exemplo.com).');
            return;
        }

        // Validação de perfis
        if (perfisSelecionados.length === 0) {
            if (perfisDisponiveis.length === 0) {
                setErro('Nenhum perfil disponível. Por favor, cadastre um perfil primeiro ou use os templates disponíveis.');
            } else {
                setErro('Selecione pelo menos um perfil de acesso para o operador.');
            }
            return;
        }

        // Validação de unidades
        if (unidadesSelecionadas.length === 0) {
            if (unidadesDisponiveis.length === 0) {
                setErro('Nenhuma unidade de saúde disponível. Por favor, cadastre uma unidade primeiro.');
            } else {
                setErro('Selecione pelo menos uma unidade de saúde onde o operador pode atuar.');
            }
            return;
        }

        if (!unidadePrincipal) {
            setErro('Defina uma unidade principal para o operador (clique em "Definir como Principal" em uma das unidades selecionadas).');
            return;
        }

        setSalvando(true);
        setErro('');

        try {
            const operadorCriado = await operadoresService.criar({
                nome: nome.trim(),
                login: login.trim(),
                senha,
                cpf: cpfLimpo,
                email: email?.trim() || undefined,
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
            // Tratamento de erros mais específico
            let mensagemErro = 'Erro ao criar operador';
            
            if (error?.response?.data?.message) {
                mensagemErro = error.response.data.message;
            } else if (error?.message) {
                mensagemErro = error.message;
            } else if (typeof error === 'string') {
                mensagemErro = error;
            }
            
            setErro(mensagemErro);
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
                                    autoComplete="username"
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
                                    autoComplete="new-password"
                                />
                            </div>

                            <div>
                                <Label htmlFor="cpf">CPF *</Label>
                                <Input
                                    id="cpf"
                                    type="text"
                                    inputMode="numeric"
                                    value={cpf}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        // Aplica máscara 000.000.000-00 durante a digitação
                                        const maskedValue = aplicarMascaraCpf(inputValue);
                                        setCpf(maskedValue);
                                    }}
                                    onBlur={(e) => {
                                        // Garante que a máscara está aplicada mesmo ao perder o foco
                                        const inputValue = e.target.value;
                                        const maskedValue = aplicarMascaraCpf(inputValue);
                                        if (inputValue !== maskedValue) {
                                            setCpf(maskedValue);
                                        }
                                    }}
                                    onPaste={(e) => {
                                        // Previne o comportamento padrão e aplica a máscara
                                        e.preventDefault();
                                        const pastedText = e.clipboardData.getData('text');
                                        const maskedValue = aplicarMascaraCpf(pastedText);
                                        setCpf(maskedValue);
                                    }}
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                    autoComplete="off"
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
                        <div className="space-y-2">
                            <Label htmlFor="selecionar-perfil">Selecionar Perfil *</Label>
                            <div className="flex gap-2">
                                <Select 
                                    value={perfilParaAdicionar} 
                                    onValueChange={(value) => {
                                        console.log('🔍 Perfil selecionado no Select:', value);
                                        setPerfilParaAdicionar(value);
                                    }}
                                >
                                    <SelectTrigger id="selecionar-perfil" className="flex-1">
                                        <SelectValue placeholder={carregandoPerfis ? "Carregando perfis..." : "Selecione um perfil..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {carregandoPerfis ? (
                                            <div className="p-2 text-sm text-muted-foreground flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Carregando perfis...
                                            </div>
                                        ) : perfisDisponiveis.length === 0 ? (
                                            <div className="p-2 text-sm text-destructive">
                                                ⚠️ Nenhum perfil cadastrado. Use os templates acima ou crie um novo perfil.
                                            </div>
                                        ) : (
                                            perfisDisponiveis.map((perfil) => {
                                                // Usa o tipo do perfil como valor principal (compatível com backend)
                                                // Se não tiver tipo, usa o ID como fallback
                                                const valorItem = perfil.tipo || perfil.id?.toString() || `${perfil.nome}`;
                                                return (
                                                    <SelectItem 
                                                        key={perfil.id || valorItem} 
                                                        value={valorItem}
                                                    >
                                                        {perfil.nomeExibicao || perfil.nomeCustomizado || perfil.nome}
                                                        {perfil.tipo && (
                                                            <span className="text-xs text-muted-foreground ml-2">
                                                                ({perfil.tipo})
                                                            </span>
                                                        )}
                                                        {perfil.modulos && perfil.modulos.length > 0 && (
                                                            <span className="text-xs text-muted-foreground ml-2">
                                                                - {perfil.modulos.join(', ')}
                                                            </span>
                                                        )}
                                                    </SelectItem>
                                                );
                                            })
                                        )}
                                    </SelectContent>
                                </Select>
                                <Button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('🔍 Botão adicionar clicado, perfilParaAdicionar:', perfilParaAdicionar);
                                        adicionarPerfil();
                                    }} 
                                    disabled={!perfilParaAdicionar || carregandoPerfis}
                                    type="button"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        
                        {/* Mensagem de erro específica para perfis */}
                        {erro && erro.includes('perfis') && (
                            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-3">
                                <div className="font-medium mb-1">⚠️ Erro ao carregar perfis</div>
                                <div className="text-xs">{erro}</div>
                            </div>
                        )}

                        {/* Lista de perfis selecionados */}
                        <div className="border rounded">
                            {perfisSelecionados.length === 0 ? (
                                <div className="p-3 text-sm text-muted-foreground text-center">
                                    Nenhum perfil selecionado
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {perfisSelecionados.map((perfilTipo) => {
                                        const perfilInfo = perfisDisponiveis.find(p => 
                                            p.tipo === perfilTipo || p.id?.toString() === perfilTipo
                                        );
                                        return (
                                            <div key={perfilTipo} className="flex items-center justify-between px-3 py-2">
                                                <div>
                                                    <span className="font-medium text-sm">
                                                        {perfilInfo?.nomeExibicao || perfilInfo?.nomeCustomizado || perfilInfo?.nome || perfilTipo}
                                                    </span>
                                                    {perfilInfo?.tipo && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Tipo: {perfilInfo.tipo}
                                                        </div>
                                                    )}
                                                    {perfilInfo?.modulos && perfilInfo.modulos.length > 0 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Módulos: {perfilInfo.modulos.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removerPerfil(perfilTipo)}
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
                                    Carregando unidades de saúde...
                                </div>
                            ) : unidadesDisponiveis.length === 0 ? (
                                <div className="p-4 text-center text-sm text-destructive">
                                    ⚠️ Nenhuma unidade de saúde cadastrada no sistema.
                                    <div className="text-xs mt-2 text-muted-foreground">
                                        Por favor, cadastre uma unidade antes de criar operadores.
                                    </div>
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
