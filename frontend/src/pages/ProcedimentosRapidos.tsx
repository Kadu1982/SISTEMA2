import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Activity, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Pill,
  Stethoscope,
  Syringe,
  FileText,
  Heart,
  Thermometer
} from "lucide-react";
import {
  procedimentosRapidosService,
  ProcedimentoRapidoListDTO,
  StatusProcedimento,
} from "@/services/procedimentosRapidosService";
import { useToast } from "@/hooks/use-toast";
import { useOperador } from "@/contexts/OperadorContext";
import DetalhesProcedimentoRapidoDialog from "@/components/procedimentosrapidos/DetalhesProcedimentoRapidoDialog";
import NovoProcedimentoRapidoDialog from "@/components/procedimentosrapidos/NovoProcedimentoRapidoDialog";
import FiltrosProcedimentosRapidos from "@/components/procedimentosrapidos/FiltrosProcedimentosRapidos";
import CancelarProcedimentoDialog from "@/components/procedimentosrapidos/CancelarProcedimentoDialog";
import VincularUsuarioDialog from "@/components/procedimentosrapidos/VincularUsuarioDialog";
import { format } from "date-fns";
import { X, History, Edit, Unlock, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProcedimentosRapidos = () => {
  const { toast } = useToast();
  const { operador } = useOperador();
  const [loading, setLoading] = useState(false);
  const [aguardando, setAguardando] = useState<ProcedimentoRapidoListDTO[]>([]);
  const [urgentes, setUrgentes] = useState<ProcedimentoRapidoListDTO[]>([]);
  const [todos, setTodos] = useState<ProcedimentoRapidoListDTO[]>([]);
  const [detalhesDialogOpen, setDetalhesDialogOpen] = useState(false);
  const [procedimentoSelecionado, setProcedimentoSelecionado] = useState<number | null>(null);
  const [procedimentoParaCancelar, setProcedimentoParaCancelar] = useState<ProcedimentoRapidoListDTO | null>(null);
  const [cancelarDialogOpen, setCancelarDialogOpen] = useState(false);
  const [procedimentoParaVincular, setProcedimentoParaVincular] = useState<number | null>(null);
  const [vincularDialogOpen, setVincularDialogOpen] = useState(false);
  const [novoProcedimentoDialogOpen, setNovoProcedimentoDialogOpen] = useState(false);
  const [procedimentosCompletos, setProcedimentosCompletos] = useState<Map<number, any>>(new Map());

  // Filtros
  const [dataInicio, setDataInicio] = useState<Date | undefined>(new Date());
  const [dataFim, setDataFim] = useState<Date | undefined>(new Date());
  const [statusesSelecionados, setStatusesSelecionados] = useState<StatusProcedimento[]>([
    StatusProcedimento.AGUARDANDO,
    StatusProcedimento.EM_ATENDIMENTO,
  ]);
  const [especialidade, setEspecialidade] = useState<string>("");
  const [termoPesquisa, setTermoPesquisa] = useState<string>("");

  // Carrega procedimentos aguardando
  const carregarAguardando = async () => {
    try {
      setLoading(true);
      const data = await procedimentosRapidosService.listarAguardando();
      setAguardando(data);
    } catch (error: any) {
      console.error("Erro ao carregar procedimentos aguardando:", error);
      // Silenciar erros de inicialização se não houver dados
      if (error?.response?.status !== 404) {
        toast({
          title: `Erro ${error?.response?.status || ""}`,
          description: error?.response?.data?.message || error?.message || "Erro ao carregar procedimentos",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Carrega procedimentos urgentes
  const carregarUrgentes = async () => {
    try {
      setLoading(true);
      const data = await procedimentosRapidosService.listarUrgentes();
      setUrgentes(data);
    } catch (error: any) {
      console.error("Erro ao carregar procedimentos urgentes:", error);
      // Silenciar erros de inicialização se não houver dados
      if (error?.response?.status !== 404) {
        toast({
          title: `Erro ${error?.response?.status || ""}`,
          description: error?.response?.data?.message || error?.message || "Erro ao carregar procedimentos urgentes",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Carrega todos os procedimentos com filtros
  const carregarTodos = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (dataInicio) {
        params.dataInicio = format(dataInicio, "yyyy-MM-dd'T'00:00:00");
      }
      if (dataFim) {
        params.dataFim = format(dataFim, "yyyy-MM-dd'T'23:59:59");
      }
      if (statusesSelecionados.length > 0) {
        params.statuses = statusesSelecionados;
      }
      if (especialidade) {
        params.especialidade = especialidade;
      }
      if (termoPesquisa) {
        params.termo = termoPesquisa;
      }

      const data = await procedimentosRapidosService.listar(params);
      setTodos(data);
    } catch (error: any) {
      console.error("Erro ao carregar todos os procedimentos:", error);
      const errorMessage = error?.response?.data?.message ||
                          error?.message ||
                          "Erro ao carregar procedimentos";
      const errorStatus = error?.response?.status;

      toast({
        title: `Erro ${errorStatus || ""}`,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Limpa todos os filtros
  const limparFiltros = () => {
    setDataInicio(new Date());
    setDataFim(new Date());
    setStatusesSelecionados([StatusProcedimento.AGUARDANDO, StatusProcedimento.EM_ATENDIMENTO]);
    setEspecialidade("");
    setTermoPesquisa("");
  };

  useEffect(() => {
    carregarAguardando();
    carregarUrgentes();
    carregarTodos();
  }, [dataInicio, dataFim, statusesSelecionados, especialidade, termoPesquisa]);

  // Retorna badge de status
  const getStatusBadge = (status: StatusProcedimento) => {
    switch (status) {
      case StatusProcedimento.AGUARDANDO:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Aguardando</Badge>;
      case StatusProcedimento.EM_ATENDIMENTO:
        return <Badge variant="default"><Activity className="w-3 h-3 mr-1" />Em Atendimento</Badge>;
      case StatusProcedimento.FINALIZADO:
        return <Badge variant="outline" className="bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />Finalizado</Badge>;
      case StatusProcedimento.CANCELADO:
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Formata data/hora
  const formatarDataHora = (dataStr: string) => {
    if (!dataStr) return "-";
    const data = new Date(dataStr);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calcula tempo de espera em minutos
  const calcularTempoEspera = (dataCriacao: string, dataInicioAtendimento?: string): number => {
    if (!dataCriacao) return 0;
    const inicio = dataInicioAtendimento ? new Date(dataInicioAtendimento) : new Date();
    const criacao = new Date(dataCriacao);
    const diffMs = inicio.getTime() - criacao.getTime();
    return Math.floor(diffMs / (1000 * 60)); // minutos
  };

  // Retorna cor do indicador de tempo de espera
  const getCorTempoEspera = (tempoMinutos: number, temUrgente: boolean): "green" | "red" => {
    // Se tem urgente, sempre vermelho
    if (temUrgente) return "red";
    // Se mais de 30 minutos, vermelho
    if (tempoMinutos > 30) return "red";
    // Caso contrário, verde
    return "green";
  };

  // Retorna ícone de atividade baseado no tipo
  const getIconeAtividade = (tipo: string) => {
    switch (tipo?.toUpperCase()) {
      case "VACINAS":
        return <Syringe className="w-4 h-4" />;
      case "PROCEDIMENTOS":
        return <Stethoscope className="w-4 h-4" />;
      case "MEDICAMENTOS":
        return <Pill className="w-4 h-4" />;
      case "SINAIS_VITAIS":
        return <Thermometer className="w-4 h-4" />;
      case "CUIDADOS":
        return <Heart className="w-4 h-4" />;
      case "EXAMES":
        return <FileText className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // Retorna cor do indicador de atividade
  const getCorIndicadorAtividade = (situacao: string, urgente: boolean): "blue" | "green" | "red" => {
    if (urgente) return "red";
    if (situacao === "EXECUTADO") return "green";
    return "blue"; // Pendente
  };

  // Renderiza tabela de procedimentos
  const renderTabela = (procedimentos: ProcedimentoRapidoListDTO[]) => {
    if (loading) {
      return (
        <div className="text-center py-8 text-gray-500">
          Carregando procedimentos...
        </div>
      );
    }

    if (procedimentos.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Nenhum procedimento encontrado
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Idade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Médico Solicitante</TableHead>
            <TableHead>Atividades</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead className="w-[100px]">Tempo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {procedimentos.map((proc) => {
            const tempoEspera = calcularTempoEspera(proc.dataCriacao, proc.dataHoraInicioAtendimento);
            const corTempo = getCorTempoEspera(tempoEspera, proc.temAtividadesUrgentes || false);
            
            return (
            <TableRow key={proc.id} className={proc.temAtividadesUrgentes ? "bg-red-50" : ""}>
              <TableCell className="font-medium">#{proc.id}</TableCell>
              {/* Indicadores de atividade */}
              <TableCell>
                <div className="flex flex-col gap-1 items-center">
                  {/* Ícones de atividade - placeholder, será preenchido com dados reais quando disponível */}
                  <div className="flex gap-1">
                    {proc.temAtividadesUrgentes && (
                      <div 
                        className="w-3 h-3 rounded-full bg-red-500"
                        title="Atividade Urgente"
                      />
                    )}
                    {proc.quantidadeAtividadesPendentes && proc.quantidadeAtividadesPendentes > 0 && (
                      <div 
                        className="w-3 h-3 rounded-full bg-blue-500"
                        title={`${proc.quantidadeAtividadesPendentes} atividade(s) pendente(s)`}
                      />
                    )}
                    {proc.quantidadeAtividadesTotal && 
                     proc.quantidadeAtividadesPendentes && 
                     proc.quantidadeAtividadesTotal - proc.quantidadeAtividadesPendentes > 0 && (
                      <div 
                        className="w-3 h-3 rounded-full bg-green-500"
                        title={`${proc.quantidadeAtividadesTotal - proc.quantidadeAtividadesPendentes} atividade(s) executada(s)`}
                      />
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {proc.pacienteNome}
                  {proc.bloqueado && (
                    <Badge variant="outline" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Bloqueado
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{proc.pacienteIdade || "-"}</TableCell>
              <TableCell>{getStatusBadge(proc.status)}</TableCell>
              <TableCell>{proc.medicoSolicitante || "-"}</TableCell>
              <TableCell>
                <div className="flex gap-2 items-center">
                  <Badge variant={proc.quantidadeAtividadesPendentes ? "default" : "secondary"}>
                    {proc.quantidadeAtividadesPendentes || 0} pendentes
                  </Badge>
                  {proc.temAtividadesUrgentes && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Urgente
                    </Badge>
                  )}
                  {proc.temAtividadesAtrasadas && (
                    <Badge variant="destructive" className="text-xs">
                      Atrasada
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-xs">{proc.origemEncaminhamento || "-"}</TableCell>
              <TableCell className="text-xs">
                {formatarDataHora(proc.dataHoraInicioAtendimento || proc.dataCriacao)}
              </TableCell>
              {/* Indicador de tempo de espera */}
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock 
                    className={`w-4 h-4 ${
                      corTempo === "red" ? "text-red-500" : "text-green-500"
                    }`} 
                  />
                  <span className={`text-xs ${
                    corTempo === "red" ? "text-red-600 font-semibold" : "text-green-600"
                  }`}>
                    {tempoEspera > 0 ? `${tempoEspera}min` : "<1min"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {/* Botão Ver Detalhes/Editar */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setProcedimentoSelecionado(proc.id);
                      setDetalhesDialogOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    {proc.status === StatusProcedimento.AGUARDANDO || 
                     proc.status === StatusProcedimento.EM_ATENDIMENTO 
                     ? "Editar" 
                     : "Detalhes"}
                  </Button>

                  {/* Menu de ações por situação */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        Ações
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Botão Histórico - para Em Observação e Procedimentos Rápidos */}
                      {(proc.status === StatusProcedimento.EM_ATENDIMENTO || 
                        proc.status === StatusProcedimento.FINALIZADO) && (
                        <DropdownMenuItem
                          onClick={() => {
                            setProcedimentoSelecionado(proc.id);
                            setDetalhesDialogOpen(true);
                          }}
                        >
                          <History className="h-4 w-4 mr-2" />
                          Histórico
                        </DropdownMenuItem>
                      )}

                      {/* Botão Cancelar - para Recepcionado/Triado/Aguardando */}
                      {(proc.status === StatusProcedimento.AGUARDANDO || 
                        proc.status === StatusProcedimento.EM_ATENDIMENTO) && (
                        <DropdownMenuItem
                          onClick={() => {
                            // Busca dados completos do procedimento
                            procedimentosRapidosService.buscarPorId(proc.id)
                              .then((procedimentoCompleto) => {
                                setProcedimentoParaCancelar({
                                  ...proc,
                                  temAtividadesPendentes: procedimentoCompleto.temAtividadesPendentes,
                                  quantidadeAtividadesPendentes: procedimentoCompleto.quantidadeAtividadesPendentes,
                                } as any);
                                setCancelarDialogOpen(true);
                              })
                              .catch((error) => {
                                toast({
                                  title: "Erro",
                                  description: "Erro ao carregar dados do procedimento",
                                  variant: "destructive",
                                });
                              });
                          }}
                          className="text-red-600"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </DropdownMenuItem>
                      )}

                      {/* Botão Desbloquear - para procedimentos bloqueados */}
                      {proc.bloqueado && operador && (
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              await procedimentosRapidosService.desbloquear(proc.id, Number(operador.id));
                              toast({
                                title: "Sucesso",
                                description: "Procedimento desbloqueado com sucesso",
                              });
                              carregarAguardando();
                              carregarUrgentes();
                              carregarTodos();
                            } catch (error: any) {
                              toast({
                                title: "Erro",
                                description: error?.response?.data?.message || "Erro ao desbloquear procedimento",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Unlock className="h-4 w-4 mr-2" />
                          Desbloquear
                        </DropdownMenuItem>
                      )}

                      {/* Botão Vincular Usuário - para procedimentos sem paciente identificado */}
                      {/* Nota: Esta funcionalidade será exibida quando o procedimento não tiver paciente vinculado */}
                      {!proc.pacienteNome && (
                        <DropdownMenuItem
                          onClick={() => {
                            setProcedimentoParaVincular(proc.id);
                            setVincularDialogOpen(true);
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Vincular Usuário
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Activity className="mr-2 h-6 w-6" />
          Procedimentos Rápidos
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              carregarAguardando();
              carregarUrgentes();
              carregarTodos();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setNovoProcedimentoDialogOpen(true)}>
            Novo Procedimento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <FiltrosProcedimentosRapidos
        dataInicio={dataInicio}
        dataFim={dataFim}
        statusesSelecionados={statusesSelecionados}
        especialidade={especialidade}
        termoPesquisa={termoPesquisa}
        onDataInicioChange={setDataInicio}
        onDataFimChange={setDataFim}
        onStatusesChange={setStatusesSelecionados}
        onEspecialidadeChange={setEspecialidade}
        onTermoPesquisaChange={setTermoPesquisa}
        onLimparFiltros={limparFiltros}
      />

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aguardando.length}</div>
            <p className="text-xs text-muted-foreground">
              Procedimentos aguardando atendimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{urgentes.length}</div>
            <p className="text-xs text-muted-foreground">
              Procedimentos com atividades urgentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todos.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de procedimentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de listagem */}
      <Tabs defaultValue="aguardando" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="aguardando">Aguardando ({aguardando.length})</TabsTrigger>
          <TabsTrigger value="urgentes">Urgentes ({urgentes.length})</TabsTrigger>
          <TabsTrigger value="todos">Todos ({todos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="aguardando">
          <Card>
            <CardHeader>
              <CardTitle>Procedimentos Aguardando Atendimento</CardTitle>
              <CardDescription>
                Lista de procedimentos rápidos aguardando atendimento de enfermagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTabela(aguardando)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urgentes">
          <Card>
            <CardHeader>
              <CardTitle>Procedimentos Urgentes</CardTitle>
              <CardDescription>
                Procedimentos com atividades marcadas como urgentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTabela(urgentes)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="todos">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Procedimentos</CardTitle>
              <CardDescription>
                Listagem completa de todos os procedimentos rápidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTabela(todos)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Novo Procedimento */}
      <NovoProcedimentoRapidoDialog
        open={novoProcedimentoDialogOpen}
        onOpenChange={setNovoProcedimentoDialogOpen}
        onSuccess={() => {
          carregarAguardando();
          carregarUrgentes();
          carregarTodos();
        }}
      />

      {/* Dialog de Detalhes */}
      {procedimentoSelecionado && operador && (
        <DetalhesProcedimentoRapidoDialog
          open={detalhesDialogOpen}
          onOpenChange={(open) => {
            setDetalhesDialogOpen(open);
            if (!open) {
              setProcedimentoSelecionado(null);
            }
          }}
          procedimentoId={procedimentoSelecionado}
          operadorId={Number(operador.id)}
          onSuccess={() => {
            carregarAguardando();
            carregarUrgentes();
            carregarTodos();
          }}
        />
      )}

      {/* Dialog de Cancelamento */}
      {procedimentoParaCancelar && (
        <CancelarProcedimentoDialog
          open={cancelarDialogOpen}
          onOpenChange={(open) => {
            setCancelarDialogOpen(open);
            if (!open) {
              setProcedimentoParaCancelar(null);
            }
          }}
          procedimento={procedimentoParaCancelar as any}
          onSuccess={() => {
            carregarAguardando();
            carregarUrgentes();
            carregarTodos();
          }}
        />
      )}

      {/* Dialog de Vincular Usuário */}
      {procedimentoParaVincular && (
        <VincularUsuarioDialog
          open={vincularDialogOpen}
          onOpenChange={(open) => {
            setVincularDialogOpen(open);
            if (!open) {
              setProcedimentoParaVincular(null);
            }
          }}
          procedimentoId={procedimentoParaVincular}
          onSuccess={() => {
            carregarAguardando();
            carregarUrgentes();
            carregarTodos();
          }}
        />
      )}
    </div>
  );
};

export default ProcedimentosRapidos;
