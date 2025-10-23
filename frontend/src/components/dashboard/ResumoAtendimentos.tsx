import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { indicadoresPNAB } from "@/data/mockData";
import { TrendingUp, TrendingDown } from "lucide-react";

export const ResumoAtendimentos = () => {
  const indicadores = [
    {
      titulo: "Novos Cadastros",
      valor: indicadoresPNAB.cadastrosAtivos,
      variacao: "+12%",
      tendencia: "up",
      descricao: "Cadastros ativos no território",
    },
    {
      titulo: "Demanda Espontânea",
      valor: indicadoresPNAB.atendimentosDemandaEspontanea,
      variacao: "+8%",
      tendencia: "up",
      descricao: "Atendimentos sem recepcao prévio",
    },
    {
      titulo: "Consultas Agendadas",
      valor: indicadoresPNAB.consultasAgendadas,
      variacao: "-3%",
      tendencia: "down",
      descricao: "Consultas programadas",
    },
    {
      titulo: "Procedimentos",
      valor: indicadoresPNAB.procedimentosRealizados,
      variacao: "+15%",
      tendencia: "up",
      descricao: "Procedimentos realizados",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indicadores.map((indicador, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{indicador.titulo}</CardTitle>
              <CardDescription className="text-sm">
                {indicador.descricao}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {indicador.valor.toLocaleString()}
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    indicador.tendencia === "up"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {indicador.tendencia === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {indicador.variacao}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Indicadores PNAB - Mês Atual
          </CardTitle>
          <CardDescription>
            Métricas baseadas na Política Nacional de Atenção Básica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Medicamentos Dispensados</p>
              <p className="text-2xl font-bold text-blue-600">
                {indicadoresPNAB.medicamentosDispensados}
              </p>
            </div>
            <div>
              <p className="font-medium">Vacinas Aplicadas</p>
              <p className="text-2xl font-bold text-green-600">
                {indicadoresPNAB.vacinasAplicadas}
              </p>
            </div>
            <div>
              <p className="font-medium">Visitas Domiciliares</p>
              <p className="text-2xl font-bold text-purple-600">
                {indicadoresPNAB.visitasDomiciliares}
              </p>
            </div>
            <div>
              <p className="font-medium">Cobertura ESF</p>
              <p className="text-2xl font-bold text-orange-600">
                {indicadoresPNAB.coberturaTerritorial}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
