import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Ambulance, Phone, MapPin, Clock, AlertCircle, Users,
    Activity, Car, Stethoscope, CheckCircle, XCircle, Timer
} from 'lucide-react';
import NovaOcorrenciaForm from './NovaOcorrenciaForm';
import RegulacaoMedica from "./RegulacaoMedica";
import ControleViaturas from './ControleViaturas';
import OcorrenciasAtivas from './OcorrenciasAtivas';
import EstatisticasSAMU from './EstatisticasSAMU';
import SolicitacoesTARM from './SolicitacoesTARM';
import AtendimentosSolicitacoes from './AtendimentosSolicitacoes';
import SolicitacoesAmbulancia from './SolicitacoesAmbulancia';
import HistoricoSolicitacoes from './HistoricoSolicitacoes';

interface OcorrenciaAtiva {
    id: string;
    numeroOcorrencia: string;
    chamada: {
        telefone: string;
        endereco: string;
        bairro: string;
    };
    paciente?: {
        nome: string;
        idade: number;
    };
    riscoPresumido: 'CRITICO' | 'ALTO' | 'MODERADO' | 'BAIXO' | 'INDETERMINADO';
    statusOcorrencia: string;
    dataHoraChamada: string;
    viatura?: {
        codigo: string;
        tipo: string;
    };
    regulacao?: {
        regulado: boolean;
        medicoRegulador: string;
    };
}

const SAMU: React.FC = () => {
    const [ocorrenciasAtivas, setOcorrenciasAtivas] = useState<OcorrenciaAtiva[]>([]);
    const [estatisticas, setEstatisticas] = useState({
        ocorrenciasHoje: 0,
        viaturasDisponiveis: 0,
        tempoMedioResposta: 0,
        chamadasPendentes: 0
    });

    // Simulação de dados - substituir por API real
    useEffect(() => {
        // Dados mockados para demonstração
        setOcorrenciasAtivas([
            {
                id: '1',
                numeroOcorrencia: 'SAM2024001',
                chamada: {
                    telefone: '(11) 99999-9999',
                    endereco: 'Rua das Flores, 123',
                    bairro: 'Centro'
                },
                paciente: {
                    nome: 'João Silva',
                    idade: 45
                },
                riscoPresumido: 'ALTO',
                statusOcorrencia: 'VIATURA_DESLOCADA',
                dataHoraChamada: '2024-01-20T14:30:00',
                viatura: {
                    codigo: 'USA-01',
                    tipo: 'USA'
                },
                regulacao: {
                    regulado: true,
                    medicoRegulador: 'Dr. Maria Santos'
                }
            }
        ]);

        setEstatisticas({
            ocorrenciasHoje: 24,
            viaturasDisponiveis: 5,
            tempoMedioResposta: 12,
            chamadasPendentes: 3
        });
    }, []);

    const getRiscoColor = (risco: string) => {
        switch (risco) {
            case 'CRITICO': return 'bg-red-600 text-white';
            case 'ALTO': return 'bg-red-500 text-white';
            case 'MODERADO': return 'bg-yellow-500 text-white';
            case 'BAIXO': return 'bg-green-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDENTE_REGULACAO': return 'bg-yellow-100 text-yellow-800';
            case 'VIATURA_DESLOCADA': return 'bg-blue-100 text-blue-800';
            case 'NO_LOCAL': return 'bg-orange-100 text-orange-800';
            case 'TRANSPORTE': return 'bg-purple-100 text-purple-800';
            case 'FINALIZADA': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Ambulance className="w-8 h-8 text-red-600" />
                    <h1 className="text-3xl font-bold text-gray-900">
                        SAMU - Serviço de Atendimento Móvel de Urgência
                    </h1>
                </div>
                <p className="text-gray-600">
                    Central de Regulação e Controle de Ocorrências
                </p>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Ocorrências Hoje</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {estatisticas.ocorrenciasHoje}
                                </p>
                            </div>
                            <Activity className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Viaturas Disponíveis</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {estatisticas.viaturasDisponiveis}
                                </p>
                            </div>
                            <Car className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tempo Médio (min)</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {estatisticas.tempoMedioResposta}
                                </p>
                            </div>
                            <Timer className="w-8 h-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pendentes</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {estatisticas.chamadasPendentes}
                                </p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ocorrências Ativas em Destaque */}
            {ocorrenciasAtivas.length > 0 && (
                <Card className="mb-6 border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-800 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Ocorrências Ativas Críticas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {ocorrenciasAtivas
                                .filter(o => o.riscoPresumido === 'CRITICO' || o.riscoPresumido === 'ALTO')
                                .map(ocorrencia => (
                                    <div key={ocorrencia.id} className="bg-white p-4 rounded-lg border border-red-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <Badge className={getRiscoColor(ocorrencia.riscoPresumido)}>
                                                    {ocorrencia.riscoPresumido}
                                                </Badge>
                                                <span className="font-mono text-sm font-bold">
                                                    {ocorrencia.numeroOcorrencia}
                                                </span>
                                            </div>
                                            <Badge className={getStatusColor(ocorrencia.statusOcorrencia)}>
                                                {ocorrencia.statusOcorrencia.replace('_', ' ')}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <span>{ocorrencia.chamada.endereco}, {ocorrencia.chamada.bairro}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                <span>{ocorrencia.chamada.telefone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <span>{new Date(ocorrencia.dataHoraChamada).toLocaleTimeString()}</span>
                                            </div>
                                        </div>

                                        {ocorrencia.viatura && (
                                            <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                                                <Car className="w-4 h-4" />
                                                <span>Viatura: {ocorrencia.viatura.codigo} ({ocorrencia.viatura.tipo})</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tabs Principais - Conforme Manual */}
            <Tabs defaultValue="tarm" className="space-y-4">
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="tarm" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        TARM
                    </TabsTrigger>
                    <TabsTrigger value="atendimentos" className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Regulação
                    </TabsTrigger>
                    <TabsTrigger value="ambulancias" className="flex items-center gap-2">
                        <Ambulance className="w-4 h-4" />
                        Sol. Ambulâncias
                    </TabsTrigger>
                    <TabsTrigger value="controle" className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        Controle Amb.
                    </TabsTrigger>
                    <TabsTrigger value="ocorrencias" className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Ocorrências
                    </TabsTrigger>
                    <TabsTrigger value="historico" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Histórico
                    </TabsTrigger>
                    <TabsTrigger value="relatorios" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Relatórios
                    </TabsTrigger>
                </TabsList>

                {/* Solicitações do SAMU (TARM) */}
                <TabsContent value="tarm">
                    <SolicitacoesTARM />
                </TabsContent>

                {/* Atendimentos de Solicitações (Regulação Médica) */}
                <TabsContent value="atendimentos">
                    <AtendimentosSolicitacoes />
                </TabsContent>

                {/* Solicitações de Ambulâncias */}
                <TabsContent value="ambulancias">
                    <SolicitacoesAmbulancia />
                </TabsContent>

                {/* Controle de Ambulâncias */}
                <TabsContent value="controle">
                    <ControleViaturas />
                </TabsContent>

                {/* Ocorrências Ativas */}
                <TabsContent value="ocorrencias">
                    <OcorrenciasAtivas />
                </TabsContent>

                {/* Histórico */}
                <TabsContent value="historico">
                    <HistoricoSolicitacoes />
                </TabsContent>

                {/* Relatórios */}
                <TabsContent value="relatorios">
                    <EstatisticasSAMU />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SAMU;