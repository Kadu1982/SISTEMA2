import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Settings, Save, RefreshCw, Database, Bell, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import apiService from "@/services/apiService";
import { toast } from "react-hot-toast";

interface ConfiguracaoHospitalar {
    sistemaMultiEstabelecimento: boolean;
    backupAutomatico: boolean;
    tempoExpiracaoSenha: number;
    protocoloClassificacao: 'HUMANIZA_SUS' | 'MANCHESTER' | 'INSTITUCIONAL';
    alertasLeitos: boolean;
    alertasFila: boolean;
    alertasSeguranca: boolean;
    limiteTempoEspera: number;
    emailNotificacoes: string;
    manterLogs: boolean;
    nivelLogSistema: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
    timeoutSessao: number;
    espacoDiscoLimite: number;
    backupRetencaoDias: number;
}

const defaultConfig: ConfiguracaoHospitalar = {
    sistemaMultiEstabelecimento: true,
    backupAutomatico: true,
    tempoExpiracaoSenha: 90,
    protocoloClassificacao: 'MANCHESTER',
    alertasLeitos: true,
    alertasFila: true,
    alertasSeguranca: true,
    limiteTempoEspera: 60,
    emailNotificacoes: '',
    manterLogs: true,
    nivelLogSistema: 'INFO',
    timeoutSessao: 30,
    espacoDiscoLimite: 85,
    backupRetencaoDias: 30
};

export default function ConfiguracoesPage() {
    const [config, setConfig] = useState<ConfiguracaoHospitalar>(defaultConfig);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        carregarConfiguracoes();
    }, []);

    const carregarConfiguracoes = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/hospitalar/configuracoes');
            setConfig(response.data?.data || defaultConfig);
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            toast.error('Erro ao carregar configurações. Usando padrões.');
            setConfig(defaultConfig);
        } finally {
            setLoading(false);
        }
    };

    const salvarConfiguracoes = async () => {
        try {
            setSaving(true);
            await apiService.put('/hospitalar/configuracoes', config);
            toast.success('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    const restaurarPadroes = () => {
        if (confirm('Tem certeza que deseja restaurar as configurações padrão? Esta ação não pode ser desfeita.')) {
            setConfig(defaultConfig);
            toast.success('Configurações restauradas para os padrões');
        }
    };

    const updateConfig = (key: keyof ConfiguracaoHospitalar, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Configurações Hospitalares</h1>
                    <p className="text-gray-600">Configurações gerais do módulo hospitalar</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2" onClick={restaurarPadroes}>
                        <RefreshCw className="h-4 w-4" />
                        Restaurar Padrões
                    </Button>
                    <Button className="flex items-center gap-2" onClick={salvarConfiguracoes} disabled={saving || loading}>
                        <Save className="h-4 w-4" />
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Configurações Gerais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Sistema Multi-Estabelecimento</div>
                                <div className="text-sm text-gray-600">
                                    Permite gestão de múltiplas unidades hospitalares
                                </div>
                            </div>
                            <Switch 
                                checked={config.sistemaMultiEstabelecimento}
                                onCheckedChange={(checked) => updateConfig('sistemaMultiEstabelecimento', checked)}
                                disabled={loading}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Backup Automático</div>
                                <div className="text-sm text-gray-600">
                                    Realiza backup diário dos dados automaticamente
                                </div>
                            </div>
                            <Switch 
                                checked={config.backupAutomatico}
                                onCheckedChange={(checked) => updateConfig('backupAutomatico', checked)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="font-medium">Tempo Expiração Senha (dias)</label>
                            <Input 
                                type="number" 
                                value={config.tempoExpiracaoSenha} 
                                onChange={(e) => updateConfig('tempoExpiracaoSenha', parseInt(e.target.value) || 90)}
                                className="w-24"
                                disabled={loading}
                            />
                            <div className="text-sm text-gray-600">
                                Dias para expiração de senhas de usuário
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-medium">Protocolo Classificação Padrão</label>
                            <select 
                                className="w-full p-2 border rounded"
                                value={config.protocoloClassificacao}
                                onChange={(e) => updateConfig('protocoloClassificacao', e.target.value as any)}
                                disabled={loading}
                            >
                                <option value="HUMANIZA_SUS">HumanizaSUS</option>
                                <option value="MANCHESTER">Manchester</option>
                                <option value="INSTITUCIONAL">Protocolo Institucional</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notificações e Alertas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Alertas de Leitos</div>
                                <div className="text-sm text-gray-600">
                                    Notifica quando leitos ficam disponíveis
                                </div>
                            </div>
                            <Switch 
                                checked={config.alertasLeitos}
                                onCheckedChange={(checked) => updateConfig('alertasLeitos', checked)}
                                disabled={loading}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Alertas de Fila</div>
                                <div className="text-sm text-gray-600">
                                    Notifica sobre filas com espera excessiva
                                </div>
                            </div>
                            <Switch 
                                checked={config.alertasFila}
                                onCheckedChange={(checked) => updateConfig('alertasFila', checked)}
                                disabled={loading}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Alertas de Segurança</div>
                                <div className="text-sm text-gray-600">
                                    Notifica sobre problemas de acesso
                                </div>
                            </div>
                            <Switch 
                                checked={config.alertasSeguranca}
                                onCheckedChange={(checked) => updateConfig('alertasSeguranca', checked)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="font-medium">Intervalo de Verificação (minutos)</label>
                            <Input type="number" defaultValue="5" className="w-24" />
                            <div className="text-sm text-gray-600">
                                Frequência de verificação dos alertas
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Segurança e Acesso
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Controle de Acesso Obrigatório</div>
                                <div className="text-sm text-gray-600">
                                    Exige registro para todos os visitantes
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Captura de Foto Obrigatória</div>
                                <div className="text-sm text-gray-600">
                                    Exige foto para visitantes e fornecedores
                                </div>
                            </div>
                            <Switch />
                        </div>

                        <div className="space-y-2">
                            <label className="font-medium">Horário Visitação Início</label>
                            <Input type="time" defaultValue="14:00" />
                        </div>

                        <div className="space-y-2">
                            <label className="font-medium">Horário Visitação Fim</label>
                            <Input type="time" defaultValue="20:00" />
                        </div>

                        <div className="space-y-2">
                            <label className="font-medium">Limite Visitantes por Paciente</label>
                            <Input type="number" defaultValue="2" className="w-24" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Banco de Dados
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded">
                                <div>
                                    <div className="font-medium">Tamanho do Banco</div>
                                    <div className="text-sm text-gray-600">
                                        Espaço usado pelo módulo hospitalar
                                    </div>
                                </div>
                                <Badge variant="outline">2.5 GB</Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded">
                                <div>
                                    <div className="font-medium">Último Backup</div>
                                    <div className="text-sm text-gray-600">
                                        Data do último backup realizado
                                    </div>
                                </div>
                                <Badge variant="secondary">Hoje, 03:00</Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded">
                                <div>
                                    <div className="font-medium">Status Conexão</div>
                                    <div className="text-sm text-gray-600">
                                        Estado da conexão com o banco
                                    </div>
                                </div>
                                <Badge variant="default" className="bg-green-600">
                                    Conectado
                                </Badge>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                                Realizar Backup
                            </Button>
                            <Button variant="outline" className="flex-1">
                                Otimizar BD
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Parâmetros Avançados</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { param: 'TEMPO_LIMITE_TRIAGEM', valor: '30', descricao: 'Tempo limite para triagem (minutos)' },
                            { param: 'MAX_SENHAS_POR_FILA', valor: '999', descricao: 'Máximo de senhas por fila' },
                            { param: 'INTERVALO_LIMPEZA_LEITO', valor: '60', descricao: 'Intervalo para limpeza de leito (minutos)' },
                            { param: 'TEMPO_MAXIMO_VISITA', valor: '240', descricao: 'Tempo máximo de visita (minutos)' },
                            { param: 'BACKUP_RETENCAO_DIAS', valor: '30', descricao: 'Dias de retenção dos backups' },
                            { param: 'LOG_NIVEL_DETALHAMENTO', valor: 'INFO', descricao: 'Nível de detalhamento dos logs' }
                        ].map((config, index) => (
                            <div key={index} className="p-3 border rounded space-y-2">
                                <div className="font-medium text-sm">{config.param}</div>
                                <Input value={config.valor} className="text-sm" />
                                <div className="text-xs text-gray-600">{config.descricao}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}