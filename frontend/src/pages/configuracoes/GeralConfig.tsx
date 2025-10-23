import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, RefreshCw, Download, Upload, Settings, Clock, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConfiguracaoService, { Configuracao } from '@/services/ConfiguracaoService';

interface ConfiguracaoFormulario extends Configuracao {
    valorOriginal?: string;
    modificada?: boolean;
}

const GeralConfig: React.FC = () => {
    const [configuracoes, setConfiguracoes] = useState<ConfiguracaoFormulario[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [grupoSelecionado, setGrupoSelecionado] = useState<string>('GERAL');
    const [grupos, setGrupos] = useState<string[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        carregarDados();
    }, []);

    useEffect(() => {
        if (grupoSelecionado) {
            carregarConfiguracoesPorGrupo(grupoSelecionado);
        }
    }, [grupoSelecionado]);

    const carregarDados = async () => {
        try {
            setCarregando(true);

            // Por enquanto, definimos grupos estáticos até o backend estar atualizado
            const gruposEstaticos = ['GERAL', 'BACKUP', 'EMAIL', 'SEGURANCA', 'INTEGRACOES', 'RELATORIOS', 'NOTIFICACOES'];
            setGrupos(gruposEstaticos);

            // Carrega configurações do grupo inicial
            if (grupoSelecionado) {
                await carregarConfiguracoesPorGrupo(grupoSelecionado);
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            toast({
                title: 'Erro',
                description: 'Falha ao carregar configurações',
                variant: 'destructive'
            });
        } finally {
            setCarregando(false);
        }
    };

    const carregarConfiguracoesPorGrupo = async (grupo: string) => {
        try {
            const configs = await ConfiguracaoService.listarConfiguracoesPorGrupo(grupo);
            const configsComEstado = configs.map(config => ({
                ...config,
                valorOriginal: config.valor,
                modificada: false
            }));
            setConfiguracoes(configsComEstado);
        } catch (error) {
            console.error('Erro ao carregar configurações do grupo:', error);
        }
    };

    const atualizarValor = (chave: string, novoValor: string) => {
        setConfiguracoes(prev => prev.map(config => {
            if (config.chave === chave) {
                const modificada = novoValor !== config.valorOriginal;
                return {
                    ...config,
                    valor: novoValor,
                    modificada
                };
            }
            return config;
        }));
    };

    const salvarConfiguracoes = async () => {
        const configuracoesModificadas = configuracoes.filter(c => c.modificada);
        if (configuracoesModificadas.length === 0) {
            toast({
                title: 'Nenhuma alteração',
                description: 'Não há configurações modificadas para salvar',
                variant: 'default'
            });
            return;
        }

        try {
            setSalvando(true);

            for (const config of configuracoesModificadas) {
                await ConfiguracaoService.atualizarConfiguracao(config.chave, config);
            }

            // Atualiza o estado local
            setConfiguracoes(prev => prev.map(config => ({
                ...config,
                valorOriginal: config.valor,
                modificada: false
            })));

            toast({
                title: 'Sucesso',
                description: `${configuracoesModificadas.length} configuração(ões) salva(s) com sucesso`,
                variant: 'default'
            });
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            toast({
                title: 'Erro',
                description: 'Falha ao salvar configurações',
                variant: 'destructive'
            });
        } finally {
            setSalvando(false);
        }
    };

    const fazerBackup = async () => {
        try {
            const backupData = await ConfiguracaoService.fazerBackup();
            const blob = new Blob([JSON.stringify(backupData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-configuracoes-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({
                title: 'Backup realizado',
                description: 'Arquivo de backup baixado com sucesso',
                variant: 'default'
            });
        } catch (error) {
            console.error('Erro ao fazer backup:', error);
            toast({
                title: 'Erro',
                description: 'Falha ao gerar backup',
                variant: 'destructive'
            });
        }
    };

    const renderizarCampo = (config: ConfiguracaoFormulario) => {
        const { chave, valor, tipo, descricao, editavel, valoresPossiveis } = config;

        if (!editavel) {
            return (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">{chave}</Label>
                    <Input value={valor || ''} disabled className="bg-gray-50" />
                    <p className="text-xs text-muted-foreground">{descricao}</p>
                </div>
            );
        }

        const handleChange = (novoValor: string) => {
            atualizarValor(chave, novoValor);
        };

        switch (tipo) {
            case 'boolean':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={valor === 'true'}
                                onCheckedChange={(checked) => handleChange(checked.toString())}
                            />
                            <Label className="text-sm font-medium">{chave}</Label>
                            {config.modificada && <Badge variant="outline" className="text-xs">Modificado</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{descricao}</p>
                    </div>
                );

            case 'select':
            case 'enum':
                const opcoes = valoresPossiveis?.split(',') || [];
                return (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Label className="text-sm font-medium">{chave}</Label>
                            {config.modificada && <Badge variant="outline" className="text-xs">Modificado</Badge>}
                        </div>
                        <Select value={valor || ''} onValueChange={handleChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma opção" />
                            </SelectTrigger>
                            <SelectContent>
                                {opcoes.map(opcao => (
                                    <SelectItem key={opcao} value={opcao.trim()}>
                                        {opcao.trim()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">{descricao}</p>
                    </div>
                );

            case 'text':
            case 'textarea':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Label className="text-sm font-medium">{chave}</Label>
                            {config.modificada && <Badge variant="outline" className="text-xs">Modificado</Badge>}
                        </div>
                        <Textarea
                            value={valor || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            rows={3}
                            placeholder={descricao}
                        />
                        <p className="text-xs text-muted-foreground">{descricao}</p>
                    </div>
                );

            case 'password':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Label className="text-sm font-medium">{chave}</Label>
                            {config.modificada && <Badge variant="outline" className="text-xs">Modificado</Badge>}
                        </div>
                        <Input
                            type="password"
                            value={valor || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder={descricao}
                        />
                        <p className="text-xs text-muted-foreground">{descricao}</p>
                    </div>
                );

            case 'number':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Label className="text-sm font-medium">{chave}</Label>
                            {config.modificada && <Badge variant="outline" className="text-xs">Modificado</Badge>}
                        </div>
                        <Input
                            type="number"
                            value={valor || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder={descricao}
                        />
                        <p className="text-xs text-muted-foreground">{descricao}</p>
                    </div>
                );

            case 'email':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Label className="text-sm font-medium">{chave}</Label>
                            {config.modificada && <Badge variant="outline" className="text-xs">Modificado</Badge>}
                        </div>
                        <Input
                            type="email"
                            value={valor || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder={descricao}
                        />
                        <p className="text-xs text-muted-foreground">{descricao}</p>
                    </div>
                );

            case 'url':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Label className="text-sm font-medium">{chave}</Label>
                            {config.modificada && <Badge variant="outline" className="text-xs">Modificado</Badge>}
                        </div>
                        <Input
                            type="url"
                            value={valor || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder={descricao}
                        />
                        <p className="text-xs text-muted-foreground">{descricao}</p>
                    </div>
                );

            case 'time':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Label className="text-sm font-medium">{chave}</Label>
                            {config.modificada && <Badge variant="outline" className="text-xs">Modificado</Badge>}
                        </div>
                        <Input
                            type="time"
                            value={valor || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder={descricao}
                        />
                        <p className="text-xs text-muted-foreground">{descricao}</p>
                    </div>
                );

            default:
                return (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Label className="text-sm font-medium">{chave}</Label>
                            {config.modificada && <Badge variant="outline" className="text-xs">Modificado</Badge>}
                        </div>
                        <Input
                            value={valor || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder={descricao}
                        />
                        <p className="text-xs text-muted-foreground">{descricao}</p>
                    </div>
                );
        }
    };

    const getIconeGrupo = (grupo: string) => {
        switch (grupo) {
            case 'GERAL': return <Settings className="h-4 w-4" />;
            case 'BACKUP': return <Download className="h-4 w-4" />;
            case 'EMAIL': return <Globe className="h-4 w-4" />;
            case 'SEGURANCA': return <Settings className="h-4 w-4" />;
            case 'INTEGRACOES': return <Settings className="h-4 w-4" />;
            case 'RELATORIOS': return <Settings className="h-4 w-4" />;
            case 'NOTIFICACOES': return <Clock className="h-4 w-4" />;
            default: return <Settings className="h-4 w-4" />;
        }
    };

    const configuracoesModificadas = configuracoes.filter(c => c.modificada).length;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configurações Gerais do Sistema
                    </CardTitle>
                    <CardDescription>
                        Gerencie as configurações básicas e específicas do sistema por categoria.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Seletor de Grupo */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="space-y-2">
                            <Label>Categoria de Configurações</Label>
                            <Select value={grupoSelecionado} onValueChange={setGrupoSelecionado}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Selecione um grupo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {grupos.map(grupo => (
                                        <SelectItem key={grupo} value={grupo}>
                                            <div className="flex items-center gap-2">
                                                {getIconeGrupo(grupo)}
                                                {grupo}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={carregarDados}
                                disabled={carregando}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${carregando ? 'animate-spin' : ''}`} />
                                Recarregar
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fazerBackup}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Backup
                            </Button>
                            {configuracoesModificadas > 0 && (
                                <Button
                                    onClick={salvarConfiguracoes}
                                    disabled={salvando}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Save className={`h-4 w-4 mr-2 ${salvando ? 'animate-spin' : ''}`} />
                                    Salvar ({configuracoesModificadas})
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Lista de Configurações */}
                    {carregando ? (
                        <div className="text-center py-8">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                            <p>Carregando configurações...</p>
                        </div>
                    ) : configuracoes.length === 0 ? (
                        <div className="text-center py-8">
                            <Settings className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                Nenhuma configuração encontrada para o grupo selecionado
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {configuracoes.map(config => (
                                <Card key={config.chave} className={config.modificada ? 'border-orange-200 bg-orange-50' : ''}>
                                    <CardContent className="pt-6">
                                        {renderizarCampo(config)}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default GeralConfig;