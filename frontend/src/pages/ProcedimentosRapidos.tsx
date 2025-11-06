import React, { useEffect, useState } from "react";
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
import { Activity, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import {
  procedimentosRapidosService,
  ProcedimentoRapidoListDTO,
  StatusProcedimento,
} from "@/services/procedimentosRapidosService";
import { useToast } from "@/hooks/use-toast";

const ProcedimentosRapidos = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [aguardando, setAguardando] = useState<ProcedimentoRapidoListDTO[]>([]);
  const [urgentes, setUrgentes] = useState<ProcedimentoRapidoListDTO[]>([]);
  const [todos, setTodos] = useState<ProcedimentoRapidoListDTO[]>([]);

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

  // Carrega todos os procedimentos
  const carregarTodos = async () => {
    try {
      setLoading(true);
      const data = await procedimentosRapidosService.listar();
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

  useEffect(() => {
    carregarAguardando();
    carregarUrgentes();
    carregarTodos();
  }, []);

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
            <TableHead>Paciente</TableHead>
            <TableHead>Idade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Médico Solicitante</TableHead>
            <TableHead>Atividades</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {procedimentos.map((proc) => (
            <TableRow key={proc.id} className={proc.temAtividadesUrgentes ? "bg-red-50" : ""}>
              <TableCell className="font-medium">#{proc.id}</TableCell>
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
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Em desenvolvimento",
                      description: `Visualizar detalhes do procedimento #${proc.id}`,
                    });
                  }}
                >
                  Ver Detalhes
                </Button>
              </TableCell>
            </TableRow>
          ))}
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
        <Button
          onClick={() => {
            toast({
              title: "Em desenvolvimento",
              description: "Funcionalidade de criar novo procedimento em desenvolvimento",
            });
          }}
        >
          Novo Procedimento
        </Button>
      </div>

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
    </div>
  );
};

export default ProcedimentosRapidos;
