import React, { useState } from 'react';
import {
    Calendar,
    Clock,
    Search,
    Plus,
    Edit3,
    Trash2,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AgendamentoRecepcaoProps {
    dados: {
        agendamentosHoje: number;
        disponiveisHoje: number;
        cancelamentosHoje: number;
        proximoDisponivel: string;
    };
}

const AtendimentoRecepcao: React.FC<AgendamentoRecepcaoProps> = ({ dados }) => {
    const [buscaAgendamento, setBuscaAgendamento] = useState('');

    // Dados simulados de agendamentos
    const agendamentosHoje = [
        { id: 1, horario: '08:00', paciente: 'Maria Silva', medico: 'Dr. João', especialidade: 'Clínica Geral', status: 'confirmado' },
        { id: 2, horario: '08:30', paciente: 'Pedro Santos', medico: 'Dra. Ana', especialidade: 'Cardiologia', status: 'aguardando' },
        { id: 3, horario: '09:00', paciente: 'Carla Lima', medico: 'Dr. Carlos', especialidade: 'Pediatria', status: 'cancelado' },
        { id: 4, horario: '09:30', paciente: 'José Costa', medico: 'Dr. João', especialidade: 'Clínica Geral', status: 'confirmado' },
        { id: 5, horario: '10:00', paciente: 'Ana Rocha', medico: 'Dra. Maria', especialidade: 'Ginecologia', status: 'realizado' },
    ];

    const horariosDisponiveis = [
        '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmado':
                return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>;
            case 'aguardando':
                return <Badge className="bg-yellow-100 text-yellow-800">Aguardando</Badge>;
            case 'cancelado':
                return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
            case 'realizado':
                return <Badge className="bg-blue-100 text-blue-800">Realizado</Badge>;
            default:
                return <Badge variant="outline">Indefinido</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* PAINEL DE INDICADORES */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{dados.agendamentosHoje}</div>
                        <p className="text-xs text-muted-foreground">Total do dia</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{dados.disponiveisHoje}</div>
                        <p className="text-xs text-muted-foreground">Horários livres</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cancelamentos</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{dados.cancelamentosHoje}</div>
                        <p className="text-xs text-muted-foreground">Hoje</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Próximo Disponível</CardTitle>
                        <Clock className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">{dados.proximoDisponivel}</div>
                        <p className="text-xs text-muted-foreground">Hoje</p>
                    </CardContent>
                </Card>
            </div>

            {/* SISTEMA DE ABAS DO AGENDAMENTO */}
            <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                    <Tabs defaultValue="hoje" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="hoje">Hoje</TabsTrigger>
                            <TabsTrigger value="novo">Novo Agendamento</TabsTrigger>
                            <TabsTrigger value="calendario">Calendário</TabsTrigger>
                        </TabsList>

                        {/* ABA: AGENDAMENTOS DE HOJE */}
                        <TabsContent value="hoje" className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">📅 Agendamentos de Hoje</h3>
                                <div className="flex items-center space-x-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Buscar agendamento..."
                                            value={buscaAgendamento}
                                            onChange={(e) => setBuscaAgendamento(e.target.value)}
                                            className="pl-10 w-64"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {agendamentosHoje.map((agendamento) => (
                                    <div
                                        key={agendamento.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="text-lg font-bold text-blue-600 min-w-[60px]">
                                                {agendamento.horario}
                                            </div>
                                            <div>
                                                <p className="font-medium">{agendamento.paciente}</p>
                                                <p className="text-sm text-gray-500">
                                                    {agendamento.medico} • {agendamento.especialidade}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {getStatusBadge(agendamento.status)}
                                            <Button size="sm" variant="outline" className="hover:scale-105 transition-all duration-300">
                                                <Edit3 className="h-3 w-3 mr-1" />
                                                Editar
                                            </Button>
                                            <Button size="sm" variant="outline" className="hover:scale-105 transition-all duration-300 text-red-600 hover:text-red-700">
                                                <Trash2 className="h-3 w-3 mr-1" />
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* ABA: NOVO AGENDAMENTO */}
                        <TabsContent value="novo" className="space-y-4">
                            <div className="border-l-4 border-green-600 pl-4 mb-6">
                                <h3 className="text-lg font-semibold text-green-600">➕ Novo Agendamento</h3>
                                <p className="text-gray-600">Criar novo agendamento para paciente</p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Dados do Paciente</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input placeholder="Buscar paciente..." className="pl-10" />
                                        </div>
                                        <Input placeholder="CPF" />
                                        <Input placeholder="Telefone" />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Agendamento</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Input type="date" />
                                        <select className="w-full p-2 border rounded">
                                            <option>Selecione o horário</option>
                                            {horariosDisponiveis.map(horario => (
                                                <option key={horario} value={horario}>{horario}</option>
                                            ))}
                                        </select>
                                        <select className="w-full p-2 border rounded">
                                            <option>Selecione a especialidade</option>
                                            <option>Clínica Geral</option>
                                            <option>Cardiologia</option>
                                            <option>Pediatria</option>
                                            <option>Ginecologia</option>
                                        </select>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Button variant="outline">
                                    Cancelar
                                </Button>
                                <Button className="bg-green-600 hover:bg-green-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Confirmar Agendamento
                                </Button>
                            </div>
                        </TabsContent>

                        {/* ABA: CALENDÁRIO */}
                        <TabsContent value="calendario" className="space-y-4">
                            <div className="border-l-4 border-purple-600 pl-4 mb-6">
                                <h3 className="text-lg font-semibold text-purple-600">📅 Calendário de Agendamentos</h3>
                                <p className="text-gray-600">Visualização mensal dos agendamentos</p>
                            </div>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="text-center text-gray-500 py-8">
                                        <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                        <p>Calendário será implementado em breve</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default AtendimentoRecepcao;