import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Calendar, Clock, Check, X, Eye, BedDouble, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NovaPreInternacaoModal } from '@/components/hospitalar/NovaPreInternacaoModal';

interface PreInternacao {
  id: number;
  numeroPreInternacao: string;
  paciente: {
    id: number;
    nome: string;
    cpf: string;
  };
  leitoReservado?: {
    id: number;
    numero: string;
    enfermaria: string;
  };
  dataPrevisaoInternacao: string;
  horaPrevisaoInternacao?: string;
  statusPreInternacao: 'AGUARDANDO_LEITO' | 'LEITO_RESERVADO' | 'AGUARDANDO_AUTORIZACAO' | 'EFETIVADA' | 'CANCELADA';
  tipoInternacao: 'ELETIVA' | 'URGENCIA' | 'OBSERVACAO';
  origem: 'AMBULATORIO' | 'EMERGENCIA' | 'TRANSFERENCIA' | 'AGENDAMENTO_CIRURGICO' | 'CENTRAL_REGULACAO';
  medicoResponsavel: string;
  solicitouReservaLeito: boolean;
  temPendencias: boolean;
}

const PreInternacoesPage: React.FC = () => {
  const [preInternacoes, setPreInternacoes] = useState<PreInternacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [showNovaPreInternacaoModal, setShowNovaPreInternacaoModal] = useState(false);
  const { toast } = useToast();

  // Dados mock para demonstração
  const mockPreInternacoes: PreInternacao[] = [
    {
      id: 1,
      numeroPreInternacao: 'PI2025001',
      paciente: {
        id: 101,
        nome: 'Carlos Alberto Silva',
        cpf: '111.222.333-44'
      },
      leitoReservado: {
        id: 301,
        numero: '102-A',
        enfermaria: 'Cirurgia'
      },
      dataPrevisaoInternacao: '2025-01-25',
      horaPrevisaoInternacao: '08:00',
      statusPreInternacao: 'LEITO_RESERVADO',
      tipoInternacao: 'ELETIVA',
      origem: 'AGENDAMENTO_CIRURGICO',
      medicoResponsavel: 'Dr. Fernando Costa',
      solicitouReservaLeito: true,
      temPendencias: false
    },
    {
      id: 2,
      numeroPreInternacao: 'PI2025002',
      paciente: {
        id: 102,
        nome: 'Helena Souza',
        cpf: '555.666.777-88'
      },
      dataPrevisaoInternacao: '2025-01-24',
      horaPrevisaoInternacao: '14:00',
      statusPreInternacao: 'AGUARDANDO_LEITO',
      tipoInternacao: 'URGENCIA',
      origem: 'EMERGENCIA',
      medicoResponsavel: 'Dra. Patricia Lima',
      solicitouReservaLeito: true,
      temPendencias: true
    },
    {
      id: 3,
      numeroPreInternacao: 'PI2025003',
      paciente: {
        id: 103,
        nome: 'Roberto Almeida',
        cpf: '999.888.777-66'
      },
      dataPrevisaoInternacao: '2025-01-26',
      horaPrevisaoInternacao: '10:30',
      statusPreInternacao: 'AGUARDANDO_AUTORIZACAO',
      tipoInternacao: 'ELETIVA',
      origem: 'AMBULATORIO',
      medicoResponsavel: 'Dr. Marcos Oliveira',
      solicitouReservaLeito: false,
      temPendencias: false
    }
  ];

  useEffect(() => {
    setLoading(true);
    // Simular carregamento
    setTimeout(() => {
      setPreInternacoes(mockPreInternacoes);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'AGUARDANDO_LEITO': { color: 'bg-yellow-100 text-yellow-800', label: 'Aguardando Leito', icon: BedDouble },
      'LEITO_RESERVADO': { color: 'bg-blue-100 text-blue-800', label: 'Leito Reservado', icon: Check },
      'AGUARDANDO_AUTORIZACAO': { color: 'bg-orange-100 text-orange-800', label: 'Aguard. Autorização', icon: Clock },
      'EFETIVADA': { color: 'bg-green-100 text-green-800', label: 'Efetivada', icon: Check },
      'CANCELADA': { color: 'bg-red-100 text-red-800', label: 'Cancelada', icon: X }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['AGUARDANDO_LEITO'];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getOrigemBadge = (origem: string) => {
    const origemConfig = {
      'AMBULATORIO': { color: 'bg-blue-100 text-blue-800', label: 'Ambulatório' },
      'EMERGENCIA': { color: 'bg-red-100 text-red-800', label: 'Emergência' },
      'TRANSFERENCIA': { color: 'bg-purple-100 text-purple-800', label: 'Transferência' },
      'AGENDAMENTO_CIRURGICO': { color: 'bg-green-100 text-green-800', label: 'Cirurgia' },
      'CENTRAL_REGULACAO': { color: 'bg-yellow-100 text-yellow-800', label: 'Regulação' }
    };

    const config = origemConfig[origem as keyof typeof origemConfig] || origemConfig['AMBULATORIO'];
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const filteredPreInternacoes = preInternacoes.filter(preInternacao => {
    const matchesSearch =
      preInternacao.paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preInternacao.numeroPreInternacao.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || preInternacao.statusPreInternacao === statusFilter;
    const matchesTipo = tipoFilter === 'all' || preInternacao.tipoInternacao === tipoFilter;

    return matchesSearch && matchesStatus && matchesTipo;
  });

  const handleNovaPreInternacao = () => {
    setShowNovaPreInternacaoModal(true);
  };

  const handleEfetivar = (preInternacao: PreInternacao) => {
    toast({
      title: "Efetivar Pré-Internação",
      description: `Efetivando pré-internação ${preInternacao.numeroPreInternacao}...`
    });
  };

  const handleReservarLeito = (preInternacao: PreInternacao) => {
    toast({
      title: "Reservar Leito",
      description: `Abrindo seleção de leito para ${preInternacao.paciente.nome}...`
    });
  };

  const handleCancelar = (preInternacao: PreInternacao) => {
    toast({
      title: "Cancelar Pré-Internação",
      description: `Cancelando pré-internação ${preInternacao.numeroPreInternacao}...`,
      variant: "destructive"
    });
  };

  const handleVerDetalhes = (preInternacao: PreInternacao) => {
    toast({
      title: "Detalhes da Pré-Internação",
      description: `Abrindo detalhes da pré-internação ${preInternacao.numeroPreInternacao}`
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pré-Internações</h1>
          <p className="text-gray-600">Gerenciamento de pré-internações e reservas de leito</p>
        </div>
        <Button
          onClick={handleNovaPreInternacao}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Pré-Internação
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aguardando Leito</p>
              <p className="text-2xl font-bold text-yellow-600">
                {preInternacoes.filter(p => p.statusPreInternacao === 'AGUARDANDO_LEITO').length}
              </p>
            </div>
            <BedDouble className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leito Reservado</p>
              <p className="text-2xl font-bold text-blue-600">
                {preInternacoes.filter(p => p.statusPreInternacao === 'LEITO_RESERVADO').length}
              </p>
            </div>
            <Check className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Com Pendências</p>
              <p className="text-2xl font-bold text-red-600">
                {preInternacoes.filter(p => p.temPendencias).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Previsões Hoje</p>
              <p className="text-2xl font-bold text-green-600">
                {preInternacoes.filter(p =>
                  p.dataPrevisaoInternacao === new Date().toISOString().split('T')[0]
                ).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por paciente ou número da pré-internação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="AGUARDANDO_LEITO">Aguardando Leito</SelectItem>
              <SelectItem value="LEITO_RESERVADO">Leito Reservado</SelectItem>
              <SelectItem value="AGUARDANDO_AUTORIZACAO">Aguard. Autorização</SelectItem>
              <SelectItem value="EFETIVADA">Efetivada</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="ELETIVA">Eletiva</SelectItem>
              <SelectItem value="URGENCIA">Urgência</SelectItem>
              <SelectItem value="OBSERVACAO">Observação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista de Pré-Internações */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Lista de Pré-Internações</h2>

          {filteredPreInternacoes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma pré-internação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPreInternacoes.map((preInternacao) => (
                <div
                  key={preInternacao.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{preInternacao.paciente.nome}</p>
                        <p className="text-sm text-gray-500">CPF: {preInternacao.paciente.cpf}</p>
                        <p className="text-sm text-gray-500">Nº: {preInternacao.numeroPreInternacao}</p>
                        {preInternacao.temPendencias && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                            <AlertTriangle className="h-3 w-3" />
                            Com pendências
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">Previsão</p>
                        <p className="text-sm text-gray-900">
                          {new Date(preInternacao.dataPrevisaoInternacao).toLocaleDateString('pt-BR')}
                        </p>
                        {preInternacao.horaPrevisaoInternacao && (
                          <p className="text-sm text-gray-500">{preInternacao.horaPrevisaoInternacao}</p>
                        )}
                        {getOrigemBadge(preInternacao.origem)}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">Leito</p>
                        {preInternacao.leitoReservado ? (
                          <>
                            <p className="text-sm text-gray-900">{preInternacao.leitoReservado.numero}</p>
                            <p className="text-sm text-gray-500">{preInternacao.leitoReservado.enfermaria}</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Não reservado</p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">Médico</p>
                        <p className="text-sm text-gray-900">{preInternacao.medicoResponsavel}</p>
                        <p className="text-sm text-gray-500 capitalize">{preInternacao.tipoInternacao.toLowerCase()}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(preInternacao.statusPreInternacao)}

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerDetalhes(preInternacao)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>

                        {preInternacao.statusPreInternacao === 'LEITO_RESERVADO' && (
                          <Button
                            size="sm"
                            onClick={() => handleEfetivar(preInternacao)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Efetivar
                          </Button>
                        )}

                        {preInternacao.statusPreInternacao === 'AGUARDANDO_LEITO' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReservarLeito(preInternacao)}
                          >
                            <BedDouble className="h-3 w-3 mr-1" />
                            Reservar
                          </Button>
                        )}

                        {!['EFETIVADA', 'CANCELADA'].includes(preInternacao.statusPreInternacao) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelar(preInternacao)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Nova Pré-Internação */}
      <NovaPreInternacaoModal
        open={showNovaPreInternacaoModal}
        onOpenChange={setShowNovaPreInternacaoModal}
      />
    </div>
  );
};

export default PreInternacoesPage;