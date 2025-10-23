import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  BarChart3,
  Send,
  Eye,
} from "lucide-react";

export const PesquisaSatisfacao = () => {
  const [pesquisas] = useState([
    {
      id: "001",
      manifestacaoProtocolo: "OUV12345678",
      paciente: "João Silva",
      dataEnvio: new Date("2024-01-20"),
      dataResposta: new Date("2024-01-22"),
      status: "respondida",
      nota: 4,
      comentario: "Atendimento foi bom, mas poderia ser mais rápido.",
      categoria: "Atendimento Médico",
    },
    {
      id: "002",
      manifestacaoProtocolo: "OUV12345679",
      paciente: "Maria Oliveira",
      dataEnvio: new Date("2024-01-18"),
      dataResposta: null,
      status: "pendente",
      nota: null,
      comentario: null,
      categoria: "Infraestrutura",
    },
  ]);

  const estatisticas = {
    totalEnviadas: 156,
    totalRespondidas: 89,
    taxaResposta: 57,
    notaMedia: 4.1,
    distribuicaoNotas: {
      5: 42,
      4: 28,
      3: 15,
      2: 3,
      1: 1,
    },
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
      respondida: { label: "Respondida", color: "bg-green-100 text-green-800" },
      expirada: { label: "Expirada", color: "bg-red-100 text-red-800" },
    };

    const statusConfig =
      config[status as keyof typeof config] || config.pendente;
    return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>;
  };

  const renderStars = (nota: number | null) => {
    if (!nota) return <span className="text-muted-foreground">-</span>;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= nota ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{nota}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Pesquisas Enviadas
              </CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.totalEnviadas}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Taxa de Resposta
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.taxaResposta}%
            </div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.totalRespondidas} de {estatisticas.totalEnviadas}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Satisfação Média
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.notaMedia}</div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${star <= Math.round(estatisticas.notaMedia) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Respostas Pendentes
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.totalEnviadas - estatisticas.totalRespondidas}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando resposta</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de Notas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição das Avaliações
          </CardTitle>
          <CardDescription>
            Como os cidadãos estão avaliando nossos serviços
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(estatisticas.distribuicaoNotas)
              .reverse()
              .map(([nota, quantidade]) => (
                <div key={nota} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-16">
                    <span className="text-sm font-medium">{nota}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(quantidade / Math.max(...Object.values(estatisticas.distribuicaoNotas))) * 100}%`,
                      }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {quantidade} respostas
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground w-12">
                    {Math.round(
                      (quantidade / estatisticas.totalRespondidas) * 100,
                    )}
                    %
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pesquisas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pesquisas de Satisfação
          </CardTitle>
          <CardDescription>
            Histórico de pesquisas enviadas e suas respostas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pesquisas.map((pesquisa) => (
              <div key={pesquisa.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">
                        Protocolo: {pesquisa.manifestacaoProtocolo}
                      </span>
                      {getStatusBadge(pesquisa.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Paciente:</div>
                        <div className="font-medium">{pesquisa.paciente}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Categoria:</div>
                        <div>{pesquisa.categoria}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">
                          Data de Envio:
                        </div>
                        <div>
                          {pesquisa.dataEnvio.toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avaliação:</div>
                        <div>{renderStars(pesquisa.nota)}</div>
                      </div>
                    </div>
                    {pesquisa.comentario && (
                      <div className="mt-3 p-3 bg-muted rounded text-sm">
                        <div className="text-muted-foreground mb-1">
                          Comentário:
                        </div>
                        <div>"{pesquisa.comentario}"</div>
                      </div>
                    )}
                    {pesquisa.dataResposta && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Respondida em:{" "}
                        {pesquisa.dataResposta.toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {pesquisa.status === "pendente" && (
                      <Button variant="outline" size="sm">
                        Reenviar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Pesquisa */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Pesquisa</CardTitle>
          <CardDescription>
            Configure como e quando as pesquisas de satisfação são enviadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Envio automático após conclusão
                </label>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Ativar envio automático</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Prazo para resposta (dias)
                </label>
                <input
                  type="number"
                  defaultValue={7}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Texto do e-mail de pesquisa
              </label>
              <textarea
                defaultValue="Sua opinião é muito importante para nós. Por favor, avalie o atendimento recebido."
                className="w-full p-3 border rounded-md h-20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Lembrete automático</label>
              <div className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">
                  Enviar lembrete após 3 dias sem resposta
                </span>
              </div>
            </div>

            <Button className="w-full">Salvar Configurações</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
