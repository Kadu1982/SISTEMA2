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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Database,
  FileSearch,
  Users,
  Calendar,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VALIDACOES = [
  {
    id: "cnes-cns",
    nome: "CNES/CNS",
    descricao:
      "Vinculação obrigatória de procedimentos ao CNES executor e CNS do profissional",
    status: "aprovado",
    criticalidade: "alta",
    total: 1547,
    aprovados: 1547,
    rejeitados: 0,
  },
  {
    id: "sigtap",
    nome: "SIGTAP",
    descricao:
      "Checagem automática das regras do SIGTAP por competência vigente",
    status: "pendente",
    criticalidade: "alta",
    total: 1547,
    aprovados: 1498,
    rejeitados: 49,
  },
  {
    id: "sexo-idade",
    nome: "Sexo/Idade",
    descricao: "Validação de procedimentos por sexo, idade e especialidade",
    status: "aprovado",
    criticalidade: "media",
    total: 1547,
    aprovados: 1542,
    rejeitados: 5,
  },
  {
    id: "limites-contratuais",
    nome: "Limites Contratuais",
    descricao: "Verificação de limites financeiros e quantitativos contratuais",
    status: "alerta",
    criticalidade: "alta",
    total: 1547,
    aprovados: 1520,
    rejeitados: 27,
  },
  {
    id: "esus-sisab",
    nome: "e-SUS/SISAB",
    descricao: "Consistência dos dados conforme regras do e-SUS APS e SISAB",
    status: "aprovado",
    criticalidade: "alta",
    total: 1547,
    aprovados: 1547,
    rejeitados: 0,
  },
];

export const ValidacaoAutomatica = () => {
  const { toast } = useToast();
  const [validando, setValidando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aprovado":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "rejeitado":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "alerta":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      aprovado: "bg-green-100 text-green-800",
      rejeitado: "bg-red-100 text-red-800",
      alerta: "bg-amber-100 text-amber-800",
      pendente: "bg-blue-100 text-blue-800",
    };

    return (
      <Badge
        className={
          variants[status as keyof typeof variants] || variants.pendente
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleValidarTudo = () => {
    setValidando(true);
    setProgresso(0);

    const interval = setInterval(() => {
      setProgresso((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setValidando(false);
          toast({
            title: "Validação concluída",
            description:
              "Todas as validações automáticas foram executadas com sucesso.",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const totalAprovados = VALIDACOES.reduce((sum, v) => sum + v.aprovados, 0);
  const totalRejeitados = VALIDACOES.reduce((sum, v) => sum + v.rejeitados, 0);
  const totalGeral = VALIDACOES.reduce((sum, v) => sum + v.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Validações</p>
                <p className="text-2xl font-bold">
                  {totalGeral.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalAprovados.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Rejeitados</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalRejeitados.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Taxa Aprovação</p>
                <p className="text-2xl font-bold text-blue-600">
                  {((totalAprovados / totalGeral) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Validações Automáticas - SUS</span>
            <Button onClick={handleValidarTudo} disabled={validando}>
              {validando ? "Validando..." : "Executar Todas Validações"}
            </Button>
          </CardTitle>
          <CardDescription>
            Validações conforme Portaria nº 356/SAS/MS e normas LEDI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {validando && (
            <div className="space-y-2">
              <Progress value={progresso} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                Executando validações automáticas... {progresso}%
              </p>
            </div>
          )}

          <div className="space-y-3">
            {VALIDACOES.map((validacao) => (
              <Card key={validacao.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(validacao.status)}
                      <div>
                        <h4 className="font-medium">{validacao.nome}</h4>
                        <p className="text-sm text-gray-600">
                          {validacao.descricao}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="font-medium">
                          {validacao.aprovados.toLocaleString()} /{" "}
                          {validacao.total.toLocaleString()}
                        </div>
                        <div className="text-gray-500">
                          {validacao.rejeitados > 0 &&
                            `${validacao.rejeitados} rejeitados`}
                        </div>
                      </div>
                      {getStatusBadge(validacao.status)}
                    </div>
                  </div>

                  {validacao.rejeitados > 0 && (
                    <Alert className="mt-3">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>
                          {validacao.rejeitados} procedimentos rejeitados.
                        </strong>
                        <Button variant="link" className="p-0 ml-2 h-auto">
                          Ver detalhes e corrigir
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Importação SIGTAP:</strong> Última atualização em
              15/05/2024. Próxima importação automática programada para
              01/06/2024.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
