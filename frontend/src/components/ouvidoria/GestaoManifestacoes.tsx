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
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Send,
  ArrowRight,
} from "lucide-react";

export const GestaoManifestacoes = () => {
  const { toast } = useToast();
  const [filtroStatus, setFiltroStatus] = useState("todas");
  const [termoBusca, setTermoBusca] = useState("");
  const [manifestacoes, setManifestacoes] = useState([
    {
      id: "001",
      protocolo: "OUV12345678",
      tipo: "reclamacao",
      categoria: "Atendimento Médico",
      status: "nova",
      prioridade: "alta",
      descricao:
        "Demora excessiva no atendimentover médico na UBS Centro. Paciente esperou mais de 3 horas.",
      dataRegistro: new Date("2024-01-15"),
      prazo: new Date("2024-01-20"),
      unidade: "UBS Centro",
      paciente: "João Silva",
      setorResponsavel: null,
      resposta: null,
      anexos: ["documento1.pdf"],
      tramitacoes: [
        {
          data: new Date("2024-01-15"),
          acao: "Manifestação recebida",
          usuario: "Sistema",
        },
      ],
    },
    {
      id: "002",
      protocolo: "OUV12345679",
      tipo: "sugestao",
      categoria: "Infraestrutura",
      status: "em_andamento",
      prioridade: "media",
      descricao:
        "Sugestão para instalação de ar condicionado na sala de espera.",
      dataRegistro: new Date("2024-01-10"),
      prazo: new Date("2024-01-17"),
      unidade: "UBS Jardim das Flores",
      paciente: "Maria Oliveira",
      setorResponsavel: "Infraestrutura",
      resposta: null,
      anexos: [],
      tramitacoes: [
        {
          data: new Date("2024-01-10"),
          acao: "Manifestação recebida",
          usuario: "Sistema",
        },
        {
          data: new Date("2024-01-11"),
          acao: "Encaminhada para análise",
          usuario: "Ouvidor",
        },
      ],
    },
  ]);

  const [manifestacaoSelecionada, setManifestacaoSelecionada] =
    useState<any>(null);

  const getStatusBadge = (status: string, prioridade?: string) => {
    const statusConfig = {
      nova: { label: "Nova", color: "bg-blue-100 text-blue-800" },
      em_andamento: {
        label: "Em Andamento",
        color: "bg-yellow-100 text-yellow-800",
      },
      aguardando_resposta: {
        label: "Aguardando Resposta",
        color: "bg-orange-100 text-orange-800",
      },
      concluida: { label: "Concluída", color: "bg-green-100 text-green-800" },
      atrasada: { label: "Atrasada", color: "bg-red-100 text-red-800" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.nova;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const cores = {
      baixa: "bg-gray-100 text-gray-800",
      media: "bg-yellow-100 text-yellow-800",
      alta: "bg-red-100 text-red-800",
      urgente: "bg-red-600 text-white",
    };
    return (
      <Badge className={cores[prioridade as keyof typeof cores] || cores.media}>
        {prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}
      </Badge>
    );
  };

  const getTipoEmoji = (tipo: string) => {
    const tipos = {
      reclamacao: "⚠️",
      sugestao: "💡",
      elogio: "👏",
      denuncia: "🔍",
      informacao: "❓",
    };
    return tipos[tipo as keyof typeof tipos] || "📝";
  };

  const manifestacoesFiltradas = manifestacoes.filter((m) => {
    const matchStatus = filtroStatus === "todas" || m.status === filtroStatus;
    const matchBusca =
      termoBusca === "" ||
      m.protocolo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      m.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
      (m.paciente &&
        m.paciente.toLowerCase().includes(termoBusca.toLowerCase()));
    return matchStatus && matchBusca;
  });

  const encaminharManifestacao = (manifestacaoId: string, setor: string) => {
    setManifestacoes((prev) =>
      prev.map((m) =>
        m.id === manifestacaoId
          ? {
              ...m,
              status: "em_andamento",
              setorResponsavel: setor,
              tramitacoes: [
                ...m.tramitacoes,
                {
                  data: new Date(),
                  acao: `Encaminhada para ${setor}`,
                  usuario: "Ouvidor",
                },
              ],
            }
          : m,
      ),
    );

    toast({
      title: "Manifestação encaminhada",
      description: `Manifestação enviada para o setor: ${setor}`,
    });
  };

  const adicionarResposta = (manifestacaoId: string, resposta: string) => {
    setManifestacoes((prev) =>
      prev.map((m) =>
        m.id === manifestacaoId
          ? {
              ...m,
              status: "concluida",
              resposta,
              tramitacoes: [
                ...m.tramitacoes,
                {
                  data: new Date(),
                  acao: "Resposta registrada",
                  usuario: "Ouvidor",
                },
              ],
            }
          : m,
      ),
    );

    toast({
      title: "Resposta registrada",
      description: "A manifestação foi respondida e concluída",
    });

    setManifestacaoSelecionada(null);
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por protocolo, descrição ou paciente..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
            </div>
            <div>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border rounded-md"
              >
                <option value="todas">Todos os Status</option>
                <option value="nova">Novas</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="aguardando_resposta">Aguardando Resposta</option>
                <option value="concluida">Concluídas</option>
                <option value="atrasada">Atrasadas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Manifestações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Manifestações ({manifestacoesFiltradas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {manifestacoesFiltradas.map((manifestacao) => (
              <div
                key={manifestacao.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl">
                      {getTipoEmoji(manifestacao.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          Protocolo: {manifestacao.protocolo}
                        </span>
                        {getStatusBadge(manifestacao.status)}
                        {getPrioridadeBadge(manifestacao.prioridade)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Categoria:</span>{" "}
                        {manifestacao.categoria} •
                        <span className="font-medium"> Unidade:</span>{" "}
                        {manifestacao.unidade}
                        {manifestacao.paciente && (
                          <>
                            {" • "}
                            <span className="font-medium">Paciente:</span>{" "}
                            {manifestacao.paciente}
                          </>
                        )}
                      </div>
                      <p className="text-sm mb-2">
                        {manifestacao.descricao.substring(0, 150)}
                        {manifestacao.descricao.length > 150 && "..."}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Registrado:{" "}
                          {manifestacao.dataRegistro.toLocaleDateString(
                            "pt-BR",
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Prazo:{" "}
                          {manifestacao.prazo.toLocaleDateString("pt-BR")}
                        </div>
                        {manifestacao.setorResponsavel && (
                          <div>Setor: {manifestacao.setorResponsavel}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setManifestacaoSelecionada(manifestacao)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {manifestacao.status === "nova" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          encaminharManifestacao(
                            manifestacao.id,
                            "Atendimento Médico",
                          )
                        }
                      >
                        <ArrowRight className="h-4 w-4" />
                        Encaminhar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes da Manifestação */}
      {manifestacaoSelecionada && (
        <Card className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detalhes da Manifestação - {manifestacaoSelecionada.protocolo}
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setManifestacaoSelecionada(null)}
                >
                  Fechar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="detalhes" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                  <TabsTrigger value="tramitacao">Tramitação</TabsTrigger>
                  <TabsTrigger value="resposta">Responder</TabsTrigger>
                </TabsList>

                <TabsContent value="detalhes" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Informações Gerais</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Tipo:</strong> {manifestacaoSelecionada.tipo}
                        </div>
                        <div>
                          <strong>Categoria:</strong>{" "}
                          {manifestacaoSelecionada.categoria}
                        </div>
                        <div>
                          <strong>Status:</strong>{" "}
                          {manifestacaoSelecionada.status}
                        </div>
                        <div>
                          <strong>Prioridade:</strong>{" "}
                          {manifestacaoSelecionada.prioridade}
                        </div>
                        <div>
                          <strong>Data de Registro:</strong>{" "}
                          {manifestacaoSelecionada.dataRegistro.toLocaleDateString(
                            "pt-BR",
                          )}
                        </div>
                        <div>
                          <strong>Prazo:</strong>{" "}
                          {manifestacaoSelecionada.prazo.toLocaleDateString(
                            "pt-BR",
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">
                        Dados do Manifestante
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Paciente:</strong>{" "}
                          {manifestacaoSelecionada.paciente || "Anônimo"}
                        </div>
                        <div>
                          <strong>Unidade:</strong>{" "}
                          {manifestacaoSelecionada.unidade}
                        </div>
                        {manifestacaoSelecionada.setorResponsavel && (
                          <div>
                            <strong>Setor Responsável:</strong>{" "}
                            {manifestacaoSelecionada.setorResponsavel}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">
                      Descrição da Manifestação
                    </h4>
                    <p className="text-sm bg-muted p-3 rounded">
                      {manifestacaoSelecionada.descricao}
                    </p>
                  </div>
                  {manifestacaoSelecionada.anexos.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Anexos</h4>
                      <div className="space-y-2">
                        {manifestacaoSelecionada.anexos.map(
                          (anexo: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <FileText className="h-4 w-4" />
                              <span>{anexo}</span>
                              <Button variant="outline" size="sm">
                                Download
                              </Button>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tramitacao" className="space-y-4">
                  <h4 className="font-medium">Histórico de Tramitação</h4>
                  <div className="space-y-3">
                    {manifestacaoSelecionada.tramitacoes.map(
                      (tramitacao: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 border rounded"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {tramitacao.acao}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {tramitacao.data.toLocaleString("pt-BR")} •{" "}
                              {tramitacao.usuario}
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="resposta" className="space-y-4">
                  <h4 className="font-medium">Responder Manifestação</h4>
                  <div className="space-y-4">
                    <textarea
                      placeholder="Digite a resposta para o manifestante..."
                      className="w-full h-32 p-3 border rounded-md"
                      id="resposta-textarea"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          const textarea = document.getElementById(
                            "resposta-textarea",
                          ) as HTMLTextAreaElement;
                          if (textarea.value.trim()) {
                            adicionarResposta(
                              manifestacaoSelecionada.id,
                              textarea.value,
                            );
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Enviar Resposta
                      </Button>
                      <Button variant="outline">Salvar Rascunho</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
};
