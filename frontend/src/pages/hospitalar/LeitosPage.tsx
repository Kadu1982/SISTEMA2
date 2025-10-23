import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, UserCheck, AlertCircle, Clock, MapPin, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import apiService from "@/services/apiService";
import { toast } from "react-hot-toast";

interface Leito {
    id: number;
    numero: string;
    andar: string;
    enfermaria: string;
    status: 'DISPONIVEL' | 'OCUPADO' | 'LIMPEZA' | 'INTERDITADO' | 'RESERVADO';
    pacienteNome?: string;
    tempoOcupacao?: string;
    observacoes?: string;
}

interface EstatisticasLeitos {
    total: number;
    disponivel: number;
    ocupado: number;
    limpeza: number;
    interditado: number;
    reservado: number;
}

export default function LeitosPage() {
    const [leitos, setLeitos] = useState<Leito[]>([]);
    const [estatisticas, setEstatisticas] = useState<EstatisticasLeitos>({
        total: 0, disponivel: 0, ocupado: 0, limpeza: 0, interditado: 0, reservado: 0
    });
    const [loading, setLoading] = useState(true);
    const [showNovoLeito, setShowNovoLeito] = useState(false);
    const [novoLeito, setNovoLeito] = useState({ numero: '', andar: '', enfermaria: '' });

    useEffect(() => {
        carregarLeitos();
        carregarEstatisticas();
    }, []);

    const carregarLeitos = async () => {
        try {
            const response = await apiService.get('/hospitalar/leitos');
            setLeitos(response.data?.data || []);
        } catch (error) {
            console.error('Erro ao carregar leitos:', error);
            // Mock data para demonstração
            setLeitos([
                { id: 1, numero: '101', andar: '1º Andar', enfermaria: 'Clínica Médica', status: 'OCUPADO', pacienteNome: 'João Silva', tempoOcupacao: '2h 30m' },
                { id: 2, numero: '102', andar: '1º Andar', enfermaria: 'Clínica Médica', status: 'DISPONIVEL' },
                { id: 3, numero: '103', andar: '1º Andar', enfermaria: 'Clínica Médica', status: 'LIMPEZA', tempoOcupacao: '45m' },
                { id: 4, numero: '201', andar: '2º Andar', enfermaria: 'Cirurgia', status: 'OCUPADO', pacienteNome: 'Maria Santos', tempoOcupacao: '1h 15m' },
                { id: 5, numero: '202', andar: '2º Andar', enfermaria: 'Cirurgia', status: 'DISPONIVEL' },
                { id: 6, numero: '301', andar: '3º Andar', enfermaria: 'UTI', status: 'INTERDITADO', observacoes: 'Manutenção elétrica' },
            ]);
        }
    };

    const carregarEstatisticas = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/hospitalar/leitos/estatisticas?unidadeId=1');
            setEstatisticas(response.data?.data || {});
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            // Calcular estatísticas dos dados mock
            setTimeout(() => {
                const mockStats = {
                    total: 6,
                    disponivel: 2,
                    ocupado: 2,
                    limpeza: 1,
                    interditado: 1,
                    reservado: 0
                };
                setEstatisticas(mockStats);
            }, 500);
        } finally {
            setLoading(false);
        }
    };

    const handleNovoLeito = async () => {
        if (!novoLeito.numero.trim()) {
            toast.error('Número do leito é obrigatório');
            return;
        }

        try {
            await apiService.post('/hospitalar/leitos', novoLeito);
            toast.success('Leito criado com sucesso!');
            setShowNovoLeito(false);
            setNovoLeito({ numero: '', andar: '', enfermaria: '' });
            carregarLeitos();
            carregarEstatisticas();
        } catch (error) {
            console.error('Erro ao criar leito:', error);
            toast.error('Erro ao criar leito');
        }
    };

    const ocuparLeito = async (leitoId: number) => {
        const pacienteNome = prompt('Nome do paciente:');
        if (!pacienteNome) return;

        try {
            await apiService.put(`/hospitalar/leitos/${leitoId}/ocupar`, { pacienteNome });
            toast.success('Leito ocupado com sucesso!');
            carregarLeitos();
            carregarEstatisticas();
        } catch (error) {
            console.error('Erro ao ocupar leito:', error);
            toast.error('Erro ao ocupar leito');
        }
    };

    const liberarLeito = async (leitoId: number) => {
        const motivo = prompt('Motivo da liberação:');
        try {
            await apiService.put(`/hospitalar/leitos/${leitoId}/liberar`, { motivo });
            toast.success('Leito liberado com sucesso!');
            carregarLeitos();
            carregarEstatisticas();
        } catch (error) {
            console.error('Erro ao liberar leito:', error);
            toast.error('Erro ao liberar leito');
        }
    };

    const finalizarLimpeza = async (leitoId: number) => {
        try {
            await apiService.put(`/hospitalar/leitos/${leitoId}/finalizar-limpeza`);
            toast.success('Limpeza finalizada com sucesso!');
            carregarLeitos();
            carregarEstatisticas();
        } catch (error) {
            console.error('Erro ao finalizar limpeza:', error);
            toast.error('Erro ao finalizar limpeza');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DISPONIVEL': return 'bg-green-100 text-green-800';
            case 'OCUPADO': return 'bg-red-100 text-red-800';
            case 'LIMPEZA': return 'bg-yellow-100 text-yellow-800';
            case 'INTERDITADO': return 'bg-gray-100 text-gray-800';
            case 'RESERVADO': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Gestão de Leitos</h1>
                    <p className="text-gray-600">Controle de ocupação e status dos leitos hospitalares</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                        <AlertCircle className="h-4 w-4" />
                        Interditar Leito
                    </Button>
                    <Button className="flex items-center gap-2" onClick={() => setShowNovoLeito(true)}>
                        <Bed className="h-4 w-4" />
                        Novo Leito
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leitos</CardTitle>
                        <Bed className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : estatisticas.total}</div>
                        <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : estatisticas.disponivel}</div>
                        <p className="text-xs text-muted-foreground">
                            {estatisticas.total > 0 ? Math.round((estatisticas.disponivel / estatisticas.total) * 100) : 0}% do total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ocupados</CardTitle>
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : estatisticas.ocupado}</div>
                        <p className="text-xs text-muted-foreground">
                            {estatisticas.total > 0 ? Math.round((estatisticas.ocupado / estatisticas.total) * 100) : 0}% do total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Limpeza</CardTitle>
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : estatisticas.limpeza}</div>
                        <p className="text-xs text-muted-foreground">
                            {estatisticas.total > 0 ? Math.round((estatisticas.limpeza / estatisticas.total) * 100) : 0}% do total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interditados</CardTitle>
                        <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : estatisticas.interditado}</div>
                        <p className="text-xs text-muted-foreground">
                            {estatisticas.total > 0 ? Math.round((estatisticas.interditado / estatisticas.total) * 100) : 0}% do total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reservados</CardTitle>
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : estatisticas.reservado}</div>
                        <p className="text-xs text-muted-foreground">
                            {estatisticas.total > 0 ? Math.round((estatisticas.reservado / estatisticas.total) * 100) : 0}% do total
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Mapa de Leitos por Andar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="h-4 w-4" />
                                    <span className="font-medium">1º Andar - Enfermaria Geral</span>
                                </div>
                                <div className="grid grid-cols-10 gap-2">
                                    {Array.from({ length: 30 }, (_, i) => (
                                        <div
                                            key={i}
                                            className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                                                i % 4 === 0 ? 'bg-red-100 text-red-800' :
                                                i % 4 === 1 ? 'bg-green-100 text-green-800' :
                                                i % 4 === 2 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {i + 1}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ações Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button 
                            className="w-full justify-start" 
                            variant="outline"
                            onClick={() => {
                                const leitoNumero = prompt('Número do leito a ocupar:');
                                if (leitoNumero) {
                                    const leito = leitos.find(l => l.numero === leitoNumero);
                                    if (leito && leito.status === 'DISPONIVEL') {
                                        ocuparLeito(leito.id);
                                    } else {
                                        toast.error('Leito não encontrado ou não disponível');
                                    }
                                }
                            }}
                        >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Ocupar Leito
                        </Button>
                        <Button 
                            className="w-full justify-start" 
                            variant="outline"
                            onClick={() => {
                                const leitoNumero = prompt('Número do leito a liberar:');
                                if (leitoNumero) {
                                    const leito = leitos.find(l => l.numero === leitoNumero);
                                    if (leito && leito.status === 'OCUPADO') {
                                        liberarLeito(leito.id);
                                    } else {
                                        toast.error('Leito não encontrado ou não está ocupado');
                                    }
                                }
                            }}
                        >
                            <Bed className="h-4 w-4 mr-2" />
                            Liberar Leito
                        </Button>
                        <Button 
                            className="w-full justify-start" 
                            variant="outline"
                            onClick={() => {
                                const leitoNumero = prompt('Número do leito para finalizar limpeza:');
                                if (leitoNumero) {
                                    const leito = leitos.find(l => l.numero === leitoNumero);
                                    if (leito && leito.status === 'LIMPEZA') {
                                        finalizarLimpeza(leito.id);
                                    } else {
                                        toast.error('Leito não encontrado ou não está em limpeza');
                                    }
                                }
                            }}
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            Finalizar Limpeza
                        </Button>
                        <Button 
                            className="w-full justify-start" 
                            variant="outline"
                            onClick={() => toast.info('Relatório em desenvolvimento')}
                        >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Relatório Ocupação
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Leitos Aguardando Limpeza</CardTitle>
                        <Badge variant="outline">8 pendentes</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            { leito: '101', tipo: 'Terminal', tempo: '2h 30m', enfermaria: 'Clínica Médica' },
                            { leito: '205', tipo: 'Concorrente', tempo: '1h 15m', enfermaria: 'Cirurgia' },
                            { leito: '312', tipo: 'Terminal', tempo: '45m', enfermaria: 'UTI' },
                        ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
                                        <Bed className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Leito {item.leito}</div>
                                        <div className="text-sm text-gray-600">{item.enfermaria}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant={item.tipo === 'Terminal' ? 'destructive' : 'secondary'}>
                                        {item.tipo}
                                    </Badge>
                                    <div className="text-xs text-gray-500 mt-1">{item.tempo}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Modal Novo Leito */}
            {showNovoLeito && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Cadastrar Novo Leito</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Número do Leito</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    value={novoLeito.numero}
                                    onChange={(e) => setNovoLeito(prev => ({...prev, numero: e.target.value}))}
                                    placeholder="Ex: 101, 202A..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Andar</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    value={novoLeito.andar}
                                    onChange={(e) => setNovoLeito(prev => ({...prev, andar: e.target.value}))}
                                    placeholder="Ex: 1º Andar, 2º Andar..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Enfermaria</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    value={novoLeito.enfermaria}
                                    onChange={(e) => setNovoLeito(prev => ({...prev, enfermaria: e.target.value}))}
                                    placeholder="Ex: Clínica Médica, UTI, Cirurgia..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setShowNovoLeito(false);
                                    setNovoLeito({ numero: '', andar: '', enfermaria: '' });
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleNovoLeito}>
                                Cadastrar Leito
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}