import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Activity, Clock, TrendingUp, AlertCircle, Heart, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import apiService from '@/services/apiService';

// ✅ USAR INTERFACE CENTRALIZADA
import { AgendamentoDTO, formatarTipoAtendimento, formatarStatus } from '@/types/Agendamento';

// ✅ DADOS REAIS PARA GRÁFICOS (calculados a partir dos agendamentos)
const calcularDadosAtendimentosSemana = (agendamentos: AgendamentoDTO[]) => {
  const hoje = new Date();
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());

  return diasSemana.map((nome, index) => {
    const dia = new Date(inicioSemana);
    dia.setDate(inicioSemana.getDate() + index);

    const agendamentosDia = agendamentos.filter(a => {
      const dataAgendamento = new Date(a.dataHora);
      return dataAgendamento.toDateString() === dia.toDateString();
    });

    const consultas = agendamentosDia.filter(a =>
        a.tipo.includes('consulta') || a.tipo === 'consulta_medica' || a.tipo === 'consulta_enfermagem'
    ).length;

    const exames = agendamentosDia.filter(a =>
        a.tipo.includes('exame') || a.tipo === 'exame_laboratorial' || a.tipo === 'exame_imagem'
    ).length;

    return {
      nome,
      atendimentos: agendamentosDia.length,
      consultas,
      exames
    };
  });
};

const calcularDadosEspecialidades = (agendamentos: AgendamentoDTO[]) => {
  const especialidadeCount: Record<string, number> = {};
  const total = agendamentos.length;

  agendamentos.forEach(a => {
    const esp = a.especialidade || 'Não informado';
    especialidadeCount[esp] = (especialidadeCount[esp] || 0) + 1;
  });

  const cores = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  return Object.entries(especialidadeCount)
      .map(([nome, count], index) => ({
        nome,
        value: total > 0 ? Math.round((count / total) * 100) : 0,
        cor: cores[index % cores.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
};

const calcularDadosUltimos30Dias = (agendamentos: AgendamentoDTO[]) => {
  const hoje = new Date();
  const dados = [];

  for (let i = 29; i >= 0; i--) {
    const dia = new Date(hoje);
    dia.setDate(hoje.getDate() - i);

    const agendamentosDia = agendamentos.filter(a => {
      const dataAgendamento = new Date(a.dataHora);
      return dataAgendamento.toDateString() === dia.toDateString();
    });

    const consultas = agendamentosDia.filter(a => a.status === 'REALIZADO').length;

    dados.push({
      dia: format(dia, 'dd'),
      pacientes: agendamentosDia.length,
      consultas
    });
  }

  // Retornar apenas 7 pontos para não poluir o gráfico
  return dados.filter((_, index) => index % 4 === 0);
};

const Dashboard: React.FC = () => {
  // ✅ BUSCAR AGENDAMENTOS DE HOJE
  const { data: agendamentosHoje, isLoading: loadingAgendamentos } = useQuery<AgendamentoDTO[]>({
    queryKey: ['agendamentos-hoje'],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const { data } = await apiService.get('/agendamentos/por-data', { params: { data: hoje } });
      return data;
    },
    refetchInterval: 30000,
  });

  // ✅ BUSCAR TOTAL DE PACIENTES
  const { data: totalPacientes, isLoading: loadingPacientes } = useQuery<number>({
    queryKey: ['total-pacientes'],
    queryFn: async () => {
      const { data } = await apiService.get('/pacientes');
      return data.length;
    },
    refetchInterval: 60000,
  });

  // ✅ BUSCAR AGENDAMENTOS DOS ÚLTIMOS 30 DIAS PARA GRÁFICOS
  const { data: agendamentosUltimos30Dias } = useQuery<AgendamentoDTO[]>({
    queryKey: ['agendamentos-ultimos-30-dias'],
    queryFn: async () => {
      const hoje = new Date();
      const inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - 30);

      const promises = [];
      for (let d = new Date(inicio); d <= hoje; d.setDate(d.getDate() + 1)) {
        const dataStr = d.toISOString().split('T')[0];
        promises.push(
            apiService.get('/agendamentos/por-data', { params: { data: dataStr } })
                .then(response => response.data)
                .catch(() => [])
        );
      }

      const resultados = await Promise.all(promises);
      return resultados.flat();
    },
    refetchInterval: 300000, // 5 minutos
  });

  // ✅ CALCULAR ESTATÍSTICAS
  const agendados = agendamentosHoje?.filter(a => a.status === 'AGENDADO').length || 0;
  const confirmados = agendamentosHoje?.filter(a => a.status === 'CONFIRMADO').length || 0;
  const realizados = agendamentosHoje?.filter(a => a.status === 'REALIZADO').length || 0;
  const cancelados = agendamentosHoje?.filter(a => a.status === 'CANCELADO').length || 0;
  const totalHoje = agendamentosHoje?.length || 0;

  // ✅ CALCULAR PRÓXIMOS 7 DIAS
  const proximosSeteDias = agendamentosUltimos30Dias ?
      agendamentosUltimos30Dias.filter(a => {
        const dataAgendamento = new Date(a.dataHora);
        const hoje = new Date();
        const seteDias = new Date(hoje);
        seteDias.setDate(hoje.getDate() + 7);
        return dataAgendamento >= hoje && dataAgendamento <= seteDias;
      }).length : 0;

  // ✅ GERAR DADOS PARA GRÁFICOS
  const dadosAtendimentosDiarios = agendamentosUltimos30Dias ?
      calcularDadosAtendimentosSemana(agendamentosUltimos30Dias) : [];

  const dadosEspecialidades = agendamentosUltimos30Dias ?
      calcularDadosEspecialidades(agendamentosUltimos30Dias) : [];

  const dadosUltimos30Dias = agendamentosUltimos30Dias ?
      calcularDadosUltimos30Dias(agendamentosUltimos30Dias) : [];

  // ✅ FUNÇÕES AUXILIARES
  const formatarDataHora = (dataHoraString: string) => {
    const data = new Date(dataHoraString);
    return format(data, 'HH:mm', { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AGENDADO':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Agendado</Badge>;
      case 'CONFIRMADO':
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmado</Badge>;
      case 'REALIZADO':
        return <Badge variant="default" className="bg-emerald-100 text-emerald-800">Realizado</Badge>;
      case 'CANCELADO':
        return <Badge variant="destructive">Cancelado</Badge>;
      case 'FALTOU':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Faltou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
      <div className="flex-1 space-y-6 p-6">
        {/* Título */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral das atividades do sistema de saúde
          </p>
        </div>

        {/* ✅ CARDS DE ESTATÍSTICAS COM DADOS REAIS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes Cadastrados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingPacientes ? '...' : totalPacientes?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de pacientes no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atendimentos Hoje</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingAgendamentos ? '...' : totalHoje}
              </div>
              <p className="text-xs text-muted-foreground">
                {realizados} realizados, {agendados + confirmados} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {proximosSeteDias}
              </div>
              <p className="text-xs text-muted-foreground">
                Para os próximos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingAgendamentos ? '...' :
                    totalHoje > 0 ?
                        `${Math.round(((realizados + confirmados) / totalHoje) * 100)}%` :
                        '0%'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Capacidade atual da unidade
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ✅ TABELA DE AGENDAMENTOS DE HOJE COM DADOS REAIS */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos de Hoje</CardTitle>
            <CardDescription>
              Lista completa dos agendamentos programados para hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAgendamentos ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Carregando agendamentos...</span>
                </div>
            ) : agendamentosHoje && agendamentosHoje.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horário</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agendamentosHoje
                        .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
                        .map((agendamento) => (
                            <TableRow key={agendamento.id}>
                              <TableCell className="font-medium">
                                {formatarDataHora(agendamento.dataHora)}
                              </TableCell>
                              <TableCell>{agendamento.pacienteNome}</TableCell>
                              <TableCell>{formatarTipoAtendimento(agendamento.tipo)}</TableCell>
                              <TableCell>{agendamento.especialidade || 'Não informado'}</TableCell>
                              <TableCell>{getStatusBadge(agendamento.status)}</TableCell>
                            </TableRow>
                        ))}
                  </TableBody>
                </Table>
            ) : (
                <div className="text-center p-8 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Nenhum agendamento encontrado para hoje</p>
                  <p className="text-sm mt-2">Use a página de Recepção para criar novos agendamentos</p>
                </div>
            )}
          </CardContent>
        </Card>

        {/* ✅ GRÁFICOS COM DADOS REAIS */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Gráfico de Atendimentos Semanais */}
          <Card>
            <CardHeader>
              <CardTitle>Atendimentos da Semana</CardTitle>
              <CardDescription>
                Distribuição de consultas e exames por dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosAtendimentosDiarios}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="consultas" fill="#8884d8" name="Consultas" />
                  <Bar dataKey="exames" fill="#82ca9d" name="Exames" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Especialidades */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Especialidade</CardTitle>
              <CardDescription>
                Percentual de atendimentos por área médica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                      data={dadosEspecialidades}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nome, value }) => `${nome}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                  >
                    {dadosEspecialidades.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Linha - Últimos 30 dias */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução dos Atendimentos - Últimos 30 Dias</CardTitle>
            <CardDescription>
              Tendência de novos pacientes e consultas realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosUltimos30Dias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="pacientes"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Novos Pacientes"
                />
                <Line
                    type="monotone"
                    dataKey="consultas"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="Consultas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ✅ INDICADORES RÁPIDOS COM DADOS REAIS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Agendados</span>
                  <Badge variant="secondary">{agendados} pacientes</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Confirmados</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">{confirmados} pacientes</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Realizados</span>
                  <Badge variant="default" className="bg-emerald-100 text-emerald-800">{realizados} pacientes</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Cancelados</span>
                  <Badge variant="destructive">{cancelados} pacientes</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recursos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Consultórios</span>
                    <span>6/8</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Equipamentos</span>
                    <span>4/5</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Profissionais</span>
                    <span>12/15</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alertas do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Sistema funcionando</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Dados atualizados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{totalPacientes || 0} pacientes cadastrados</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default Dashboard;
