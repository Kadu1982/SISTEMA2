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
import {
  Globe,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const INTEGRACOES = [
  {
    id: "sigtap",
    nome: "SIGTAP - Tabela SUS",
    descricao: "Importação automática via FTP/DataSUS",
    status: "conectado",
    ultimaAtualizacao: "15/05/2024 14:30",
    proximaAtualizacao: "01/06/2024",
    frequencia: "Mensal",
    url: "ftp://ftp.datasus.gov.br/sigtap/",
  },
  {
    id: "cnes-local",
    nome: "CNES Local",
    descricao: "Cadastro Nacional de Estabelecimentos - Base Local",
    status: "conectado",
    ultimaAtualizacao: "25/05/2024 09:15",
    proximaAtualizacao: "Tempo real",
    frequencia: "Contínua",
    url: "Local Database",
  },
  {
    id: "cnes-nacional",
    nome: "CNES Nacional",
    descricao: "WebService CNES Nacional do DATASUS",
    status: "conectado",
    ultimaAtualizacao: "25/05/2024 16:45",
    proximaAtualizacao: "26/05/2024 06:00",
    frequencia: "Diária",
    url: "http://cnes.datasus.gov.br/webservice",
  },
  {
    id: "sisrhc",
    nome: "SISRHC",
    descricao: "Sistema de Informações sobre Recursos Humanos",
    status: "conectado",
    ultimaAtualizacao: "20/05/2024 11:20",
    proximaAtualizacao: "27/05/2024",
    frequencia: "Semanal",
    url: "https://sisrhc.saude.gov.br/api",
  },
  {
    id: "sisaih01",
    nome: "SISAIH01",
    descricao: "Sistema de Informações de AIH",
    status: "manutencao",
    ultimaAtualizacao: "24/05/2024 15:00",
    proximaAtualizacao: "26/05/2024",
    frequencia: "Diária",
    url: "https://sisaih.saude.gov.br/webservice",
  },
  {
    id: "horus-rnds",
    nome: "Hórus/RNDS",
    descricao: "Sistema Nacional de Gestão da Assistência Farmacêutica",
    status: "conectado",
    ultimaAtualizacao: "25/05/2024 13:30",
    proximaAtualizacao: "Tempo real",
    frequencia: "Contínua",
    url: "https://rnds.saude.gov.br/api",
  },
  {
    id: "sisab",
    nome: "SISAB/e-SUS APS",
    descricao: "Sistema de Informação em Saúde para a Atenção Básica",
    status: "erro",
    ultimaAtualizacao: "24/05/2024 18:45",
    proximaAtualizacao: "Pendente",
    frequencia: "Contínua",
    url: "https://sisab.saude.gov.br/webservice",
  },
];

export const IntegracoesSUS = () => {
  const { toast } = useToast();
  const [sincronizando, setSincronizando] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "conectado":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "erro":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "manutencao":
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      conectado: "bg-green-100 text-green-800",
      erro: "bg-red-100 text-red-800",
      manutencao: "bg-amber-100 text-amber-800",
      desconectado: "bg-gray-100 text-gray-800",
    };

    const labels = {
      conectado: "Conectado",
      erro: "Erro",
      manutencao: "Manutenção",
      desconectado: "Desconectado",
    };

    return (
      <Badge
        className={
          variants[status as keyof typeof variants] || variants.desconectado
        }
      >
        {labels[status as keyof typeof labels] || "Desconhecido"}
      </Badge>
    );
  };

  const handleSincronizar = (integracaoId: string, nome: string) => {
    setSincronizando(integracaoId);

    setTimeout(() => {
      setSincronizando(null);
      toast({
        title: "Sincronização concluída",
        description: `${nome} sincronizado com sucesso.`,
      });
    }, 3000);
  };

  const handleSincronizarTodas = () => {
    toast({
      title: "Sincronização geral iniciada",
      description: "Todas as integrações estão sendo sincronizadas.",
    });
  };

  const integracoesConectadas = INTEGRACOES.filter(
    (i) => i.status === "conectado",
  ).length;
  const integracoesComErro = INTEGRACOES.filter(
    (i) => i.status === "erro",
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{INTEGRACOES.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Conectadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {integracoesConectadas}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Com Erro</p>
                <p className="text-2xl font-bold text-red-600">
                  {integracoesComErro}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Disponibilidade</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    (integracoesConectadas / INTEGRACOES.length) * 100,
                  )}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Integrações Ativas</h3>
        <Button onClick={handleSincronizarTodas}>
          <RefreshCw className="mr-2 h-4 w-4" /> Sincronizar Todas
        </Button>
      </div>

      <div className="space-y-3">
        {INTEGRACOES.map((integracao) => (
          <Card key={integracao.id} className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(integracao.status)}
                  <div>
                    <h4 className="font-medium">{integracao.nome}</h4>
                    <p className="text-sm text-gray-600">
                      {integracao.descricao}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {integracao.url}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs">
                    <div className="font-medium">
                      Última: {integracao.ultimaAtualizacao}
                    </div>
                    <div className="text-gray-500">
                      Próxima: {integracao.proximaAtualizacao}
                    </div>
                    <div className="text-gray-500">
                      Freq: {integracao.frequencia}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(integracao.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleSincronizar(integracao.id, integracao.nome)
                      }
                      disabled={sincronizando === integracao.id}
                    >
                      {sincronizando === integracao.id ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {integracao.status === "erro" && (
                <Alert className="mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Erro de conexão.</strong> Verifique a conectividade
                    e tente novamente.
                    <Button variant="link" className="p-0 ml-2 h-auto">
                      Ver logs detalhados
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
          <strong>Importante:</strong> As integrações seguem as especificações
          técnicas oficiais do Ministério da Saúde. Problemas de conectividade
          podem afetar a sincronização de dados.
        </AlertDescription>
      </Alert>
    </div>
  );
};
