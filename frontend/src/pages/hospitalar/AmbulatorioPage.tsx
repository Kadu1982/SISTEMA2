import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Activity, Plus, Search, Stethoscope } from 'lucide-react';
import ambulatorioService, { AgendamentoAmbulatorio, EscalaMedica } from '../../services/ambulatorioService';
import { useOperador } from '../../contexts/OperadorContext';

// Remover interfaces duplicadas, usando as do service

export default function AmbulatorioPage() {
  const { operador } = useOperador();
  const [agendamentos, setAgendamentos] = useState<AgendamentoAmbulatorio[]>([]);
  const [escalas, setEscalas] = useState<EscalaMedica[]>([]);
  const [pacientesAguardando, setPacientesAguardando] = useState<AgendamentoAmbulatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataAtual] = useState(new Date().toISOString().split('T')[0]);
  const [abaSelecionada, setAbaSelecionada] = useState<'dashboard' | 'agendamentos' | 'escalas' | 'aguardando'>('dashboard');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Tentar carregar dados reais da API, caso contrário usar dados mock
      try {
        const responseAgendamentos = await ambulatorioService.listarAgendamentos(dataAtual);
        const responseEscalas = await ambulatorioService.listarEscalas(dataAtual);
        const responseAguardando = await ambulatorioService.listarPacientesAguardando(dataAtual);

        if (responseAgendamentos.success) {
          setAgendamentos(responseAgendamentos.data || []);
        }

        if (responseEscalas.success) {
          setEscalas(responseEscalas.data || []);
        }

        if (responseAguardando.success) {
          setPacientesAguardando(responseAguardando.data || []);
        }
      } catch (apiError) {
        console.log('API não disponível, usando dados mock para demonstração');

        // Dados mock para demonstração
        const agendamentosDemo: Partial<AgendamentoAmbulatorio>[] = [
          {
            id: 1,
            nomePaciente: 'João Silva',
            cpfPaciente: '123.456.789-00',
            nomeProfissional: 'Dr. Carlos Mendes',
            nomeEspecialidade: 'Cardiologia',
            dataAgendamento: dataAtual,
            horaAgendamento: '08:00',
            statusAgendamento: 'PRESENTE',
            prioridade: 'NORMAL',
            motivoConsulta: 'Consulta de rotina',
            numeroSala: 'Sala 101'
          },
          {
            id: 2,
            nomePaciente: 'Maria Santos',
            cpfPaciente: '987.654.321-00',
            nomeProfissional: 'Dra. Ana Paula',
            nomeEspecialidade: 'Endocrinologia',
            dataAgendamento: dataAtual,
            horaAgendamento: '09:00',
            statusAgendamento: 'AGENDADO',
            prioridade: 'ALTA',
            motivoConsulta: 'Acompanhamento diabetes',
            numeroSala: 'Sala 102'
          }
        ];

        const escalasDemo: Partial<EscalaMedica>[] = [
          {
            id: 1,
            nomeProfissional: 'Dr. Carlos Mendes',
            nomeEspecialidade: 'Cardiologia',
            dataEscala: dataAtual,
            horaInicio: '08:00',
            horaFim: '12:00',
            vagasDisponiveis: 8,
            vagasOcupadas: 6,
            vagasLivres: 2,
            statusEscala: 'ATIVA',
            numeroSala: 'Sala 101'
          }
        ];

        setAgendamentos(agendamentosDemo as AgendamentoAmbulatorio[]);
        setEscalas(escalasDemo as EscalaMedica[]);
        setPacientesAguardando(agendamentosDemo.filter(a => a.statusAgendamento === 'PRESENTE') as AgendamentoAmbulatorio[]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarPresenca = async (id: number) => {
    try {
      if (operador?.id) {
        const response = await ambulatorioService.confirmarPresenca(id, operador.id);
        if (response.success) {
          await carregarDados(); // Recarregar dados
        }
      } else {
        // Fallback para dados mock
        const agendamentosAtualizados = agendamentos.map(a =>
          a.id === id ? { ...a, statusAgendamento: 'PRESENTE' } : a
        );
        setAgendamentos(agendamentosAtualizados);
        setPacientesAguardando(prev => [...prev, agendamentosAtualizados.find(a => a.id === id)!]);
      }
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
      // Fallback para dados mock em caso de erro
      const agendamentosAtualizados = agendamentos.map(a =>
        a.id === id ? { ...a, statusAgendamento: 'PRESENTE' } : a
      );
      setAgendamentos(agendamentosAtualizados);
      setPacientesAguardando(prev => [...prev, agendamentosAtualizados.find(a => a.id === id)!]);
    }
  };

  const chamarPaciente = async (id: number) => {
    try {
      if (operador?.id) {
        const response = await ambulatorioService.chamarPaciente(id, operador.id);
        if (response.success) {
          await carregarDados(); // Recarregar dados
        }
      } else {
        // Fallback para dados mock
        const agendamentosAtualizados = agendamentos.map(a =>
          a.id === id ? { ...a, statusAgendamento: 'CHAMADO' } : a
        );
        setAgendamentos(agendamentosAtualizados);
        setPacientesAguardando(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Erro ao chamar paciente:', error);
      // Fallback para dados mock em caso de erro
      const agendamentosAtualizados = agendamentos.map(a =>
        a.id === id ? { ...a, statusAgendamento: 'CHAMADO' } : a
      );
      setAgendamentos(agendamentosAtualizados);
      setPacientesAguardando(prev => prev.filter(p => p.id !== id));
    }
  };

  const iniciarAtendimento = async (id: number) => {
    try {
      if (operador?.id) {
        const response = await ambulatorioService.iniciarAtendimento(id, operador.id);
        if (response.success) {
          await carregarDados(); // Recarregar dados
        }
      } else {
        // Fallback para dados mock
        setAgendamentos(prev => prev.map(a =>
          a.id === id ? { ...a, statusAgendamento: 'EM_ATENDIMENTO' } : a
        ));
      }
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error);
      // Fallback para dados mock em caso de erro
      setAgendamentos(prev => prev.map(a =>
        a.id === id ? { ...a, statusAgendamento: 'EM_ATENDIMENTO' } : a
      ));
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      'AGENDADO': 'bg-blue-100 text-blue-800',
      'CONFIRMADO': 'bg-green-100 text-green-800',
      'PRESENTE': 'bg-yellow-100 text-yellow-800',
      'CHAMADO': 'bg-orange-100 text-orange-800',
      'EM_ATENDIMENTO': 'bg-purple-100 text-purple-800',
      'ATENDIDO': 'bg-green-100 text-green-800',
      'FALTOU': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const classes = {
      'BAIXA': 'bg-gray-100 text-gray-800',
      'NORMAL': 'bg-blue-100 text-blue-800',
      'ALTA': 'bg-yellow-100 text-yellow-800',
      'URGENTE': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes[prioridade as keyof typeof classes] || 'bg-gray-100 text-gray-800'}`}>
        {prioridade}
      </span>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Agendamentos Hoje
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {agendamentos.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Aguardando
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {pacientesAguardando.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Escalas Ativas
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {escalas.filter(e => e.statusEscala === 'ATIVA').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Em Atendimento
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {agendamentos.filter(a => a.statusAgendamento === 'EM_ATENDIMENTO').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de pacientes aguardando */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Pacientes Aguardando Atendimento
          </h3>
          {pacientesAguardando.length === 0 ? (
            <p className="text-gray-500">Nenhum paciente aguardando.</p>
          ) : (
            <div className="space-y-3">
              {pacientesAguardando.map((paciente) => (
                <div key={paciente.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{paciente.nomePaciente}</p>
                    <p className="text-sm text-gray-600">{paciente.nomeEspecialidade} - {paciente.horaAgendamento}</p>
                  </div>
                  <div className="flex space-x-2">
                    {getPrioridadeBadge(paciente.prioridade)}
                    <button
                      onClick={() => chamarPaciente(paciente.id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Chamar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAgendamentos = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Agendamentos do Dia
          </h3>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Novo Agendamento
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agendamentos.map((agendamento) => (
                <tr key={agendamento.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{agendamento.nomePaciente}</div>
                      <div className="text-sm text-gray-500">{agendamento.cpfPaciente}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{agendamento.nomeProfissional}</div>
                      <div className="text-sm text-gray-500">{agendamento.nomeEspecialidade}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{agendamento.horaAgendamento}</div>
                    {agendamento.numeroSala && (
                      <div className="text-sm text-gray-500">{agendamento.numeroSala}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(agendamento.statusAgendamento)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPrioridadeBadge(agendamento.prioridade)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {agendamento.statusAgendamento === 'AGENDADO' && (
                      <button
                        onClick={() => confirmarPresenca(agendamento.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Confirmar Presença
                      </button>
                    )}
                    {agendamento.statusAgendamento === 'CHAMADO' && (
                      <button
                        onClick={() => iniciarAtendimento(agendamento.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Iniciar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ambulatório Hospitalar</h1>
              <p className="text-gray-600">Gestão de agendamentos e escalas médicas</p>
            </div>
            <div className="text-sm text-gray-500">
              Data: {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>

          {/* Navegação por abas */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { key: 'dashboard', label: 'Dashboard', icon: Activity },
                { key: 'agendamentos', label: 'Agendamentos', icon: Calendar },
                { key: 'escalas', label: 'Escalas', icon: Users },
                { key: 'aguardando', label: 'Aguardando', icon: Clock },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setAbaSelecionada(key as any)}
                  className={`${
                    abaSelecionada === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        {abaSelecionada === 'dashboard' && renderDashboard()}
        {abaSelecionada === 'agendamentos' && renderAgendamentos()}
        {abaSelecionada === 'escalas' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Escalas Médicas</h3>
            <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
          </div>
        )}
        {abaSelecionada === 'aguardando' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fila de Espera</h3>
            <p className="text-gray-600">Visualização detalhada da fila em desenvolvimento...</p>
          </div>
        )}
      </div>
    </div>
  );
}