import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Database,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ARQUIVOS_MAGNETICOS = [
  {
    id: "bpa",
    nome: "BPA - Boletim de Produção Ambulatorial",
    descricao: "Portaria nº 356/SAS/MS, de 28/04/2013",
    status: "disponivel",
    tamanho: "2.4 MB",
    registros: 1547,
    competencia: "05/2024",
  },
  {
    id: "raas-ad",
    nome: "RAAS - Atenção Domiciliar",
    descricao: "Registro das Ações Ambulatoriais de Saúde - Domiciliar",
    status: "disponivel",
    tamanho: "156 KB",
    registros: 87,
    competencia: "05/2024",
  },
  {
    id: "raas-ps",
    nome: "RAAS - Psicossocial",
    descricao: "Registro das Ações Ambulatoriais de Saúde - Psicossocial",
    status: "disponivel",
    tamanho: "298 KB",
    registros: 234,
    competencia: "05/2024",
  },
  {
    id: "sisab",
    nome: "SISAB/e-SUS APS",
    descricao: "Sistema de Informação em Saúde para a Atenção Básica",
    status: "processando",
    tamanho: "1.8 MB",
    registros: 1245,
    competencia: "05/2024",
  },
  {
    id: "sisrhc",
    nome: "SISRHC",
    descricao: "Sistema de Informações sobre Recursos Humanos para o SUS",
    status: "disponivel",
    tamanho: "45 KB",
    registros: 23,
    competencia: "05/2024",
  },
  {
    id: "sisaih01",
    nome: "SISAIH01",
    descricao: "Sistema de Informações de Autorização de Internação Hospitalar",
    status: "disponivel",
    tamanho: "678 KB",
    registros: 145,
    competencia: "05/2024",
  },
];

export const ArquivosMagneticos = () => {
  const { toast } = useToast();
  const [competencia, setCompetencia] = useState("05/2024");
  const [gerandoTodos, setGerandoTodos] = useState(false);
  const [progresso, setProgresso] = useState(0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "disponivel":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "processando":
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      disponivel: "bg-green-100 text-green-800",
      processando: "bg-amber-100 text-amber-800",
      erro: "bg-red-100 text-red-800",
    };

    const statusKey = status as keyof typeof variants;
    return (
        <Badge
            className={variants[statusKey] || "bg-gray-100 text-gray-800"}
        >
          {status === "disponivel"
              ? "Disponível"
              : status === "processando"
                  ? "Processando"
                  : "Erro"}
        </Badge>
    );
  };

  const handleGerarArquivo = (arquivo: string) => {
    toast({
      title: "Gerando arquivo",
      description: `O arquivo ${arquivo} está sendo gerado...`,
    });
  };

  const handleGerarTodos = () => {
    setGerandoTodos(true);
    setProgresso(0);

    const interval = setInterval(() => {
      setProgresso((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setGerandoTodos(false);
          toast({
            title: "Arquivos gerados",
            description:
                "Todos os arquivos magnéticos foram gerados com sucesso.",
          });
          return 100;
        }
        return prev + 16.67; // 6 arquivos = 100/6
      });
    }, 500);
  };

  const handleDownloadArquivo = (arquivo: string) => {
    toast({
      title: "Download iniciado",
      description: `Download do arquivo ${arquivo} iniciado.`,
    });
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="space-y-2">
            <Label>Competência</Label>
            {/* ✅ CORRIGIDO: Usa onChange e a estrutura de um <select> HTML padrão */}
            <Select
                value={competencia}
                onChange={(e) => setCompetencia(e.target.value)}
                className="w-[180px]"
            >
              <SelectItem value="05/2024">Maio/2024</SelectItem>
              <SelectItem value="04/2024">Abril/2024</SelectItem>
              <SelectItem value="03/2024">Março/2024</SelectItem>
            </Select>
          </div>

          <Button
              onClick={handleGerarTodos}
              disabled={gerandoTodos}
              className="w-full md:w-auto"
          >
            {gerandoTodos ? "Gerando..." : "Gerar Todos os Arquivos"}
          </Button>
        </div>

        {gerandoTodos && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Gerando arquivos magnéticos...
                </span>
                    <span className="text-sm text-muted-foreground">
                  {Math.round(progresso)}%
                </span>
                  </div>
                  <Progress value={progresso} className="w-full" />
                </div>
              </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ARQUIVOS_MAGNETICOS.map((arquivo) => (
              <Card key={arquivo.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(arquivo.status)}
                      <div>
                        <CardTitle className="text-lg">{arquivo.nome}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {arquivo.descricao}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(arquivo.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 mt-auto">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Registros:</span>
                        <div className="font-medium">
                          {arquivo.registros.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tamanho:</span>
                        <div className="font-medium">{arquivo.tamanho}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleGerarArquivo(arquivo.nome)}
                      >
                        <Upload className="mr-1 h-3 w-3" /> Gerar
                      </Button>
                      <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownloadArquivo(arquivo.nome)}
                          disabled={arquivo.status !== "disponivel"}
                      >
                        <Download className="mr-1 h-3 w-3" /> Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Informações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Layout BPA:</strong> Versão 2013 (Portaria 356/SAS/MS)
              </div>
              <div>
                <strong>LEDI e-SUS:</strong> Conforme especificação vigente
              </div>
              <div>
                <strong>Codificação:</strong> UTF-8 com validação CRC
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Todos os arquivos são gerados conforme as especificações técnicas
              oficiais do Ministério da Saúde e passam por validação automática
              antes da disponibilização.
            </div>
          </CardContent>
        </Card>
      </div>
  );
};