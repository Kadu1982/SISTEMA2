import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Activity, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import {
  procedimentosRapidosService,
  ProcedimentoRapidoDTO,
  StatusProcedimento,
  SituacaoAtividade,
} from "@/services/procedimentosRapidosService";
import { useToast } from "@/hooks/use-toast";
import { AssinaturaDigitalDialog } from "./AssinaturaDigitalDialog";
import { ChecklistCincoCertosDialog } from "./ChecklistCincoCertosDialog";
import EscalaMorseDialog from "./EscalaMorseDialog";
import EscalaBradenDialog from "./EscalaBradenDialog";
import EscalaFugulinDialog from "./EscalaFugulinDialog";
import EscalaGlasgowDialog from "./EscalaGlasgowDialog";
import EscalaEVADialog from "./EscalaEVADialog";
import AprazarAtividadeDialog from "./AprazarAtividadeDialog";
import HistoricoProcedimentoRapido from "./HistoricoProcedimentoRapido";

interface DetalhesProcedimentoRapidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedimentoId: number;
  operadorId: number;
  onSuccess?: () => void;
}

/**
 * Dialog para visualizar e gerenciar detalhes completos de um Procedimento Rápido
 */
export const DetalhesProcedimentoRapidoDialog: React.FC<
  DetalhesProcedimentoRapidoDialogProps
> = ({ open, onOpenChange, procedimentoId, operadorId, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [procedimento, setProcedimento] = useState<ProcedimentoRapidoDTO | null>(null);
  const [assinaturaDialogOpen, setAssinaturaDialogOpen] = useState(false);
  const [checklistDialogOpen, setChecklistDialogOpen] = useState(false);
  const [escalaDialogOpen, setEscalaDialogOpen] = useState(false);
  const [escalaTipo, setEscalaTipo] = useState<
    "morse" | "braden" | "fugulin" | "glasgow" | "eva" | null
  >(null);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<number | null>(null);
  const [aprazarDialogOpen, setAprazarDialogOpen] = useState(false);
  const [atividadeParaAprazar, setAtividadeParaAprazar] = useState<any | null>(null);

  useEffect(() => {
    if (open && procedimentoId) {
      carregarDetalhes();
    }
  }, [open, procedimentoId]);

  const carregarDetalhes = async () => {
    try {
      setLoading(true);
      const data = await procedimentosRapidosService.buscarPorId(procedimentoId);
      setProcedimento(data);
    } catch (error: any) {
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Erro ao carregar detalhes do procedimento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <Badge variant="outline" className="bg-green-50">
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

  const formatarDataHora = (dataStr?: string) => {
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

  const handleAssinarAtividade = (atividadeId: number) => {
    setAtividadeSelecionada(atividadeId);
    setAssinaturaDialogOpen(true);
  };

  const handleAbrirEscala = (tipo: "morse" | "braden" | "fugulin" | "glasgow" | "eva") => {
    setEscalaTipo(tipo);
    setEscalaDialogOpen(true);
  };

  if (loading && !procedimento) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carregando Procedimento</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!procedimento) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Procedimento Rápido #{procedimento.id}
            </DialogTitle>
            <DialogDescription>
              Detalhes completos do procedimento de cuidados de enfermagem
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="atividades">Atividades</TabsTrigger>
              <TabsTrigger value="escalas">Escalas</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Paciente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-medium">{procedimento.pacienteNome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Idade</p>
                      <p className="font-medium">{procedimento.pacienteIdade || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CPF</p>
                      <p className="font-medium">{procedimento.pacienteCpf || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStatusBadge(procedimento.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações do Procedimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Médico Solicitante</p>
                      <p className="font-medium">{procedimento.medicoSolicitante || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Origem</p>
                      <p className="font-medium">{procedimento.origemEncaminhamento || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Criação</p>
                      <p className="font-medium">{formatarDataHora(procedimento.dataCriacao)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Operador Responsável</p>
                      <p className="font-medium">
                        {procedimento.operadorResponsavelNome || "-"}
                      </p>
                    </div>
                  </div>
                  {procedimento.alergias && (
                    <div>
                      <p className="text-sm text-muted-foreground">Alergias</p>
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <p className="font-medium">{procedimento.alergias}</p>
                      </Alert>
                    </div>
                  )}
                  {procedimento.observacoesGerais && (
                    <div>
                      <p className="text-sm text-muted-foreground">Observações Gerais</p>
                      <p className="mt-1">{procedimento.observacoesGerais}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="atividades" className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle>Atividades de Enfermagem</CardTitle>
                <Button size="sm" onClick={() => {}}>
                  Nova Atividade
                </Button>
              </div>

              {procedimento.atividades && procedimento.atividades.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Atividade</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Urgente</TableHead>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {procedimento.atividades.map((atividade) => (
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
                        <TableCell>
                          <div className="flex gap-2">
                            {/* Botão Aprazar - apenas para atividades pendentes e programadas */}
                            {atividade.situacao === SituacaoAtividade.PENDENTE && 
                             atividade.horariosAprazados && 
                             atividade.horariosAprazados.length > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setAtividadeParaAprazar(atividade);
                                  setAprazarDialogOpen(true);
                                }}
                              >
                                Aprazar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => atividade.id && handleAssinarAtividade(atividade.id)}
                            >
                              Assinar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Nenhuma atividade cadastrada
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="escalas" className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle>Escalas de Avaliação</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleAbrirEscala("morse")}>
                    Morse
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAbrirEscala("braden")}>
                    Braden
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAbrirEscala("fugulin")}>
                    Fugulin
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAbrirEscala("glasgow")}>
                    Glasgow
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAbrirEscala("eva")}>
                    EVA
                  </Button>
                </div>
              </div>
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Escalas de avaliação serão exibidas aqui
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historico" className="space-y-4">
              <HistoricoProcedimentoRapido procedimentoId={procedimentoId} />
            </TabsContent>
          </Tabs>
        </DialogContent>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Dialogs auxiliares */}
      {atividadeSelecionada && (
        <>
          <ChecklistCincoCertosDialog
            open={checklistDialogOpen}
            onOpenChange={setChecklistDialogOpen}
            atividadeId={atividadeSelecionada}
            onComplete={() => {
              setChecklistDialogOpen(false);
              setAssinaturaDialogOpen(true);
            }}
          />
          <AssinaturaDigitalDialog
            open={assinaturaDialogOpen}
            onOpenChange={setAssinaturaDialogOpen}
            atividadeId={atividadeSelecionada}
            operadorId={operadorId}
            onSuccess={() => {
              carregarDetalhes();
              onSuccess?.();
            }}
          />
        </>
      )}

      {procedimento && (
        <>
          {escalaTipo === "morse" && (
            <EscalaMorseDialog
              open={escalaDialogOpen}
              onOpenChange={setEscalaDialogOpen}
              pacienteId={procedimento.pacienteId}
              avaliadorId={operadorId}
              onSuccess={() => {
                carregarDetalhes();
                onSuccess?.();
              }}
            />
          )}
          {escalaTipo === "braden" && (
            <EscalaBradenDialog
              open={escalaDialogOpen}
              onOpenChange={setEscalaDialogOpen}
              pacienteId={procedimento.pacienteId}
              avaliadorId={operadorId}
              onSuccess={() => {
                carregarDetalhes();
                onSuccess?.();
              }}
            />
          )}
          {escalaTipo === "fugulin" && (
            <EscalaFugulinDialog
              open={escalaDialogOpen}
              onOpenChange={setEscalaDialogOpen}
              pacienteId={procedimento.pacienteId}
              avaliadorId={operadorId}
              onSuccess={() => {
                carregarDetalhes();
                onSuccess?.();
              }}
            />
          )}
          {escalaTipo === "glasgow" && (
            <EscalaGlasgowDialog
              open={escalaDialogOpen}
              onOpenChange={setEscalaDialogOpen}
              pacienteId={procedimento.pacienteId}
              avaliadorId={operadorId}
              onSuccess={() => {
                carregarDetalhes();
                onSuccess?.();
              }}
            />
          )}
          {escalaTipo === "eva" && (
            <EscalaEVADialog
              open={escalaDialogOpen}
              onOpenChange={setEscalaDialogOpen}
              pacienteId={procedimento.pacienteId}
              avaliadorId={operadorId}
              onSuccess={() => {
                carregarDetalhes();
                onSuccess?.();
              }}
            />
          )}

          {/* Dialog de Aprazamento */}
          {atividadeParaAprazar && procedimento && (
            <AprazarAtividadeDialog
              open={aprazarDialogOpen}
              onOpenChange={(open) => {
                setAprazarDialogOpen(open);
                if (!open) {
                  setAtividadeParaAprazar(null);
                }
              }}
              atividade={atividadeParaAprazar}
              procedimentoId={procedimento.id}
              onSuccess={() => {
                carregarDetalhes();
                onSuccess?.();
              }}
            />
          )}
        </>
      )}
    </>
  );
};

export default DetalhesProcedimentoRapidoDialog;

