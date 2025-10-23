import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, UserCheck, Clock, Camera, AlertTriangle } from "lucide-react";

export default function AcessoPage() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Controle de Acesso</h1>
                    <p className="text-gray-600">Gestão de visitantes e controle de entrada</p>
                </div>
                <Button className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Registrar Entrada
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pessoas Dentro</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">247</div>
                        <p className="text-xs text-muted-foreground">No hospital agora</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitantes</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">89</div>
                        <p className="text-xs text-muted-foreground">Visitantes ativos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Acompanhantes</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">32</div>
                        <p className="text-xs text-muted-foreground">Com pacientes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Requer atenção</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Registros de Acesso - Hoje</CardTitle>
                            <Input placeholder="Buscar por nome ou documento..." className="w-64" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                {
                                    nome: 'Maria Santos',
                                    documento: '123.456.789-00',
                                    tipo: 'VISITANTE',
                                    paciente: 'João Santos',
                                    entrada: '14:30',
                                    cracha: 'V001',
                                    status: 'DENTRO'
                                },
                                {
                                    nome: 'Carlos Silva',
                                    documento: '987.654.321-00',
                                    tipo: 'ACOMPANHANTE',
                                    paciente: 'Ana Silva',
                                    entrada: '13:15',
                                    cracha: 'A005',
                                    status: 'DENTRO'
                                },
                                {
                                    nome: 'José Oliveira',
                                    documento: '456.789.123-00',
                                    tipo: 'FORNECEDOR',
                                    paciente: '-',
                                    entrada: '09:00',
                                    cracha: 'F012',
                                    status: 'SAIU',
                                    saida: '11:30'
                                }
                            ].map((registro, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{registro.nome}</span>
                                                <Badge
                                                    variant={
                                                        registro.tipo === 'VISITANTE' ? 'default' :
                                                        registro.tipo === 'ACOMPANHANTE' ? 'secondary' : 'outline'
                                                    }
                                                >
                                                    {registro.tipo}
                                                </Badge>
                                                <Badge
                                                    variant={registro.status === 'DENTRO' ? 'destructive' : 'secondary'}
                                                >
                                                    {registro.status}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Doc: {registro.documento} | Crachá: {registro.cracha}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {registro.paciente !== '-' && `Visitando: ${registro.paciente}`}
                                            </div>
                                        </div>
                                        <div className="text-right text-sm">
                                            <div>Entrada: {registro.entrada}</div>
                                            {registro.saida && <div>Saída: {registro.saida}</div>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        {registro.status === 'DENTRO' && (
                                            <Button size="sm" variant="outline">
                                                Registrar Saída
                                            </Button>
                                        )}
                                        <Button size="sm" variant="outline">
                                            Ver Foto
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            Histórico
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
                            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start">
                                <UserCheck className="h-4 w-4 mr-2" />
                                Nova Entrada
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Camera className="h-4 w-4 mr-2" />
                                Capturar Foto
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Shield className="h-4 w-4 mr-2" />
                                Relatório Segurança
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Clock className="h-4 w-4 mr-2" />
                                Histórico Acessos
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Alertas de Segurança</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 border border-red-200 bg-red-50 rounded">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    <span className="text-sm font-medium text-red-800">
                                        Visitante sem saída
                                    </span>
                                </div>
                                <p className="text-xs text-red-600">
                                    Pedro Costa - Entrada: 08:00 (6h atrás)
                                </p>
                            </div>
                            <div className="p-3 border border-yellow-200 bg-yellow-50 rounded">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm font-medium text-yellow-800">
                                        Horário irregular
                                    </span>
                                </div>
                                <p className="text-xs text-yellow-600">
                                    Fornecedor - Entrada fora do horário
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Configurações</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-sm">
                                <div className="font-medium">Horário Visitação</div>
                                <div className="text-gray-600">14:00 - 20:00</div>
                            </div>
                            <div className="text-sm">
                                <div className="font-medium">Limite Visitantes/Paciente</div>
                                <div className="text-gray-600">2 pessoas</div>
                            </div>
                            <div className="text-sm">
                                <div className="font-medium">Tempo Máximo Visita</div>
                                <div className="text-gray-600">4 horas</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}