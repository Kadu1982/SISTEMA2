import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Volume2, Settings, Fullscreen, Play, Pause } from "lucide-react";
import { useState, useEffect } from "react";
import apiService from "@/services/apiService";
import { toast } from "react-hot-toast";

interface SenhaChamada {
    id: number;
    numero: string;
    fila: string;
    consultorio?: string;
    status: 'AGUARDANDO' | 'CHAMANDO' | 'ATENDENDO' | 'FINALIZADA';
    timestampChamada?: string;
}

export default function PainelPage() {
    const [senhaAtual, setSenhaAtual] = useState<SenhaChamada | null>(null);
    const [filaProximas, setFilaProximas] = useState<SenhaChamada[]>([]);
    const [pausado, setPausado] = useState(false);
    const [loading, setLoading] = useState(true);
    const [consultorioAtual, setConsultorioAtual] = useState('CONSULTÓRIO 1');

    useEffect(() => {
        carregarFilaChamadas();
        const interval = setInterval(carregarFilaChamadas, 5000); // Atualiza a cada 5 segundos
        return () => clearInterval(interval);
    }, []);

    const carregarFilaChamadas = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/hospitalar/senhas/fila');
            const senhas = response.data?.data || [];
            
            const atual = senhas.find((s: SenhaChamada) => s.status === 'CHAMANDO');
            const proximas = senhas.filter((s: SenhaChamada) => s.status === 'AGUARDANDO').slice(0, 3);
            
            setSenhaAtual(atual || null);
            setFilaProximas(proximas);
        } catch (error) {
            console.error('Erro ao carregar fila de chamadas:', error);
            // Mock data para demonstração
            setSenhaAtual({ id: 1, numero: 'CM001', fila: 'Consultas', consultorio: 'CONSULTÓRIO 1', status: 'CHAMANDO' });
            setFilaProximas([
                { id: 2, numero: 'CM002', fila: 'Consultas', status: 'AGUARDANDO' },
                { id: 3, numero: 'CM003', fila: 'Consultas', status: 'AGUARDANDO' },
                { id: 4, numero: 'CM004', fila: 'Consultas', status: 'AGUARDANDO' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const chamarProximaSenha = async () => {
        if (pausado) {
            toast.error('Sistema pausado. Reative para continuar.');
            return;
        }

        try {
            const proximaSenha = filaProximas[0];
            if (!proximaSenha) {
                toast.info('Não há senhas na fila');
                return;
            }

            await apiService.post('/hospitalar/senhas/chamar', {
                senhaId: proximaSenha.id,
                consultorio: consultorioAtual
            });

            toast.success(`Senha ${proximaSenha.numero} chamada!`);
            carregarFilaChamadas();
            
            // Simular chamada sonora
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(
                    `Senha ${proximaSenha.numero}, dirija-se ao ${consultorioAtual}`
                );
                utterance.lang = 'pt-BR';
                speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.error('Erro ao chamar próxima senha:', error);
            toast.error('Erro ao chamar próxima senha');
        }
    };

    const repetirChamada = async () => {
        if (!senhaAtual) {
            toast.error('Nenhuma senha está sendo chamada no momento');
            return;
        }

        try {
            await apiService.post('/hospitalar/senhas/repetir', {
                senhaId: senhaAtual.id
            });

            toast.success(`Chamada repetida: ${senhaAtual.numero}`);
            
            // Repetir chamada sonora
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(
                    `Senha ${senhaAtual.numero}, dirija-se ao ${senhaAtual.consultorio || consultorioAtual}`
                );
                utterance.lang = 'pt-BR';
                speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.error('Erro ao repetir chamada:', error);
            toast.error('Erro ao repetir chamada');
        }
    };

    const alternarPausa = () => {
        setPausado(!pausado);
        toast.success(pausado ? 'Sistema reativado' : 'Sistema pausado');
    };

    const entrarTelaCheia = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
        toast.success('Modo tela cheia ativado');
    };
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Painel de Chamadas</h1>
                    <p className="text-gray-600">Sistema de chamadas eletrônicas para pacientes</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => toast.info('Configurações em desenvolvimento')}>
                        <Settings className="h-4 w-4" />
                        Configurar
                    </Button>
                    <Button className="flex items-center gap-2" onClick={entrarTelaCheia}>
                        <Fullscreen className="h-4 w-4" />
                        Tela Cheia
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Painel Principal */}
                <div className="lg:col-span-2">
                    <Card className="h-96">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Monitor className="h-5 w-5" />
                                Painel Principal de Chamadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-full">
                            {loading ? (
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <div className="text-xl text-gray-600">Carregando...</div>
                                </div>
                            ) : senhaAtual ? (
                                <div className="text-center">
                                    <div className="text-6xl font-bold text-blue-600 mb-4">{senhaAtual.numero}</div>
                                    <div className="text-2xl text-gray-600 mb-2">Dirija-se ao</div>
                                    <div className="text-4xl font-semibold text-green-600">
                                        {senhaAtual.consultorio || consultorioAtual}
                                    </div>
                                    {pausado && (
                                        <div className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                                            <Pause className="inline h-4 w-4 mr-2" />
                                            Sistema Pausado
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <Monitor className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <div className="text-xl">Aguardando próxima chamada</div>
                                    <div className="text-sm mt-2">
                                        {filaProximas.length > 0 
                                            ? `${filaProximas.length} senhas na fila` 
                                            : 'Nenhuma senha na fila'
                                        }
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Controles */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Controles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button 
                                className="w-full" 
                                size="lg" 
                                onClick={chamarProximaSenha}
                                disabled={loading || filaProximas.length === 0}
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Chamar Próxima Senha
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full flex items-center gap-2"
                                onClick={repetirChamada}
                                disabled={!senhaAtual}
                            >
                                <Volume2 className="h-4 w-4" />
                                Repetir Chamada
                            </Button>
                            <Button 
                                variant={pausado ? "default" : "secondary"} 
                                className="w-full flex items-center gap-2"
                                onClick={alternarPausa}
                            >
                                {pausado ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                {pausado ? 'Reativar Sistema' : 'Pausar Chamadas'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Fila Atual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="text-sm text-gray-600">
                                    Próximas senhas: {filaProximas.length > 0 ? `(${filaProximas.length})` : '(0)'}
                                </div>
                                {loading ? (
                                    <div className="text-center p-4 text-gray-500">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
                                        Carregando...
                                    </div>
                                ) : filaProximas.length > 0 ? (
                                    <div className="space-y-1">
                                        {filaProximas.map((senha, index) => (
                                            <div 
                                                key={senha.id} 
                                                className={`p-2 rounded ${index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">{senha.numero}</span>
                                                    <span className="text-xs text-gray-500">{senha.fila}</span>
                                                </div>
                                                {index === 0 && (
                                                    <div className="text-xs text-yellow-600 mt-1">Próxima</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-4 text-gray-500">
                                        <div className="text-sm">Nenhuma senha na fila</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configuração de Painéis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-8 text-gray-500">
                        <Monitor className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>Configure painéis de chamada para diferentes setores.</p>
                        <p className="text-sm">Use a API: /api/hospitalar/paineis</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}