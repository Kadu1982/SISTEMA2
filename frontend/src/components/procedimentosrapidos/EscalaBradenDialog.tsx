import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  escalasAvaliacaoService,
  EscalaBradenRequest,
} from "@/services/escalasAvaliacaoService";
import { useToast } from "@/hooks/use-toast";

interface EscalaBradenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacienteId: number;
  avaliadorId: number;
  onSuccess?: () => void;
}

/**
 * Dialog para criar avaliação Escala de Braden (Risco de Lesão por Pressão)
 * Pontuação total: 6-23 pontos
 * Classificação: ≤9 (Muito Alto Risco), 10-12 (Alto Risco), 13-14 (Risco Moderado), 15-18 (Baixo Risco), >18 (Sem Risco)
 */
export const EscalaBradenDialog: React.FC<EscalaBradenDialogProps> = ({
  open,
  onOpenChange,
  pacienteId,
  avaliadorId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EscalaBradenRequest>({
    pacienteId,
    avaliadorId,
    percepcaoSensorial: 4,
    umidade: 4,
    atividade: 4,
    mobilidade: 4,
    nutricao: 4,
    friccaoCisalhamento: 3,
    observacoes: "",
  });

  const calcularPontuacao = () => {
    return (
      formData.percepcaoSensorial +
      formData.umidade +
      formData.atividade +
      formData.mobilidade +
      formData.nutricao +
      formData.friccaoCisalhamento
    );
  };

  const getClassificacao = (pontuacao: number) => {
    if (pontuacao <= 9) return { texto: "Muito Alto Risco", cor: "bg-red-100 text-red-800" };
    if (pontuacao <= 12) return { texto: "Alto Risco", cor: "bg-orange-100 text-orange-800" };
    if (pontuacao <= 14) return { texto: "Risco Moderado", cor: "bg-yellow-100 text-yellow-800" };
    if (pontuacao <= 18) return { texto: "Baixo Risco", cor: "bg-blue-100 text-blue-800" };
    return { texto: "Sem Risco", cor: "bg-green-100 text-green-800" };
  };

  const pontuacao = calcularPontuacao();
  const classificacao = getClassificacao(pontuacao);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await escalasAvaliacaoService.criarAvaliacaoBraden(formData);

      toast({
        title: "Sucesso!",
        description: "Avaliação Escala de Braden criada com sucesso",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Erro ao criar avaliação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escala de Braden - Risco de Lesão por Pressão</DialogTitle>
          <DialogDescription>
            Avaliação de risco de lesão por pressão. Pontuação total: 6-23 pontos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Resumo da Pontuação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pontuação Total</p>
                  <p className="text-2xl font-bold">{pontuacao} pontos</p>
                </div>
                <Badge className={classificacao.cor}>{classificacao.texto}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Campos da Escala */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="percepcaoSensorial">
                Percepção Sensorial * <span className="text-xs text-muted-foreground">(1-4)</span>
              </Label>
              <Select
                value={formData.percepcaoSensorial.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, percepcaoSensorial: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Totalmente limitado (1 ponto)</SelectItem>
                  <SelectItem value="2">Muito limitado (2 pontos)</SelectItem>
                  <SelectItem value="3">Levemente limitado (3 pontos)</SelectItem>
                  <SelectItem value="4">Nenhuma limitação (4 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="umidade">
                Umidade * <span className="text-xs text-muted-foreground">(1-4)</span>
              </Label>
              <Select
                value={formData.umidade.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, umidade: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Constantemente úmida (1 ponto)</SelectItem>
                  <SelectItem value="2">Muito úmida (2 pontos)</SelectItem>
                  <SelectItem value="3">Ocasionalmente úmida (3 pontos)</SelectItem>
                  <SelectItem value="4">Raramente úmida (4 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="atividade">
                Atividade * <span className="text-xs text-muted-foreground">(1-4)</span>
              </Label>
              <Select
                value={formData.atividade.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, atividade: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Acamado (1 ponto)</SelectItem>
                  <SelectItem value="2">Confinado à cadeira (2 pontos)</SelectItem>
                  <SelectItem value="3">Anda ocasionalmente (3 pontos)</SelectItem>
                  <SelectItem value="4">Anda frequentemente (4 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobilidade">
                Mobilidade * <span className="text-xs text-muted-foreground">(1-4)</span>
              </Label>
              <Select
                value={formData.mobilidade.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, mobilidade: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Totalmente imóvel (1 ponto)</SelectItem>
                  <SelectItem value="2">Bastante limitado (2 pontos)</SelectItem>
                  <SelectItem value="3">Levemente limitado (3 pontos)</SelectItem>
                  <SelectItem value="4">Não apresenta limitações (4 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nutricao">
                Nutrição * <span className="text-xs text-muted-foreground">(1-4)</span>
              </Label>
              <Select
                value={formData.nutricao.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, nutricao: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Muito pobre (1 ponto)</SelectItem>
                  <SelectItem value="2">Provavelmente inadequada (2 pontos)</SelectItem>
                  <SelectItem value="3">Adequada (3 pontos)</SelectItem>
                  <SelectItem value="4">Excelente (4 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="friccaoCisalhamento">
                Fricção e Cisalhamento * <span className="text-xs text-muted-foreground">(1-3)</span>
              </Label>
              <Select
                value={formData.friccaoCisalhamento.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, friccaoCisalhamento: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Problema (1 ponto)</SelectItem>
                  <SelectItem value="2">Problema em potencial (2 pontos)</SelectItem>
                  <SelectItem value="3">Nenhum problema aparente (3 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais sobre a avaliação..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Avaliação"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EscalaBradenDialog;

