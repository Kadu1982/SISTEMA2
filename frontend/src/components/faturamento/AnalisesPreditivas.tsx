// src/components/faturamento/AnalisesPreditivas.tsx

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, UserPlus, TrendingUp } from "lucide-react";

// ANOTAÇÃO: Dados mockados para simular a resposta de uma API de análise preditiva.
// Em um cenário real, esses dados viriam do backend.
const mockData = {
  previsao_receita: {
    title: "Previsão de Receita Mensal",
    description: "Estimativa de receita para os próximos 6 meses.",
    data: [
      { name: 'Jul', previsto: 4000, realizado: 2400 },
      { name: 'Ago', previsto: 3000, realizado: 1398 },
      { name: 'Set', previsto: 2000, realizado: 9800 },
      { name: 'Out', previsto: 2780, realizado: 3908 },
      { name: 'Nov', previsto: 1890, realizado: 4800 },
      { name: 'Dez', previsto: 2390, realizado: 3800 },
    ],
    summary: {
      key: "Receita Média Prevista",
      value: "R$ 2.843,33",
      icon: DollarSign,
    }
  },
  demanda_especialidade: {
    title: "Demanda Preditiva por Especialidade",
    description: "Estimativa de crescimento de demanda para o próximo trimestre.",
    data: [
      { name: 'Cardiologia', demanda: 250, crescimento: 15 },
      { name: 'Pediatria', demanda: 400, crescimento: 10 },
      { name: 'Ortopedia', demanda: 300, crescimento: 20 },
      { name: 'Clínica Geral', demanda: 800, crescimento: 5 },
    ],
    summary: {
      key: "Maior Crescimento Previsto",
      value: "Ortopedia (20%)",
      icon: TrendingUp,
    }
  },
  novos_pacientes: {
    title: "Previsão de Novos Pacientes",
    description: "Estimativa de novos cadastros de pacientes por mês.",
    data: [
      { name: 'Jul', pacientes: 120 },
      { name: 'Ago', pacientes: 150 },
      { name: 'Set', pacientes: 130 },
      { name: 'Out', pacientes: 180 },
      { name: 'Nov', pacientes: 210 },
      { name: 'Dez', pacientes: 190 },
    ],
    summary: {
      key: "Total Previsto (6 meses)",
      value: "980 pacientes",
      icon: UserPlus,
    }
  }
};

type AnaliseType = keyof typeof mockData;

export const AnalisesPreditivas = () => {
  const [analise, setAnalise] = useState<AnaliseType>("previsao_receita");
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState(mockData[analise]);

  // ANOTAÇÃO: O useEffect simula a busca de dados quando o tipo de análise muda.
  // Ele define um estado de 'loading' para dar feedback visual ao usuário.
  useEffect(() => {
    setLoading(true);
    // Simula uma chamada de API com um pequeno atraso.
    const timer = setTimeout(() => {
      setDados(mockData[analise]);
      setLoading(false);
    }, 500);

    // ANOTAÇÃO: Função de limpeza para evitar atualizações de estado em um componente desmontado.
    return () => clearTimeout(timer);
  }, [analise]); // A dependência [analise] garante que o efeito rode sempre que o usuário mudar o filtro.

  const SummaryIcon = dados.summary.icon;

  return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Análises Preditivas de Faturamento</CardTitle>
            <CardDescription>
              Selecione o tipo de análise para visualizar as previsões baseadas em dados históricos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => setAnalise(value as AnaliseType)} defaultValue={analise}>
              <SelectTrigger className="w-full md:w-1/3">
                <SelectValue placeholder="Selecione o tipo de análise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="previsao_receita">Previsão de Receita</SelectItem>
                <SelectItem value="demanda_especialidade">Demanda por Especialidade</SelectItem>
                <SelectItem value="novos_pacientes">Previsão de Novos Pacientes</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ANOTAÇÃO: O layout agora é dividido em 2. Uma parte para o gráfico principal e outra para os cards de resumo. */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{dados.title}</CardTitle>
                <CardDescription>{dados.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center h-80">
                      <p className="text-gray-500">Carregando dados da análise...</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dados.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {/* ANOTAÇÃO: Renderização condicional das barras do gráfico com base no tipo de análise. */}
                        {analise === 'previsao_receita' && <Bar dataKey="previsto" fill="#8884d8" name="Receita Prevista" />}
                        {analise === 'previsao_receita' && <Bar dataKey="realizado" fill="#82ca9d" name="Receita Realizada (Histórico)" />}
                        {analise === 'demanda_especialidade' && <Bar dataKey="demanda" fill="#ffc658" name="Demanda Estimada" />}
                        {analise === 'novos_pacientes' && <Bar dataKey="pacientes" fill="#83a6ed" name="Novos Pacientes" />}
                      </BarChart>
                    </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Card de Resumo */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{dados.summary.key}</CardTitle>
                <SummaryIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dados.summary.value}</div>
                <p className="text-xs text-muted-foreground">
                  Baseado em modelos de machine learning.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};