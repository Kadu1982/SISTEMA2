import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Heart, Thermometer, Activity, Plus, User } from "lucide-react";
import { useState, useEffect } from "react";
import apiService from "@/services/apiService";
import { toast } from "react-hot-toast";

interface ClassificacaoRisco {
    id: number;
    pacienteNome: string;
    pacienteCpf: string;
    cor: 'VERMELHO' | 'LARANJA' | 'AMARELO' | 'VERDE' | 'AZUL';
    protocolo: string;
    sintomas: string[];
    sinaisVitais: {
        pressaoArterial: string;
        frequenciaCardiaca: number;
        temperatura: number;
        saturacaoOxigenio: number;
    };
    timestamp: string;
    operadorNome: string;
}

interface EstatisticasTriagem {
    emergencia: number;      // Vermelho
    muitoUrgente: number;    // Laranja  
    urgente: number;         // Amarelo
    poucoUrgente: number;    // Verde
    naoUrgente: number;      // Azul
}

export default function TriagemPage() {
    const [classificacoes, setClassificacoes] = useState<ClassificacaoRisco[]>([]);
    const [estatisticas, setEstatisticas] = useState<EstatisticasTriagem>({
        emergencia: 0, muitoUrgente: 0, urgente: 0, poucoUrgente: 0, naoUrgente: 0
    });
    const [loading, setLoading] = useState(true);
    const [showNovaClassificacao, setShowNovaClassificacao] = useState(false);
    const [novaClassificacao, setNovaClassificacao] = useState({
        pacienteNome: '', pacienteCpf: '', sintomas: '', 
        pressaoArterial: '', frequenciaCardiaca: '', temperatura: '', saturacaoOxigenio: ''
    });

    useEffect(() => {
        carregarClassificacoes();
        carregarEstatisticas();
    }, []);

    const carregarClassificacoes = async () => {
        try {
            const response = await apiService.get('/hospitalar/classificacao-risco');
            setClassificacoes(response.data?.data || []);
        } catch (error) {
            console.error('Erro ao carregar classificações:', error);
            // Mock data para demonstração
            setClassificacoes([
                {
                    id: 1, pacienteNome: 'João Silva', pacienteCpf: '123.456.789-00',
                    cor: 'VERMELHO', protocolo: 'Manchester', sintomas: ['Dor no peito', 'Falta de ar'],
                    sinaisVitais: { pressaoArterial: '160/100', frequenciaCardiaca: 110, temperatura: 37.2, saturacaoOxigenio: 92 },
                    timestamp: '2023-12-01T14:30:00', operadorNome: 'Enf. Maria Santos'
                },
                {
                    id: 2, pacienteNome: 'Ana Costa', pacienteCpf: '987.654.321-00',
                    cor: 'AMARELO', protocolo: 'Manchester', sintomas: ['Febre', 'Cefaléia'],
                    sinaisVitais: { pressaoArterial: '120/80', frequenciaCardiaca: 88, temperatura: 38.5, saturacaoOxigenio: 97 },
                    timestamp: '2023-12-01T14:45:00', operadorNome: 'Enf. Pedro Lima'
                }
            ]);
        }
    };

    const carregarEstatisticas = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/hospitalar/classificacao-risco/estatisticas');
            setEstatisticas(response.data?.data || {});
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            // Mock stats baseado nos dados exemplo
            setTimeout(() => {
                setEstatisticas({
                    emergencia: 2,
                    muitoUrgente: 5, 
                    urgente: 12,
                    poucoUrgente: 8,
                    naoUrgente: 15
                });
            }, 500);
        } finally {
            setLoading(false);
        }
    };

    const handleNovaClassificacao = async () => {
        if (!novaClassificacao.pacienteNome.trim() || !novaClassificacao.pacienteCpf.trim()) {
            toast.error('Nome e CPF do paciente são obrigatórios');
            return;
        }

        try {
            await apiService.post('/hospitalar/classificacao-risco', {
                ...novaClassificacao,
                sintomas: novaClassificacao.sintomas.split(',').map(s => s.trim()).filter(s => s),
                sinaisVitais: {
                    pressaoArterial: novaClassificacao.pressaoArterial,
                    frequenciaCardiaca: parseInt(novaClassificacao.frequenciaCardiaca) || 0,
                    temperatura: parseFloat(novaClassificacao.temperatura) || 0,
                    saturacaoOxigenio: parseInt(novaClassificacao.saturacaoOxigenio) || 0
                }
            });
            toast.success('Classificação de risco criada com sucesso!');
            setShowNovaClassificacao(false);
            setNovaClassificacao({
                pacienteNome: '', pacienteCpf: '', sintomas: '',
                pressaoArterial: '', frequenciaCardiaca: '', temperatura: '', saturacaoOxigenio: ''
            });
            carregarClassificacoes();
            carregarEstatisticas();
        } catch (error) {
            console.error('Erro ao criar classificação:', error);
            toast.error('Erro ao criar classificação de risco');
        }
    };

    const getCorClassificacao = (cor: string) => {
        switch (cor) {
            case 'VERMELHO': return 'text-red-600 bg-red-50 border-red-200';
            case 'LARANJA': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'AMARELO': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'VERDE': return 'text-green-600 bg-green-50 border-green-200';
            case 'AZUL': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Classificação de Risco</h1>
                    <p className="text-gray-600">Triagem e classificação de pacientes por protocolo</p>
                </div>
                <Button className="flex items-center gap-2" onClick={() => setShowNovaClassificacao(true)}>
                    <AlertTriangle className="h-4 w-4" />
                    Nova Classificação
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Emergência</CardTitle>
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : estatisticas.emergencia}</div>
                        <p className="text-xs text-muted-foreground">Atendimento imediato</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Muito Urgente</CardTitle>
                        <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : estatisticas.muitoUrgente}</div>
                        <p className="text-xs text-muted-foreground">Até 10 minutos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Urgente</CardTitle>
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : estatisticas.urgente}</div>
                        <p className="text-xs text-muted-foreground">Até 60 minutos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pouco Urgente</CardTitle>
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : estatisticas.poucoUrgente}</div>
                        <p className="text-xs text-muted-foreground">Até 120 minutos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Não Urgente</CardTitle>
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : estatisticas.naoUrgente}</div>
                        <p className="text-xs text-muted-foreground">Até 240 minutos</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Protocolos de Classificação</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded">
                            <div>
                                <div className="font-medium">Protocolo Manchester</div>
                                <div className="text-sm text-gray-600">Sistema internacional de triagem</div>
                            </div>
                            <Badge variant="secondary">Ativo</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                            <div>
                                <div className="font-medium">HumanizaSUS</div>
                                <div className="text-sm text-gray-600">Protocolo do Ministério da Saúde</div>
                            </div>
                            <Badge variant="outline">Disponível</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                            <div>
                                <div className="font-medium">Protocolo Institucional</div>
                                <div className="text-sm text-gray-600">Protocolo customizado da unidade</div>
                            </div>
                            <Badge variant="outline">Configurar</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sinais Vitais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 p-3 border rounded">
                                <Heart className="h-5 w-5 text-red-500" />
                                <div>
                                    <div className="text-sm text-gray-600">Pressão Arterial</div>
                                    <div className="font-medium">120/80 mmHg</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 border rounded">
                                <Activity className="h-5 w-5 text-blue-500" />
                                <div>
                                    <div className="text-sm text-gray-600">Frequência Cardíaca</div>
                                    <div className="font-medium">72 bpm</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 border rounded">
                                <Thermometer className="h-5 w-5 text-orange-500" />
                                <div>
                                    <div className="text-sm text-gray-600">Temperatura</div>
                                    <div className="font-medium">36.5°C</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 border rounded">
                                <Activity className="h-5 w-5 text-green-500" />
                                <div>
                                    <div className="text-sm text-gray-600">Saturação O2</div>
                                    <div className="font-medium">98%</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pacientes em Triagem</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Carregando classificações...</p>
                        </div>
                    ) : classificacoes.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>Nenhum paciente em triagem no momento.</p>
                            <Button 
                                className="mt-4"
                                onClick={() => setShowNovaClassificacao(true)}
                            >
                                Realizar primeira classificação
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {classificacoes.map((classificacao) => (
                                <div key={classificacao.id} className={`p-4 border rounded-lg ${getCorClassificacao(classificacao.cor)}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="font-medium flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                {classificacao.pacienteNome}
                                            </h3>
                                            <p className="text-sm opacity-75">CPF: {classificacao.pacienteCpf}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge className={`${getCorClassificacao(classificacao.cor)} border`}>
                                                {classificacao.cor}
                                            </Badge>
                                            <p className="text-xs opacity-75 mt-1">{classificacao.protocolo}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Heart className="h-3 w-3" />
                                            <span>{classificacao.sinaisVitais.pressaoArterial}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Activity className="h-3 w-3" />
                                            <span>{classificacao.sinaisVitais.frequenciaCardiaca} bpm</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Thermometer className="h-3 w-3" />
                                            <span>{classificacao.sinaisVitais.temperatura}°C</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Activity className="h-3 w-3" />
                                            <span>{classificacao.sinaisVitais.saturacaoOxigenio}%</span>
                                        </div>
                                    </div>
                                    
                                    {classificacao.sintomas.length > 0 && (
                                        <div className="mt-2 text-sm">
                                            <span className="font-medium">Sintomas: </span>
                                            {classificacao.sintomas.join(', ')}
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center mt-3 text-xs opacity-75">
                                        <span>Por: {classificacao.operadorNome}</span>
                                        <span>{new Date(classificacao.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal Nova Classificação */}
            {showNovaClassificacao && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-medium mb-4">Nova Classificação de Risco</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nome do Paciente</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-md"
                                        value={novaClassificacao.pacienteNome}
                                        onChange={(e) => setNovaClassificacao(prev => ({...prev, pacienteNome: e.target.value}))}
                                        placeholder="Nome completo do paciente"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">CPF</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-md"
                                        value={novaClassificacao.pacienteCpf}
                                        onChange={(e) => setNovaClassificacao(prev => ({...prev, pacienteCpf: e.target.value}))}
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Sintomas</label>
                                <textarea
                                    className="w-full p-2 border rounded-md"
                                    rows={3}
                                    value={novaClassificacao.sintomas}
                                    onChange={(e) => setNovaClassificacao(prev => ({...prev, sintomas: e.target.value}))}
                                    placeholder="Descreva os sintomas separados por vírgula"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Pressão Arterial</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-md"
                                        value={novaClassificacao.pressaoArterial}
                                        onChange={(e) => setNovaClassificacao(prev => ({...prev, pressaoArterial: e.target.value}))}
                                        placeholder="120/80"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Freq. Cardíaca</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-md"
                                        value={novaClassificacao.frequenciaCardiaca}
                                        onChange={(e) => setNovaClassificacao(prev => ({...prev, frequenciaCardiaca: e.target.value}))}
                                        placeholder="72"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Temperatura</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full p-2 border rounded-md"
                                        value={novaClassificacao.temperatura}
                                        onChange={(e) => setNovaClassificacao(prev => ({...prev, temperatura: e.target.value}))}
                                        placeholder="36.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sat. O2</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-md"
                                        value={novaClassificacao.saturacaoOxigenio}
                                        onChange={(e) => setNovaClassificacao(prev => ({...prev, saturacaoOxigenio: e.target.value}))}
                                        placeholder="98"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setShowNovaClassificacao(false);
                                    setNovaClassificacao({
                                        pacienteNome: '', pacienteCpf: '', sintomas: '',
                                        pressaoArterial: '', frequenciaCardiaca: '', temperatura: '', saturacaoOxigenio: ''
                                    });
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleNovaClassificacao}>
                                Criar Classificação
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}