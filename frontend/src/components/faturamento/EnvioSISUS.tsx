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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Send,
  Upload,
  XCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Dados de exemplo
const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const ANOS = ["2025", "2024", "2023", "2022"];

const ENVIOS_ANTERIORES = [
  {
    competencia: "04/2024",
    data: "05/05/2024",
    status: "aprovado",
    valorAprovado: 87450.25,
    valorRejeitado: 0,
    protocolo: "8753924611",
  },
  {
    competencia: "03/2024",
    data: "04/04/2024",
    status: "aprovado",
    valorAprovado: 92140.5,
    valorRejeitado: 1250.75,
    protocolo: "8742563819",
  },
  {
    competencia: "02/2024",
    data: "05/03/2024",
    status: "aprovado",
    valorAprovado: 85630.0,
    valorRejeitado: 780.4,
    protocolo: "8736459123",
  },
];

export const EnvioSISUS = () => {
  const { toast } = useToast();
  const [mes, setMes] = useState("Maio");
  const [ano, setAno] = useState("2024");
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  const handleEnviar = () => {
    setEnviando(true);
    setProgresso(0);

    // Simular progresso
    const interval = setInterval(() => {
      setProgresso((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setEnviando(false);
          toast({
            title: "Envio concluído",
            description: `Os dados de ${mes}/${ano} foram enviados com sucesso.`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    if (status === "aprovado") {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          <span>Aprovado</span>
        </div>
      );
    }
    if (status === "rejeitado") {
      return (
        <div className="flex items-center text-red-600">
          <XCircle className="mr-2 h-4 w-4" />
          <span>Rejeitado</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-amber-600">
        <Clock className="mr-2 h-4 w-4" />
        <span>Em processamento</span>
      </div>
    );
  };

  return (
    <Tabs defaultValue="envio" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="envio">Novo Envio</TabsTrigger>
        <TabsTrigger value="historico">Histórico de Envios</TabsTrigger>
      </TabsList>

      <TabsContent value="envio" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Enviar Produção para o SUS</CardTitle>
            <CardDescription>
              Envie os dados de faturamento para o Sistema Único de Saúde
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="space-y-2">
                <Label htmlFor="mes">Competência - Mês</Label>
                <Select value={mes} onValueChange={setMes}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {MESES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ano">Competência - Ano</Label>
                <Select value={ano} onValueChange={setAno}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {ANOS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Verificar produção</div>
                  <div className="text-xs text-muted-foreground">
                    Valide os dados antes de enviar
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Verificar <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Gerar arquivo</div>
                  <div className="text-xs text-muted-foreground">
                    Crie o arquivo no formato exigido pelo SUS
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Gerar <Upload className="ml-1 h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Enviar dados</div>
                  <div className="text-xs text-muted-foreground">
                    Envie os dados para o sistema SISUS
                  </div>
                </div>
                <Button onClick={handleEnviar} disabled={enviando}>
                  {enviando ? "Enviando..." : "Enviar"}{" "}
                  <Send className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {enviando && (
                <div className="space-y-2">
                  <Progress value={progresso} className="w-full" />
                  <p className="text-xs text-center text-muted-foreground">
                    {progresso}% concluído
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="historico">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Envios</CardTitle>
            <CardDescription>
              Últimos envios de produção para o SUS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left font-medium text-muted-foreground">
                      Competência
                    </th>
                    <th className="p-2 text-left font-medium text-muted-foreground">
                      Data de Envio
                    </th>
                    <th className="p-2 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="p-2 text-left font-medium text-muted-foreground">
                      Valor Aprovado
                    </th>
                    <th className="p-2 text-left font-medium text-muted-foreground">
                      Protocolo
                    </th>
                    <th className="p-2 text-right font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ENVIOS_ANTERIORES.map((envio, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{envio.competencia}</td>
                      <td className="p-2">{envio.data}</td>
                      <td className="p-2">{getStatusBadge(envio.status)}</td>
                      <td className="p-2">
                        R$ {envio.valorAprovado.toFixed(2)}
                      </td>
                      <td className="p-2">{envio.protocolo}</td>
                      <td className="p-2 text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

// Lucide React FileText icon component
const FileText = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </svg>
);
