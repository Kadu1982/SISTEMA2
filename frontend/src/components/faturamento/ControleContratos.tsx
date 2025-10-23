
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const CONTRATOS = [
  {
    id: "sus-ambulatorial",
    nome: "SUS Ambulatorial",
    tipo: "Federal",
    vigencia: "01/01/2024 - 31/12/2024",
    valorTotal: 1250000.0,
    valorExecutado: 623500.5,
    percentualExecutado: 49.88,
    limiteMensal: 104166.67,
    executadoMes: 87450.25,
    status: "ativo",
    ppi: "0234.567.890",
  },
  {
    id: "sus-hospitalar",
    nome: "SUS Hospitalar",
    tipo: "Federal",
    vigencia: "01/01/2024 - 31/12/2024",
    valorTotal: 850000.0,
    valorExecutado: 445200.3,
    percentualExecutado: 52.38,
    limiteMensal: 70833.33,
    executadoMes: 72100.15,
    status: "alerta",
    ppi: "0234.567.891",
  },
  {
    id: "mac-especializado",
    nome: "MAC Especializado",
    tipo: "Estadual",
    vigencia: "01/03/2024 - 28/02/2025",
    valorTotal: 320000.0,
    valorExecutado: 89600.4,
    percentualExecutado: 28.0,
    limiteMensal: 26666.67,
    executadoMes: 24800.2,
    status: "ativo",
    ppi: "0234.567.892",
  },
];

const ALERTAS_CONTRATOS = [
  {
    contrato: "SUS Hospitalar",
    tipo: "limite_mensal",
    descricao: "Limite mensal ultrapassado em 1.8%",
    valor: 1266.82,
    urgencia: "media",
  },
  {
    contrato: "SUS Ambulatorial",
    tipo: "projecao_anual",
    descricao: "Projeção indica possível extrapolação do limite anual",
    valor: 24500.0,
    urgencia: "alta",
  },
];

export const ControleContratos = () => {
  // ANOTAÇÃO 2 (CORREÇÃO):
  // A linha `const { toast } = useToast();` foi removida daqui,
  // pois a variável `toast` nunca era chamada, o que tornava a importação `useToast` inútil.

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ativo":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "alerta":
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800";
      case "alerta":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAlertColor = (urgencia: string) => {
    switch (urgencia) {
      case "alta":
        return "border-red-500/50 text-red-700";
      case "media":
        return "border-amber-500/50 text-amber-700";
      default:
        return "";
    }
  };

  return (
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Alertas de Contratos</CardTitle>
            <CardDescription>
              Avisos importantes sobre a execução dos seus contratos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ALERTAS_CONTRATOS.map((alerta) => (
                <Alert
                    key={alerta.contrato}
                    className={getAlertColor(alerta.urgencia)}
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{alerta.contrato}:</strong> {alerta.descricao} (
                    {alerta.valor.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                    )
                  </AlertDescription>
                </Alert>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CONTRATOS.map((contrato) => (
              <Card
                  key={contrato.id}
                  className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {contrato.nome}
                  </CardTitle>
                  {getStatusIcon(contrato.status)}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {contrato.valorExecutado.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
                    <Badge className={getBadgeColor(contrato.status)}>
                      {contrato.percentualExecutado.toFixed(2)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    de{" "}
                    {contrato.valorTotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}{" "}
                    (vigência até {contrato.vigencia.split(" - ")[1]})
                  </p>
                  <Progress
                      value={contrato.percentualExecutado}
                      className="w-full mt-4 h-2"
                  />
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
  );
};