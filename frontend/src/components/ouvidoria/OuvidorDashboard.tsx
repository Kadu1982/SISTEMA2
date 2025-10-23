import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  Timer,
  BarChart3,
} from "lucide-react";

export const OuvidorDashboard = () => {
  const [estatisticas, setEstatisticas] = useState({
    totalManifestacoes: 0,
    novas: 0,
    emAndamento: 0,
    concluidas: 0,
    atrasadas: 0,
    satisfacaoMedia: 0,
    tempoMedioResposta: 0,
    manifestacoesPorTipo: {} as Record<string, number>,
  });

  useEffect(() => {
    // Simular carregamento de dados
    setEstatisticas({
      totalManifestacoes: 247,
      novas: 12,
      emAndamento: 35,
      concluidas: 189,
      atrasadas: 11,
      satisfacaoMedia: 4.2,
      tempoMedioResposta: 3.5,
      manifestacoesPorTipo: {
        reclamacao: 98,
        sugestao: 67,
        elogio: 45,
        denuncia: 23,
        informacao: 14,
      },
    });
  }, []);

  const manifestacoesRecentes = [
    {
      id: "001",
      protocolo: "OUV12345678",
      tipo: "reclamacao",
      categoria: "Atendimento Médico",
      status: "nova",
      prazo: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      unidade: "UBS Centro",
    },
    {
      id: "002",
      protocolo: "OUV12345679",
      tipo: "sugestao",
      categoria: "Infraestrutura",
      status: "em_andamento",
      prazo: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      unidade: "UBS Jardim das Flores",
    },
    {
      id: "003",
      protocolo: "OUV12345680",
      tipo: "elogio",
      categoria: "Atendimento de Enfermagem",
      status: "atrasada",
      prazo: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      unidade: "UBS Vila Nova",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      nova: {
        label: "Nova",
        variant: "default" as const,
        color: "bg-blue-100 text-blue-800",
      },
      em_andamento: {
        label: "Em Andamento",
        variant: "secondary" as const,
        color: "bg-yellow-100 text-yellow-800",
      },
      concluida: {
        label: "Concluída",
        variant: "outline" as const,
        color: "bg-green-100 text-green-800",
      },
      atrasada: {
        label: "Atrasada",
        variant: "destructive" as const,
        color: "bg-red-100 text-red-800",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.nova;
    return <Badge className={config.color}>{config.label}</Badge>;
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

  return (
    <div className="space-y-6">
      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Total de Manifestações
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.totalManifestacoes}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Novas Manifestações
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.novas}</div>
            <p className="text-xs text-muted-foreground">Aguardando análise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Em Andamento
              </CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.emAndamento}</div>
            <p className="text-xs text-muted-foreground">Sendo processadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Manifestações Atrasadas
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {estatisticas.atrasadas}
            </div>
            <p className="text-xs text-muted-foreground">
              Requer atenção urgente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Taxa de Resolução
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (estatisticas.concluidas / estatisticas.totalManifestacoes) *
                  100,
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.concluidas} de {estatisticas.totalManifestacoes}{" "}
              manifestações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Satisfação Média
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.satisfacaoMedia.toFixed(1)}/5.0
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em pesquisas de satisfação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Tempo Médio de Resposta
              </CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.tempoMedioResposta} dias
            </div>
            <p className="text-xs text-muted-foreground">Meta: 5 dias úteis</p>
          </CardContent>
        </Card>
      </div>

      {/* Manifestações por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição por Tipo de Manifestação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(estatisticas.manifestacoesPorTipo).map(
              ([tipo, quantidade]) => (
                <div key={tipo} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">{getTipoEmoji(tipo)}</div>
                  <div className="text-lg font-bold">{quantidade}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {tipo}
                  </div>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manifestações Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Manifestações Recentes
            </CardTitle>
            <Button variant="outline" size="sm">
              Ver Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {manifestacoesRecentes.map((manifestacao) => (
              <div
                key={manifestacao.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-xl">
                    {getTipoEmoji(manifestacao.tipo)}
                  </div>
                  <div>
                    <div className="font-medium">
                      Protocolo: {manifestacao.protocolo}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {manifestacao.categoria} • {manifestacao.unidade}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Prazo: {manifestacao.prazo.toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(manifestacao.status)}
                  <Button variant="outline" size="sm">
                    Visualizar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Avisos */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            Alertas e Avisos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-orange-900">
                  {estatisticas.atrasadas} manifestações estão atrasadas
                </div>
                <div className="text-sm text-orange-700">
                  Requerem atenção imediata para cumprimento dos prazos legais
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-orange-900">
                  12 manifestações aguardando análise inicial
                </div>
                <div className="text-sm text-orange-700">
                  Prazo de 72h para primeira análise
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
