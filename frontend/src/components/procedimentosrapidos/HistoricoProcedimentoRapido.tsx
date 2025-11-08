import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Clock, CheckCircle, XCircle, Activity, AlertCircle, History } from "lucide-react";
import { procedimentosRapidosService, ProcedimentoRapidoDTO, StatusProcedimento, SituacaoAtividade } from "@/services/procedimentosRapidosService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HistoricoProcedimentoRapidoProps {
  procedimentoId: number;
}

const HistoricoProcedimentoRapido: React.FC<HistoricoProcedimentoRapidoProps> = ({
  procedimentoId,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<ProcedimentoRapidoDTO | null>(null);

  useEffect(() => {
    if (procedimentoId) {
      carregarHistorico();
    }
  }, [procedimentoId]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      const data = await procedimentosRapidosService.obterHistorico(procedimentoId);
      setHistorico(data);
    } catch (error: any) {
      console.error("Erro ao carregar histórico:", error);
      toast({
        title: "Erro",
        description: error?.response?.data?.message || error?.message || "Erro ao carregar histórico",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatarDataHora = (dataStr?: string) => {
    if (!dataStr) return "-";
    try {
      const data = new Date(dataStr);
      return format(data, "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const getStatusBadge = (status: StatusProcedimento) => {
    switch (status) {
      case StatusProcedimento.AGUARDANDO:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Aguardando
          </Badge>
        );
      case StatusProcedimento.EM_ATENDIMENTO:
        return (
          <Badge variant="default">
            <Activity className="w-3 h-3 mr-1" />
            Em Atendimento
          </Badge>
        );
      case StatusProcedimento.FINALIZADO:
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Finalizado
          </Badge>
        );
      case StatusProcedimento.CANCELADO:
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getSituacaoBadge = (situacao?: SituacaoAtividade) => {
    switch (situacao) {
      case SituacaoAtividade.PENDENTE:
        return <Badge variant="secondary">Pendente</Badge>;
      case SituacaoAtividade.EM_EXECUCAO:
        return <Badge variant="default">Em Execução</Badge>;
      case SituacaoAtividade.EXECUTADO:
        return <Badge className="bg-green-100 text-green-800">Executado</Badge>;
      case SituacaoAtividade.CANCELADO:
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico Completo do Procedimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Carregando histórico...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!historico) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico Completo do Procedimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Nenhum histórico encontrado</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico Completo do Procedimento #{historico.id}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Procedimento */}
          <div>
            <h3 className="font-semibold mb-2">Informações do Procedimento</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="mt-1">{getStatusBadge(historico.status)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Paciente:</span>
                <div className="mt-1 font-medium">{historico.pacienteNome}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Data de Criação:</span>
                <div className="mt-1">{formatarDataHora(historico.dataCriacao)}</div>
              </div>
              {historico.dataHoraInicioAtendimento && (
                <div>
                  <span className="text-muted-foreground">Início do Atendimento:</span>
                  <div className="mt-1">{formatarDataHora(historico.dataHoraInicioAtendimento)}</div>
                </div>
              )}
              {historico.dataHoraFimAtendimento && (
                <div>
                  <span className="text-muted-foreground">Fim do Atendimento:</span>
                  <div className="mt-1">{formatarDataHora(historico.dataHoraFimAtendimento)}</div>
                </div>
              )}
              {historico.canceladoPor && (
                <div>
                  <span className="text-muted-foreground">Cancelado por:</span>
                  <div className="mt-1">{historico.canceladoPor}</div>
                </div>
              )}
              {historico.motivoCancelamento && (
                <div>
                  <span className="text-muted-foreground">Motivo do Cancelamento:</span>
                  <div className="mt-1">{historico.motivoCancelamento}</div>
                </div>
              )}
            </div>
          </div>

          {/* Histórico de Atividades */}
          {historico.atividades && historico.atividades.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Histórico de Atividades</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atividade</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Urgente</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Data/Hora Inicial</TableHead>
                    <TableHead>Data/Hora Final</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historico.atividades.map((atividade) => (
                    <TableRow key={atividade.id}>
                      <TableCell className="font-medium">{atividade.atividade}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{atividade.tipo}</Badge>
                      </TableCell>
                      <TableCell>{getSituacaoBadge(atividade.situacao)}</TableCell>
                      <TableCell>
                        {atividade.urgente ? (
                          <Badge variant="destructive">Urgente</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{atividade.profissional || "-"}</TableCell>
                      <TableCell className="text-xs">
                        {formatarDataHora(atividade.dataHoraInicial)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatarDataHora(atividade.dataHoraFinal)}
                      </TableCell>
                      <TableCell className="text-xs max-w-xs truncate">
                        {atividade.observacoes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Desfecho */}
          {historico.desfecho && (
            <div>
              <h3 className="font-semibold mb-2">Desfecho</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <div className="mt-1">{historico.desfecho.tipo}</div>
                </div>
                {historico.desfecho.setorDestino && (
                  <div>
                    <span className="text-muted-foreground">Setor Destino:</span>
                    <div className="mt-1">{historico.desfecho.setorDestino}</div>
                  </div>
                )}
                {historico.desfecho.especialidade && (
                  <div>
                    <span className="text-muted-foreground">Especialidade:</span>
                    <div className="mt-1">{historico.desfecho.especialidade}</div>
                  </div>
                )}
                {historico.desfecho.dataRegistro && (
                  <div>
                    <span className="text-muted-foreground">Data do Registro:</span>
                    <div className="mt-1">{formatarDataHora(historico.desfecho.dataRegistro)}</div>
                  </div>
                )}
                {historico.desfecho.observacoes && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Observações:</span>
                    <div className="mt-1">{historico.desfecho.observacoes}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Observações Gerais */}
          {historico.observacoesGerais && (
            <div>
              <h3 className="font-semibold mb-2">Observações Gerais</h3>
              <p className="text-sm">{historico.observacoesGerais}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricoProcedimentoRapido;

