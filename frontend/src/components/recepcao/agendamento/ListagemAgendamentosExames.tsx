import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Search,
  Filter,
  RefreshCw,
  FileDown,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  CalendarCheck,
  CalendarX
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import agendamentoExameService, { 
  AgendamentoExameDTO,
  statusAgendamentoExame 
} from '@/services/agendamento/agendamentoExameService';
import FormularioAgendamentoExame from './FormularioAgendamentoExame';
import ModalConfirmarAgendamento from './ModalConfirmarAgendamento';
import ModalCancelarAgendamento from './ModalCancelarAgendamento';
import ModalDetalhesAgendamento from './ModalDetalhesAgendamento';
import ModalHistoricoAgendamentosPaciente from './ModalHistoricoAgendamentosPaciente';

interface ListagemAgendamentosExamesProps {
  unidadeId?: number;
  pacienteId?: number;
  profissionalId?: number;
  data?: Date;
}

export default function ListagemAgendamentosExames({
  unidadeId = 1,
  pacienteId,
  profissionalId,
  data
}: ListagemAgendamentosExamesProps) {
  const [agendamentos, setAgendamentos] = useState<AgendamentoExameDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [dataFilter, setDataFilter] = useState(data ? format(data, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  
  // Modais
  const [formOpen, setFormOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [confirmarOpen, setConfirmarOpen] = useState(false);
  const [cancelarOpen, setCancelarOpen] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<AgendamentoExameDTO | null>(null);
  const [historicoOpen, setHistoricoOpen] = useState(false);

  // Estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    agendados: 0,
    confirmados: 0,
    realizados: 0,
    cancelados: 0,
    naoCompareceu: 0
  });

  const carregarAgendamentos = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (pacienteId) {
        response = await agendamentoExameService.listarPorPaciente(pacienteId);
      } else if (profissionalId && dataFilter) {
        response = await agendamentoExameService.buscarAgendaDiaProfissional(profissionalId, dataFilter);
      } else if (dataFilter) {
        response = await agendamentoExameService.listarPorData(dataFilter);
      } else {
        response = await agendamentoExameService.listarPorUnidade(unidadeId);
      }

      let agendamentosFiltrados = response.data;

      // Aplicar filtro de status
      if (statusFilter !== 'TODOS') {
        agendamentosFiltrados = agendamentosFiltrados.filter(a => a.status === statusFilter);
      }

      setAgendamentos(agendamentosFiltrados);
      calcularEstatisticas(agendamentosFiltrados);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }, [pacienteId, profissionalId, dataFilter, statusFilter, unidadeId]);

  useEffect(() => {
    carregarAgendamentos();
  }, [carregarAgendamentos]);

  const calcularEstatisticas = useCallback((lista: AgendamentoExameDTO[]) => {
    const stats = lista.reduce((acc, agendamento) => {
      acc.total++;
      switch (agendamento.status) {
        case 'AGENDADO':
          acc.agendados++;
          break;
        case 'CONFIRMADO':
          acc.confirmados++;
          break;
        case 'REALIZADO':
          acc.realizados++;
          break;
        case 'CANCELADO':
          acc.cancelados++;
          break;
        case 'NAO_COMPARECEU':
          acc.naoCompareceu++;
          break;
      }
      return acc;
    }, {
      total: 0,
      agendados: 0,
      confirmados: 0,
      realizados: 0,
      cancelados: 0,
      naoCompareceu: 0
    });
    
    setEstatisticas(stats);
  }, []);

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter(agendamento => {
      if (!searchTerm) return true;
      
      const termo = searchTerm.toLowerCase();
      return (
        agendamento.protocolo.toLowerCase().includes(termo) ||
        agendamento.pacienteNome.toLowerCase().includes(termo) ||
        agendamento.pacienteCpf?.includes(termo) ||
        agendamento.examesAgendados.some(e => 
          e.exameNome.toLowerCase().includes(termo) ||
          e.exameCodigo.toLowerCase().includes(termo)
        )
      );
    });
  }, [agendamentos, searchTerm]);

  const handleConfirmar = useCallback(async () => {
    if (!agendamentoSelecionado) return;
    
    try {
      await agendamentoExameService.confirmar(agendamentoSelecionado.id!, 'usuario'); // TODO: pegar usuário do contexto
      toast.success('Agendamento confirmado com sucesso!');
      setConfirmarOpen(false);
      carregarAgendamentos();
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      toast.error('Erro ao confirmar agendamento');
    }
  }, [agendamentoSelecionado, carregarAgendamentos]);

  const handleCancelar = useCallback(async (motivo: string) => {
    if (!agendamentoSelecionado) return;
    
    try {
      await agendamentoExameService.cancelar(agendamentoSelecionado.id!, motivo, 'usuario'); // TODO: pegar usuário do contexto
      toast.success('Agendamento cancelado com sucesso!');
      setCancelarOpen(false);
      carregarAgendamentos();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast.error('Erro ao cancelar agendamento');
    }
  }, [agendamentoSelecionado, carregarAgendamentos]);

  const handleMarcarRealizado = useCallback((agendamento: AgendamentoExameDTO) => {
    (async () => {
      try {
        await agendamentoExameService.marcarRealizado(agendamento.id!, 'usuario'); // TODO: pegar usuário do contexto
        toast.success('Exame marcado como realizado!');
        await carregarAgendamentos();
      } catch (error) {
        console.error('Erro ao marcar como realizado:', error);
        toast.error('Erro ao marcar como realizado');
      }
    })();
  }, [carregarAgendamentos]);

  const handleMarcarNaoCompareceu = useCallback((agendamento: AgendamentoExameDTO) => {
    (async () => {
      try {
        await agendamentoExameService.marcarNaoCompareceu(agendamento.id!, 'usuario'); // TODO: pegar usuário do contexto
        toast.success('Marcado como não compareceu!');
        await carregarAgendamentos();
      } catch (error) {
        console.error('Erro ao marcar como não compareceu:', error);
        toast.error('Erro ao marcar como não compareceu');
      }
    })();
  }, [carregarAgendamentos]);

  const handleBaixarComprovante = useCallback((agendamento: AgendamentoExameDTO) => {
    (async () => {
      try {
        await agendamentoExameService.baixarComprovante(agendamento.id!);
        toast.success('Comprovante baixado com sucesso!');
      } catch (error) {
        console.error('Erro ao baixar comprovante:', error);
        toast.error('Erro ao baixar comprovante');
      }
    })();
  }, []);

  const getStatusBadge = useCallback((status: AgendamentoExameDTO['status']) => {
    const config = statusAgendamentoExame[status];
    return (
      <Badge variant={config.cor as any}>
        {config.label}
      </Badge>
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{estatisticas.total}</div>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.agendados}</div>
            <p className="text-sm text-gray-600">Agendados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{estatisticas.confirmados}</div>
            <p className="text-sm text-gray-600">Confirmados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">{estatisticas.realizados}</div>
            <p className="text-sm text-gray-600">Realizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{estatisticas.cancelados}</div>
            <p className="text-sm text-gray-600">Cancelados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.naoCompareceu}</div>
            <p className="text-sm text-gray-600">Não Compareceu</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e ações */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos de Exames</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por protocolo, paciente, CPF ou exame..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="date"
                value={dataFilter}
                onChange={(e) => setDataFilter(e.target.value)}
                className="w-40"
              />
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="AGENDADO">Agendado</SelectItem>
                  <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                  <SelectItem value="AGUARDANDO_ATENDIMENTO">Aguardando</SelectItem>
                  <SelectItem value="EM_ATENDIMENTO">Em Atendimento</SelectItem>
                  <SelectItem value="REALIZADO">Realizado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  <SelectItem value="NAO_COMPARECEU">Não Compareceu</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Botão de Histórico no topo: não polui cada linha da grade */}
              {pacienteId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHistoricoOpen(true)}
                >
                  Histórico
                </Button>
              )}

              <Button 
                variant="outline" 
                size="icon"
                onClick={carregarAgendamentos}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button onClick={() => setFormOpen(true)}>
                Novo Agendamento
              </Button>
            </div>
          </div>

          {/* Tabela de agendamentos */}
          <div className="border rounded-md">
            <Table>
              <TableCaption>
                {loading ? 'Carregando...' : `${agendamentosFiltrados.length} agendamento(s) encontrado(s)`}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Exames</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agendamentosFiltrados.map((agendamento) => (
                  <TableRow key={agendamento.id}>
                    <TableCell className="font-mono text-sm">
                      {agendamento.protocolo}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{format(new Date(agendamento.dataHoraExame), 'dd/MM/yyyy')}</span>
                        <Clock className="w-4 h-4 text-gray-500 ml-2" />
                        <span>{format(new Date(agendamento.dataHoraExame), 'HH:mm')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{agendamento.pacienteNome}</div>
                        <div className="text-sm text-gray-500">CPF: {agendamento.pacienteCpf}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {agendamento.examesAgendados.slice(0, 2).map((exame, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {exame.exameNome}
                          </Badge>
                        ))}
                        {agendamento.examesAgendados.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{agendamento.examesAgendados.length - 2} exame(s)
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(agendamento.status)}
                        {agendamento.prioridade && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Prioridade
                          </Badge>
                        )}
                        {agendamento.encaixe && (
                          <Badge variant="secondary" className="text-xs">
                            Encaixe
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {agendamento.profissionalNome || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setAgendamentoSelecionado(agendamento);
                              setDetalhesOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {agendamento.podeSerConfirmado && (
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                setAgendamentoSelecionado(agendamento);
                                setConfirmarOpen(true);
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirmar
                            </DropdownMenuItem>
                          )}
                          
                          {agendamento.podeSerRealizado && (
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                handleMarcarRealizado(agendamento);
                              }}
                            >
                              <CalendarCheck className="w-4 h-4 mr-2" />
                              Marcar como Realizado
                            </DropdownMenuItem>
                          )}
                          
                          {/* Botão de cancelamento: exibir para todos que não foram cancelados ou realizados */}
                          {(agendamento.status !== 'CANCELADO' && agendamento.status !== 'REALIZADO') && (
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                setAgendamentoSelecionado(agendamento);
                                setCancelarOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancelar
                            </DropdownMenuItem>
                          )}
                          
                          {agendamento.status === 'CONFIRMADO' && (
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                handleMarcarNaoCompareceu(agendamento);
                              }}
                              className="text-orange-600"
                            >
                              <CalendarX className="w-4 h-4 mr-2" />
                              Não Compareceu
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              handleBaixarComprovante(agendamento);
                            }}
                          >
                            <FileDown className="w-4 h-4 mr-2" />
                            Baixar Comprovante
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      <FormularioAgendamentoExame
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={carregarAgendamentos}
        pacienteId={pacienteId}
        unidadeId={unidadeId}
      />

      {agendamentoSelecionado && (
        <>
          <ModalDetalhesAgendamento
            open={detalhesOpen}
            onOpenChange={setDetalhesOpen}
            agendamento={agendamentoSelecionado}
          />

          <ModalConfirmarAgendamento
            open={confirmarOpen}
            onOpenChange={setConfirmarOpen}
            agendamento={agendamentoSelecionado}
            onConfirm={handleConfirmar}
          />

          <ModalCancelarAgendamento
            open={cancelarOpen}
            onOpenChange={setCancelarOpen}
            agendamento={agendamentoSelecionado}
            onCancelar={handleCancelar}
          />
        </>
      )}

      {/* Modal de Histórico por paciente (abre por botão no topo) */}
      {pacienteId && (
        <ModalHistoricoAgendamentosPaciente
          open={historicoOpen}
          onOpenChange={setHistoricoOpen}
          pacienteId={pacienteId}
        />
      )}
    </div>
  );
}