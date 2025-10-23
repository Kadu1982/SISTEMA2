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
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  FileText,
  PieChart,
} from "lucide-react";

export const RelatoriosOuvidoria = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes-atual");

  const relatoriosDisponiveis = [
    {
      id: "manifestacoes-periodo",
      titulo: "Manifestações por Período",
      descricao: "Relatório consolidado de manifestações recebidas",
      icon: BarChart3,
      tipo: "analitico",
    },
    {
      id: "satisfacao-cidadao",
      titulo: "Satisfação do Cidadão",
      descricao: "Análise das pesquisas de satisfação",
      icon: TrendingUp,
      tipo: "analitico",
    },
    {
      id: "tempo-resposta",
      titulo: "Tempo de Resposta",
      descricao: "Análise dos prazos de atendimentover",
      icon: Clock,
      tipo: "performance",
    },
    {
      id: "manifestacoes-unidade",
      titulo: "Manifestações por Unidade",
      descricao: "Distribuição por unidade de saúde",
      icon: Users,
      tipo: "analitico",
    },
    {
      id: "tipos-categoria",
      titulo: "Tipos e Categorias",
      descricao: "Classificação das manifestações",
      icon: PieChart,
      tipo: "analitico",
    },
    {
      id: "cumprimento-prazos",
      titulo: "Cumprimento de Prazos",
      descricao: "Análise de prazos legais",
      icon: Calendar,
      tipo: "compliance",
    },
  ];

  const estatisticasRapidas = {
    totalManifestacoes: 247,
    satisfacaoMedia: 4.2,
    tempoMedioResposta: 3.5,
    taxaCumprimentoPrazos: 87,
    manifestacoesPorTipo: {
      reclamacao: 98,
      sugestao: 67,
      elogio: 45,
      denuncia: 23,
      informacao: 14,
    },
    tendenciaMensal: "+12%",
  };

  const dadosGrafico = [
    { mes: "Jan", manifestacoes: 45, resolvidas: 40 },
    { mes: "Fev", manifestacoes: 52, resolvidas: 48 },
    { mes: "Mar", manifestacoes: 38, resolvidas: 35 },
    { mes: "Abr", manifestacoes: 61, resolvidas: 58 },
    { mes: "Mai", manifestacoes: 55, resolvidas: 51 },
  ];

  const gerarRelatorio = (relatorioId: string) => {
    console.log(
      `Gerando relatório: ${relatorioId} para período: ${periodoSelecionado}`,
    );
    // Simular geração de relatório
    const relatorio = relatoriosDisponiveis.find((r) => r.id === relatorioId);
    if (relatorio) {
      // Em uma implementação real, aqui seria chamada a API para gerar o relatório
      alert(
        `Relatório "${relatorio.titulo}" sendo gerado. Você receberá um e-mail quando estiver pronto.`,
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período de Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "mes-atual", label: "Mês Atual" },
              { id: "trimestre", label: "Último Trimestre" },
              { id: "semestre", label: "Último Semestre" },
              { id: "ano", label: "Ano Atual" },
              { id: "personalizado", label: "Período Personalizado" },
            ].map((periodo) => (
              <Button
                key={periodo.id}
                variant={
                  periodoSelecionado === periodo.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setPeriodoSelecionado(periodo.id)}
              >
                {periodo.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total de Manifestações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticasRapidas.totalManifestacoes}
            </div>
            <p className="text-xs text-muted-foreground">
              {estatisticasRapidas.tendenciaMensal} vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Satisfação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticasRapidas.satisfacaoMedia}/5.0
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em pesquisas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticasRapidas.tempoMedioResposta} dias
            </div>
            <p className="text-xs text-muted-foreground">Tempo de resposta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Prazos Cumpridos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticasRapidas.taxaCumprimentoPrazos}%
            </div>
            <p className="text-xs text-muted-foreground">Taxa de cumprimento</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tendências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendências Mensais
          </CardTitle>
          <CardDescription>
            Evolução das manifestações e resoluções ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between p-4 bg-muted/50 rounded">
            {dadosGrafico.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 bg-primary rounded-t"
                    style={{ height: `${(item.manifestacoes / 70) * 100}px` }}
                  ></div>
                  <div
                    className="w-8 bg-green-500 rounded-t"
                    style={{ height: `${(item.resolvidas / 70) * 100}px` }}
                  ></div>
                </div>
                <div className="text-xs font-medium">{item.mes}</div>
                <div className="text-xs text-muted-foreground">
                  {item.manifestacoes}/{item.resolvidas}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span className="text-xs">Manifestações</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs">Resolvidas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios Disponíveis
          </CardTitle>
          <CardDescription>
            Gere relatórios detalhados para análise e prestação de contas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatoriosDisponiveis.map((relatorio) => {
              const IconComponent = relatorio.icon;
              return (
                <Card key={relatorio.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <CardTitle className="text-sm">
                          {relatorio.titulo}
                        </CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {relatorio.tipo}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {relatorio.descricao}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => gerarRelatorio(relatorio.id)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Gerar PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => gerarRelatorio(relatorio.id)}
                      >
                        Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Agendados */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Automáticos</CardTitle>
          <CardDescription>
            Configure a geração automática de relatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">
                  Relatório Mensal de Manifestações
                </div>
                <div className="text-sm text-muted-foreground">
                  Enviado todo dia 1º do mês para a gestão
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">
                  Relatório Trimestral de Satisfação
                </div>
                <div className="text-sm text-muted-foreground">
                  Enviado trimestralmente para o Conselho de Saúde
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">Relatório Anual de Ouvidoria</div>
                <div className="text-sm text-muted-foreground">
                  Relatório consolidado anual conforme legislação
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Ativo</Badge>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">
            Configurar Novos Relatórios Automáticos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
