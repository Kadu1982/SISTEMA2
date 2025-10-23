import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Ban, List, ArrowRight, Settings } from 'lucide-react';

import CalendarioExames from '@/pages/recepcao/agendamento/CalendarioExames';
import GerenciarHorarios from '@/pages/recepcao/agendamento/GerenciarHorarios';
import GerenciarBloqueios from '@/pages/recepcao/agendamento/GerenciarBloqueios';
import ListagemAgendamentosExames from '@/components/recepcao/agendamento/ListagemAgendamentosExames';

/**
 * Página índice do módulo de Agendamento de Exames
 * Mostra as opções disponíveis para o usuário
 */
const AgendamentoExamesIndex: React.FC = () => {
  const navigate = useNavigate();

  const opcoes = [
    {
      titulo: 'Agendamentos do Dia',
      descricao: 'Visualize e gerencie os agendamentos de hoje',
      icon: List,
      cor: 'bg-blue-500',
      rota: '/recepcao/agendamento'
    },
    {
      titulo: 'Calendário de Exames',
      descricao: 'Visualize disponibilidade e agende novos exames',
      icon: Calendar,
      cor: 'bg-green-500',
      rota: '/recepcao/calendario',
      destaque: true
    },
    {
      titulo: 'Horários de Exames',
      descricao: 'Configure horários disponíveis para agendamento',
      icon: Clock,
      cor: 'bg-purple-500',
      rota: '/recepcao/horarios'
    },
    {
      titulo: 'Bloqueios de Horários',
      descricao: 'Gerencie férias, feriados e bloqueios',
      icon: Ban,
      cor: 'bg-red-500',
      rota: '/recepcao/bloqueios'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sistema de Agendamento de Exames</h1>
        <p className="text-gray-600 mt-2">
          Gerencie horários, bloqueios e agendamentos de forma integrada
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {opcoes.map((opcao) => {
          const Icon = opcao.icon;
          return (
            <Card
              key={opcao.rota}
              className={`hover:shadow-lg transition-all cursor-pointer ${
                opcao.destaque ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={() => navigate(opcao.rota)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`${opcao.cor} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Tabs defaultValue="lista" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="lista">Lista de Agendamentos</TabsTrigger>
                          <TabsTrigger value="calendario">Calendário</TabsTrigger>
                          <TabsTrigger value="horarios">Horários</TabsTrigger>
                          <TabsTrigger value="bloqueios">Bloqueios</TabsTrigger>
                        </TabsList>

                        <TabsContent value="lista" className="mt-6">
                          <ListagemAgendamentosExames />
                        </TabsContent>

                        <TabsContent value="calendario" className="mt-6">
                          <CalendarioExames />
                        </TabsContent>

                        <TabsContent value="horarios" className="mt-6">
                          <GerenciarHorarios />
                        </TabsContent>

                        <TabsContent value="bloqueios" className="mt-6">
                          <GerenciarBloqueios />
                        </TabsContent>
                      </Tabs>
                      <CardTitle className="text-xl">
                        {opcao.titulo}
                        {opcao.destaque && (
                          <Badge className="ml-2 bg-green-500">Novo!</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {opcao.descricao}
                      </CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Card de Ajuda */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Como usar o sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p><strong>1. Configure os horários:</strong> Acesse "Horários de Exames" para definir quando os exames podem ser agendados</p>
          <p><strong>2. Cadastre bloqueios:</strong> Em "Bloqueios" você pode bloquear datas para férias, feriados, etc.</p>
          <p><strong>3. Use o calendário:</strong> O "Calendário de Exames" mostra visualmente a disponibilidade com cores</p>
          <p><strong>4. Acompanhe hoje:</strong> "Agendamentos do Dia" lista todos os agendamentos de hoje</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendamentoExamesIndex;
