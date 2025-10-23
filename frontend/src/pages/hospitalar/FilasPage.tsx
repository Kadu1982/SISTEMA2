import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Clock, BarChart3, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import apiService from "@/services/apiService";
import { toast } from "react-hot-toast";

interface Fila {
    id: number;
    nome: string;
    descricao: string;
    ativo: boolean;
    senhasAguardando: number;
    tempoMedio: number;
    atendimentosHoje: number;
}

export default function FilasPage() {
    const [filas, setFilas] = useState<Fila[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNovaFila, setShowNovaFila] = useState(false);
    const [novaFila, setNovaFila] = useState({ nome: '', descricao: '' });

    useEffect(() => {
        carregarFilas();
    }, []);

    const carregarFilas = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/hospitalar/filas');
            setFilas(response.data?.data || []);
        } catch (error) {
            console.error('Erro ao carregar filas:', error);
            toast.error('Erro ao carregar filas');
            // Mock data para demonstração
            setFilas([
                { id: 1, nome: 'Triagem', descricao: 'Fila de triagem geral', ativo: true, senhasAguardando: 8, tempoMedio: 15, atendimentosHoje: 45 },
                { id: 2, nome: 'Consultas', descricao: 'Fila de consultas médicas', ativo: true, senhasAguardando: 15, tempoMedio: 20, atendimentosHoje: 82 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleNovaFila = async () => {
        if (!novaFila.nome.trim()) {
            toast.error('Nome da fila é obrigatório');
            return;
        }

        try {
            await apiService.post('/hospitalar/filas', novaFila);
            toast.success('Fila criada com sucesso!');
            setShowNovaFila(false);
            setNovaFila({ nome: '', descricao: '' });
            carregarFilas();
        } catch (error) {
            console.error('Erro ao criar fila:', error);
            toast.error('Erro ao criar fila');
        }
    };

    const calcularEstatisticas = () => {
        const filasAtivas = filas.filter(f => f.ativo).length;
        const totalSenhas = filas.reduce((acc, f) => acc + f.senhasAguardando, 0);
        const tempoMedio = filas.length > 0 ? Math.round(filas.reduce((acc, f) => acc + f.tempoMedio, 0) / filas.length) : 0;
        const totalAtendimentos = filas.reduce((acc, f) => acc + f.atendimentosHoje, 0);
        
        return { filasAtivas, totalSenhas, tempoMedio, totalAtendimentos };
    };

    const stats = calcularEstatisticas();

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Gestão de Filas</h1>
                    <p className="text-gray-600">Gerencie filas de atendimento e senhas</p>
                </div>
                <Button 
                    className="flex items-center gap-2"
                    onClick={() => setShowNovaFila(true)}
                >
                    <Plus className="h-4 w-4" />
                    Nova Fila
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Filas Ativas</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.filasAtivas}</div>
                        <p className="text-xs text-muted-foreground">filas em funcionamento</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Senhas Aguardando</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.totalSenhas}</div>
                        <p className="text-xs text-muted-foreground">Em todas as filas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : `${stats.tempoMedio}min`}</div>
                        <p className="text-xs text-muted-foreground">Tempo de espera</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Atendimentos Hoje</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.totalAtendimentos}</div>
                        <p className="text-xs text-muted-foreground">Total do dia</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filas de Atendimento</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Carregando filas...</p>
                        </div>
                    ) : filas.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>Nenhuma fila encontrada.</p>
                            <Button 
                                className="mt-4"
                                onClick={() => setShowNovaFila(true)}
                            >
                                Criar primeira fila
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filas.map((fila) => (
                                <div key={fila.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <h3 className="font-medium">{fila.nome}</h3>
                                        <p className="text-sm text-gray-600">{fila.descricao}</p>
                                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                            <span>Aguardando: {fila.senhasAguardando}</span>
                                            <span>Tempo médio: {fila.tempoMedio}min</span>
                                            <span>Hoje: {fila.atendimentosHoje} atendimentos</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal Nova Fila */}
            {showNovaFila && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Nova Fila de Atendimento</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nome da Fila</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    value={novaFila.nome}
                                    onChange={(e) => setNovaFila(prev => ({...prev, nome: e.target.value}))}
                                    placeholder="Ex: Triagem, Consultas..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Descrição</label>
                                <textarea
                                    className="w-full p-2 border rounded-md"
                                    rows={3}
                                    value={novaFila.descricao}
                                    onChange={(e) => setNovaFila(prev => ({...prev, descricao: e.target.value}))}
                                    placeholder="Descreva o tipo de atendimento desta fila..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setShowNovaFila(false);
                                    setNovaFila({ nome: '', descricao: '' });
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleNovaFila}>
                                Criar Fila
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}