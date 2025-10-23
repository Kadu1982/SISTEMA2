import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet, LineChart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Dados de exemplo
const RELATORIOS = [
  {
    id: "producao-mensal",
    nome: "Produção Mensal",
    descricao: "Relatório de produção mensal por procedimento",
    icone: <FileSpreadsheet className="h-8 w-8" />,
  },
  {
    id: "faturamento-anual",
    nome: "Faturamento Anual",
    descricao: "Comparativo anual de faturamento",
    icone: <LineChart className="h-8 w-8" />,
  },
  {
    id: "procedimentos",
    nome: "Procedimentos por Profissional",
    descricao: "Relatório de procedimentos realizados por profissional",
    icone: <FileSpreadsheet className="h-8 w-8" />,
  },
  {
    id: "glosas",
    nome: "Relatório de Glosas",
    descricao: "Análise de glosas e rejeições",
    icone: <FileSpreadsheet className="h-8 w-8" />,
  },
];

// Dados de exemplo para o gráfico
const DATA_FATURAMENTO = [
  { name: "Jan", valor: 85230 },
  { name: "Fev", valor: 82150 },
  { name: "Mar", valor: 91280 },
  { name: "Abr", valor: 87450 },
  { name: "Mai", valor: 90120 },
];

export const RelatoriosFaturamento = () => {
  const { toast } = useToast();
  const [periodo, setPeriodo] = useState("2024");
  const [formato, setFormato] = useState("pdf");

  const handleDownload = (relatorio: string) => {
    toast({
      title: "Download iniciado",
      description: `O relatório "${relatorio}" está sendo baixado.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Período</Label>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Formato</Label>
          <Select value={formato} onValueChange={setFormato}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de Faturamento</CardTitle>
          <CardDescription>
            Visualize a evolução do faturamento nos últimos meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={DATA_FATURAMENTO}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [
                    `R$ ${value.toFixed(2)}`,
                    "Valor",
                  ]}
                />
                <Bar dataKey="valor" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RELATORIOS.map((relatorio) => (
          <Card key={relatorio.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                {relatorio.icone}
              </div>
              <div>
                <CardTitle>{relatorio.nome}</CardTitle>
                <CardDescription>{relatorio.descricao}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                className="w-full"
                onClick={() => handleDownload(relatorio.nome)}
              >
                <Download className="mr-2 h-4 w-4" /> Baixar Relatório
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
