import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Eye, FileText, UserPlus, BedDouble, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NovaInternacaoModal } from '@/components/hospitalar/NovaInternacaoModal';

interface Internacao {
  id: number;
  numeroInternacao: string;
  paciente: {
    id: number;
    nome: string;
    cpf: string;
  };
  leito: {
    id: number;
    numero: string;
    enfermaria: string;
  };
  dataInternacao: string;
  horaInternacao: string;
  statusInternacao: 'ATIVA' | 'ALTA_MEDICA' | 'ALTA_ADMINISTRATIVA' | 'TRANSFERIDA' | 'OBITO';
  tipoInternacao: 'ELETIVA' | 'URGENCIA' | 'OBSERVACAO' | 'HOSPITAL_DIA';
  diasInternacao: number;
  medicoResponsavel: string;
  dataPrevistaAlta?: string;
}

const InternacoesPage: React.FC = () => {
  const [internacoes, setInternacoes] = useState<Internacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [showNovaInternacaoModal, setShowNovaInternacaoModal] = useState(false);
  const { toast } = useToast();

  // Dados mock para demonstração
  const mockInternacoes: Internacao[] = [
    {
      id: 1,
      numeroInternacao: 'INT2025001',
      paciente: {
        id: 101,
        nome: 'Maria Silva Santos',
        cpf: '123.456.789-00'
      },
      leito: {
        id: 201,
        numero: '101-A',
        enfermaria: 'Clínica Médica'
      },
      dataInternacao: '2025-01-15',
      horaInternacao: '14:30',
      statusInternacao: 'ATIVA',
      tipoInternacao: 'ELETIVA',
      diasInternacao: 5,
      medicoResponsavel: 'Dr. João Carvalho',
      dataPrevistaAlta: '2025-01-22'
    },
    {
      id: 2,
      numeroInternacao: 'INT2025002',
      paciente: {
        id: 102,
        nome: 'José Carlos Oliveira',
        cpf: '987.654.321-00'
      },
      leito: {
        id: 202,
        numero: '205-B',
        enfermaria: 'UTI'
      },
      dataInternacao: '2025-01-18',
      horaInternacao: '22:15',
      statusInternacao: 'ATIVA',
      tipoInternacao: 'URGENCIA',
      diasInternacao: 2,
      medicoResponsavel: 'Dra. Ana Paula',
      dataPrevistaAlta: '2025-01-25'
    },
    {
      id: 3,
      numeroInternacao: 'INT2025003',
      paciente: {
        id: 103,
        nome: 'Francisca Pereira',
        cpf: '456.789.123-00'
      },
      leito: {
        id: 203,
        numero: '301-C',
        enfermaria: 'Cirurgia'
      },
      dataInternacao: '2025-01-10',
      horaInternacao: '08:00',
      statusInternacao: 'ALTA_MEDICA',
      tipoInternacao: 'ELETIVA',
      diasInternacao: 10,
      medicoResponsavel: 'Dr. Roberto Lima'
    }
  ];

  useEffect(() => {
    setLoading(true);
    // Simular carregamento
    setTimeout(() => {
      setInternacoes(mockInternacoes);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ATIVA': { color: 'bg-green-100 text-green-800', label: 'Ativa' },
      'ALTA_MEDICA': { color: 'bg-blue-100 text-blue-800', label: 'Alta Médica' },
      'ALTA_ADMINISTRATIVA': { color: 'bg-purple-100 text-purple-800', label: 'Alta Admin.' },
      'TRANSFERIDA': { color: 'bg-yellow-100 text-yellow-800', label: 'Transferida' },
      'OBITO': { color: 'bg-red-100 text-red-800', label: 'Óbito' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['ATIVA'];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    const tipoConfig = {
      'ELETIVA': { color: 'bg-blue-100 text-blue-800', label: 'Eletiva' },
      'URGENCIA': { color: 'bg-red-100 text-red-800', label: 'Urgência' },
      'OBSERVACAO': { color: 'bg-yellow-100 text-yellow-800', label: 'Observação' },
      'HOSPITAL_DIA': { color: 'bg-purple-100 text-purple-800', label: 'Hospital Dia' }
    };

    const config = tipoConfig[tipo as keyof typeof tipoConfig] || tipoConfig['ELETIVA'];
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const filteredInternacoes = internacoes.filter(internacao => {
    const matchesSearch =
      internacao.paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internacao.numeroInternacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internacao.leito.numero.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || internacao.statusInternacao === statusFilter;
    const matchesTipo = tipoFilter === 'all' || internacao.tipoInternacao === tipoFilter;

    return matchesSearch && matchesStatus && matchesTipo;
  });

  const handleNovaInternacao = () => {
    setShowNovaInternacaoModal(true);
  };

  const handleVerDetalhes = (internacao: Internacao) => {
    toast({
      title: "Detalhes da Internação",
      description: `Abrindo detalhes da internação ${internacao.numeroInternacao}`
    });
  };

  const handlePreInternacoes = () => {
    toast({
      title: "Pré-Internações",
      description: "Abrindo lista de pré-internações..."
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
          <h1 className="text-3xl font-bold text-gray-900">Internações</h1>
          <p className="text-gray-600">Gerenciamento de internações hospitalares</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handlePreInternacoes}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Pré-Internações
          </Button>
          <Button
            onClick={handleNovaInternacao}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Internação
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Internações Ativas</p>
              <p className="text-2xl font-bold text-green-600">
                {internacoes.filter(i => i.statusInternacao === 'ATIVA').length}
              </p>
            </div>
            <BedDouble className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Altas Hoje</p>
              <p className="text-2xl font-bold text-blue-600">
                {internacoes.filter(i => i.statusInternacao === 'ALTA_MEDICA').length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgências</p>
              <p className="text-2xl font-bold text-red-600">
                {internacoes.filter(i => i.tipoInternacao === 'URGENCIA' && i.statusInternacao === 'ATIVA').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Média Dias</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(internacoes.reduce((acc, i) => acc + i.diasInternacao, 0) / internacoes.length)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
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
                placeholder="Buscar por paciente, número da internação ou leito..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="ATIVA">Ativa</SelectItem>
              <SelectItem value="ALTA_MEDICA">Alta Médica</SelectItem>
              <SelectItem value="ALTA_ADMINISTRATIVA">Alta Administrativa</SelectItem>
              <SelectItem value="TRANSFERIDA">Transferida</SelectItem>
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
              <SelectItem value="HOSPITAL_DIA">Hospital Dia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista de Internações */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Lista de Internações</h2>

          {filteredInternacoes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma internação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInternacoes.map((internacao) => (
                <div
                  key={internacao.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{internacao.paciente.nome}</p>
                        <p className="text-sm text-gray-500">CPF: {internacao.paciente.cpf}</p>
                        <p className="text-sm text-gray-500">Nº: {internacao.numeroInternacao}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">Leito</p>
                        <p className="text-sm text-gray-900">{internacao.leito.numero}</p>
                        <p className="text-sm text-gray-500">{internacao.leito.enfermaria}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">Internação</p>
                        <p className="text-sm text-gray-900">
                          {new Date(internacao.dataInternacao).toLocaleDateString('pt-BR')} - {internacao.horaInternacao}
                        </p>
                        <p className="text-sm text-gray-500">{internacao.diasInternacao} dias</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">Médico</p>
                        <p className="text-sm text-gray-900">{internacao.medicoResponsavel}</p>
                        {internacao.dataPrevistaAlta && (
                          <p className="text-sm text-gray-500">
                            Alta prev.: {new Date(internacao.dataPrevistaAlta).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        {getStatusBadge(internacao.statusInternacao)}
                        {getTipoBadge(internacao.tipoInternacao)}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerDetalhes(internacao)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Nova Internação */}
      <NovaInternacaoModal
        open={showNovaInternacaoModal}
        onOpenChange={setShowNovaInternacaoModal}
      />
    </div>
  );
};

export default InternacoesPage;