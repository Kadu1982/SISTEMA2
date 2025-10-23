import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Hospital, Clock, User, Phone } from "lucide-react";

export default function CentralLeitosPage() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Central de Leitos</h1>
                    <p className="text-gray-600">Solicitações e reservas de leitos entre unidades</p>
                </div>
                <Button className="flex items-center gap-2">
                    <Hospital className="h-4 w-4" />
                    Nova Solicitação
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Aguardando análise</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leitos Reservados</CardTitle>
                        <Hospital className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">Confirmados hoje</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Urgentes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2.5h</div>
                        <p className="text-xs text-muted-foreground">Resposta</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Solicitações de Leitos</CardTitle>
                            <div className="flex items-center gap-2">
                                <Search className="h-4 w-4 text-gray-400" />
                                <Input placeholder="Buscar por paciente..." className="w-64" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                {
                                    id: '001',
                                    paciente: 'Maria Silva Santos',
                                    medico: 'Dr. João Cardiologia',
                                    tipo: 'UTI',
                                    prioridade: 'ALTA',
                                    tempo: '2h 15m',
                                    origem: 'UPA Centro'
                                },
                                {
                                    id: '002',
                                    paciente: 'José da Silva',
                                    medico: 'Dra. Ana Neurologia',
                                    tipo: 'Enfermaria',
                                    prioridade: 'MEDIA',
                                    tempo: '4h 30m',
                                    origem: 'Hospital Municipal'
                                },
                                {
                                    id: '003',
                                    paciente: 'Ana Costa Lima',
                                    medico: 'Dr. Carlos Ortopedia',
                                    tipo: 'Apartamento',
                                    prioridade: 'BAIXA',
                                    tempo: '1h 45m',
                                    origem: 'Pronto Socorro'
                                }
                            ].map((solicitacao) => (
                                <div key={solicitacao.id} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{solicitacao.paciente}</span>
                                                <Badge
                                                    variant={
                                                        solicitacao.prioridade === 'ALTA' ? 'destructive' :
                                                        solicitacao.prioridade === 'MEDIA' ? 'default' : 'secondary'
                                                    }
                                                >
                                                    {solicitacao.prioridade}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Solicitado por: {solicitacao.medico}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Origem: {solicitacao.origem}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">{solicitacao.tipo}</div>
                                            <div className="text-xs text-gray-500">{solicitacao.tempo}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="flex-1">
                                            Reservar Leito
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            Ver Detalhes
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Disponibilidade por Tipo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { tipo: 'UTI', disponivel: 2, total: 15 },
                                { tipo: 'Semi-UTI', disponivel: 5, total: 12 },
                                { tipo: 'Enfermaria', disponivel: 18, total: 45 },
                                { tipo: 'Apartamento', disponivel: 8, total: 20 },
                                { tipo: 'Isolamento', disponivel: 1, total: 4 }
                            ].map((item) => (
                                <div key={item.tipo} className="flex items-center justify-between">
                                    <span className="text-sm">{item.tipo}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                            {item.disponivel}/{item.total}
                                        </span>
                                        <div className="w-12 h-2 bg-gray-200 rounded-full">
                                            <div
                                                className="h-2 bg-green-500 rounded-full"
                                                style={{ width: `${(item.disponivel / item.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Contatos Emergência</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 p-2 border rounded">
                                <Phone className="h-4 w-4 text-blue-500" />
                                <div>
                                    <div className="text-sm font-medium">Central de Leitos</div>
                                    <div className="text-xs text-gray-600">(11) 3456-7890</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 border rounded">
                                <User className="h-4 w-4 text-green-500" />
                                <div>
                                    <div className="text-sm font-medium">Enfermagem UTI</div>
                                    <div className="text-xs text-gray-600">(11) 3456-7891</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 border rounded">
                                <Hospital className="h-4 w-4 text-purple-500" />
                                <div>
                                    <div className="text-sm font-medium">Direção Médica</div>
                                    <div className="text-xs text-gray-600">(11) 3456-7892</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}