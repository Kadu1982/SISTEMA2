import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Activity,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { baseCadastro } from "@/services/baseCadastro";

interface SolicitacaoRegulacao {
  id: string;
  pacienteId: string;
  tipoSolicitacao: "ambulatorial" | "internacao" | "procedimento";
  especialidadeOrigem: string;
  especialidadeDestino: string;
  prioridade: "eletiva" | "urgente" | "emergencia";
  procedimentoSolicitado: string;
  cid: string;
  justificativa: string;
  unidadeOrigem: string;
  profissionalSolicitante: string;
  status: "pendente" | "em_analise" | "aprovada" | "negada" | "agendada";
  protocoloSus?: string;
  dataLimite?: Date;
  observacoes?: string;
  criadaEm: Date;
  atualizadaEm: Date;
}

// Mock data para demonstração
const MOCK_SOLICITACOES: SolicitacaoRegulacao[] = [
  {
    id: "sol_001",
    pacienteId: "pac_001",
    tipoSolicitacao: "ambulatorial",
    especialidadeOrigem: "Clínico Geral",
    especialidadeDestino: "Cardiologia",
    prioridade: "urgente",
    procedimentoSolicitado: "Consulta Cardiológica + ECG",
    cid: "I25.9",
    justificativa:
      "Paciente com dor precordial recorrente e histórico familiar de doença coronariana",
    unidadeOrigem: "UBS Central",
    profissionalSolicitante: "Dr. João Silva",
    status: "pendente",
    protocoloSus: "REG2024001234",
    dataLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    criadaEm: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
    atualizadaEm: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "sol_002",
    pacienteId: "pac_002",
    tipoSolicitacao: "procedimento",
    especialidadeOrigem: "Ginecologia",
    especialidadeDestino: "Cirurgia Ginecológica",
    prioridade: "eletiva",
    procedimentoSolicitado: "Histerectomia por videolaparoscopia",
    cid: "N80.9",
    justificativa: "Endometriose severa com falha no tratamento clínico",
    unidadeOrigem: "Hospital Municipal",
    profissionalSolicitante: "Dra. Maria Santos",
    status: "em_analise",
    protocoloSus: "REG2024001235",
    dataLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    criadaEm: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
    atualizadaEm: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "sol_003",
    pacienteId: "pac_003",
    tipoSolicitacao: "internacao",
    especialidadeOrigem: "Emergência",
    especialidadeDestino: "UTI",
    prioridade: "emergencia",
    procedimentoSolicitado: "Internação em UTI",
    cid: "J44.1",
    justificativa: "DPOC exacerbado com insuficiência respiratória",
    unidadeOrigem: "Pronto Socorro",
    profissionalSolicitante: "Dr. Carlos Lima",
    status: "aprovada",
    protocoloSus: "REG2024001236",
    dataLimite: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 24 horas
    criadaEm: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
    atualizadaEm: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
];

export const RegulacaoAmbulatorial = () => {
  const { toast } = useToast();
  const [solicitacoes, setSolicitacoes] =
    useState<SolicitacaoRegulacao[]>(MOCK_SOLICITACOES);
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("");

  const solicitacoesFiltradas = solicitacoes.filter((sol) => {
    return (
      (!filtroStatus || sol.status === filtroStatus) &&
      (!filtroPrioridade || sol.prioridade === filtroPrioridade)
    );
  });

  const aprovarSolicitacao = (solicitacaoId: string) => {
    setSolicitacoes((prev) =>
      prev.map((sol) =>
        sol.id === solicitacaoId
          ? { ...sol, status: "aprovada", atualizadaEm: new Date() }
          : sol,
      ),
    );

    toast({
      title: "Solicitação aprovada",
      description: "A solicitação foi aprovada e encaminhada para recepcao",
    });
  };

  const negarSolicitacao = (solicitacaoId: string) => {
    setSolicitacoes((prev) =>
      prev.map((sol) =>
        sol.id === solicitacaoId
          ? { ...sol, status: "negada", atualizadaEm: new Date() }
          : sol,
      ),
    );

    toast({
      title: "Solicitação negada",
      description: "A solicitação foi negada conforme critérios de regulação",
    });
  };

  const getStatusBadge = (status: SolicitacaoRegulacao["status"]) => {
    const variants = {
      pendente: "bg-amber-100 text-amber-800",
      em_analise: "bg-blue-100 text-blue-800",
      aprovada: "bg-green-100 text-green-800",
      negada: "bg-red-100 text-red-800",
      agendada: "bg-purple-100 text-purple-800",
    };

    const labels = {
      pendente: "Pendente",
      em_analise: "Em Análise",
      aprovada: "Aprovada",
      negada: "Negada",
      agendada: "Agendada",
    };

    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  const getPrioridadeBadge = (
    prioridade: SolicitacaoRegulacao["prioridade"],
  ) => {
    const variants = {
      eletiva: "bg-gray-100 text-gray-800",
      urgente: "bg-amber-100 text-amber-800",
      emergencia: "bg-red-100 text-red-800",
    };

    const labels = {
      eletiva: "Eletiva",
      urgente: "Urgente",
      emergencia: "Emergência",
    };

    return <Badge className={variants[prioridade]}>{labels[prioridade]}</Badge>;
  };

  const getTipoIcon = (tipo: SolicitacaoRegulacao["tipoSolicitacao"]) => {
    switch (tipo) {
      case "ambulatorial":
        return <Activity className="h-4 w-4" />;
      case "internacao":
        return <MapPin className="h-4 w-4" />;
      case "procedimento":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const calcularTempoEspera = (dataCriacao: Date) => {
    const agora = new Date();
    const diffTime = Math.abs(agora.getTime() - dataCriacao.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    return `${diffHours}h`;
  };

  const estatisticas = {
    total: solicitacoes.length,
    pendentes: solicitacoes.filter((s) => s.status === "pendente").length,
    emAnalise: solicitacoes.filter((s) => s.status === "em_analise").length,
    aprovadas: solicitacoes.filter((s) => s.status === "aprovada").length,
    emergencias: solicitacoes.filter((s) => s.prioridade === "emergencia")
      .length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Regulação Ambulatorial</h2>
          <p className="text-muted-foreground">
            Gestão e tramitação de solicitações ambulatoriais e de internação
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
            <p className="text-xs text-muted-foreground">Solicitações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {estatisticas.pendentes}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando análise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {estatisticas.emAnalise}
            </div>
            <p className="text-xs text-muted-foreground">Sendo avaliadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estatisticas.aprovadas}
            </div>
            <p className="text-xs text-muted-foreground">Para agendamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Emergências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {estatisticas.emergencias}
            </div>
            <p className="text-xs text-muted-foreground">Atenção imediata</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="solicitacoes" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
          <TabsTrigger value="emergencias">Emergências</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="solicitacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant={filtroStatus === "" ? "default" : "outline"}
                  onClick={() => setFiltroStatus("")}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={filtroStatus === "pendente" ? "default" : "outline"}
                  onClick={() => setFiltroStatus("pendente")}
                  size="sm"
                >
                  Pendentes
                </Button>
                <Button
                  variant={
                    filtroStatus === "em_analise" ? "default" : "outline"
                  }
                  onClick={() => setFiltroStatus("em_analise")}
                  size="sm"
                >
                  Em Análise
                </Button>
                <Button
                  variant={filtroStatus === "aprovada" ? "default" : "outline"}
                  onClick={() => setFiltroStatus("aprovada")}
                  size="sm"
                >
                  Aprovadas
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {solicitacoesFiltradas
              .sort((a, b) => {
                // Priorizar emergências
                if (
                  a.prioridade === "emergencia" &&
                  b.prioridade !== "emergencia"
                )
                  return -1;
                if (
                  b.prioridade === "emergencia" &&
                  a.prioridade !== "emergencia"
                )
                  return 1;
                // Depois urgentes
                if (a.prioridade === "urgente" && b.prioridade === "eletiva")
                  return -1;
                if (b.prioridade === "urgente" && a.prioridade === "eletiva")
                  return 1;
                // Por último, por data de criação
                return b.criadaEm.getTime() - a.criadaEm.getTime();
              })
              .map((solicitacao) => {
                const paciente = baseCadastro.buscarPaciente(
                  solicitacao.pacienteId,
                );

                return (
                  <Card key={solicitacao.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            {getTipoIcon(solicitacao.tipoSolicitacao)}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {paciente?.nome || "Paciente não encontrado"}
                              </h3>
                              {getPrioridadeBadge(solicitacao.prioridade)}
                              {getStatusBadge(solicitacao.status)}
                            </div>

                            <p className="text-sm text-muted-foreground">
                              Protocolo: {solicitacao.protocoloSus} •
                              {solicitacao.especialidadeOrigem} →{" "}
                              {solicitacao.especialidadeDestino}
                            </p>

                            <p className="text-sm">
                              <strong>Procedimento:</strong>{" "}
                              {solicitacao.procedimentoSolicitado}
                            </p>

                            <p className="text-sm">
                              <strong>CID:</strong> {solicitacao.cid} •
                              <strong>Unidade:</strong>{" "}
                              {solicitacao.unidadeOrigem}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Solicitante: {solicitacao.profissionalSolicitante}{" "}
                              • Tempo de espera:{" "}
                              {calcularTempoEspera(solicitacao.criadaEm)} •
                              {solicitacao.dataLimite &&
                                ` Prazo: ${solicitacao.dataLimite.toLocaleDateString("pt-BR")}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {solicitacao.status === "pendente" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  aprovarSolicitacao(solicitacao.id)
                                }
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => negarSolicitacao(solicitacao.id)}
                                className="flex items-center gap-1"
                              >
                                <XCircle className="h-3 w-3" />
                                Negar
                              </Button>
                            </>
                          )}

                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Detalhes
                          </Button>
                        </div>
                      </div>

                      {solicitacao.justificativa && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-md">
                          <p className="text-sm">
                            <strong>Justificativa:</strong>{" "}
                            {solicitacao.justificativa}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="emergencias">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Solicitações de Emergência
              </CardTitle>
              <CardDescription>
                Solicitações que requerem atenção imediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {solicitacoes
                  .filter((s) => s.prioridade === "emergencia")
                  .map((solicitacao) => {
                    const paciente = baseCadastro.buscarPaciente(
                      solicitacao.pacienteId,
                    );

                    return (
                      <Card
                        key={solicitacao.id}
                        className="border-l-4 border-l-red-500"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-lg">
                                {paciente?.nome || "Paciente não encontrado"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {solicitacao.procedimentoSolicitado}
                              </p>
                              <p className="text-sm text-red-600">
                                <Clock className="h-3 w-3 inline mr-1" />
                                Tempo crítico:{" "}
                                {calcularTempoEspera(solicitacao.criadaEm)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {getStatusBadge(solicitacao.status)}
                              {solicitacao.status === "pendente" && (
                                <Button
                                  onClick={() =>
                                    aprovarSolicitacao(solicitacao.id)
                                  }
                                >
                                  Aprovar Emergência
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Regulação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2.5 dias</div>
                <p className="text-sm text-muted-foreground">
                  Tempo médio entre solicitação e aprovação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">85%</div>
                <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
