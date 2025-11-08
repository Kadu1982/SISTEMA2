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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  escalasAvaliacaoService,
  EscalaMorseRequest,
} from "@/services/escalasAvaliacaoService";
import { useToast } from "@/hooks/use-toast";

interface EscalaMorseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacienteId: number;
  avaliadorId: number;
  onSuccess?: () => void;
}

/**
 * Dialog para criar avaliação Escala de Morse (Risco de Quedas)
 * Pontuação total: 0-125 pontos
 * Classificação: 0-24 (Sem Risco), 25-50 (Baixo Risco), >51 (Alto Risco)
 */
export const EscalaMorseDialog: React.FC<EscalaMorseDialogProps> = ({
  open,
  onOpenChange,
  pacienteId,
  avaliadorId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EscalaMorseRequest>({
    pacienteId,
    avaliadorId,
    historicoQuedas: 0,
    diagnosticoSecundario: 0,
    auxilioMarcha: 0,
    terapiaEndovenosa: 0,
    marcha: 0,
    estadoMental: 0,
    observacoes: "",
  });

  const calcularPontuacao = () => {
    return (
      formData.historicoQuedas +
      formData.diagnosticoSecundario +
      formData.auxilioMarcha +
      formData.terapiaEndovenosa +
      formData.marcha +
      formData.estadoMental
    );
  };

  const getClassificacao = (pontuacao: number) => {
    if (pontuacao <= 24) return { texto: "Sem Risco", cor: "bg-green-100 text-green-800" };
    if (pontuacao <= 50) return { texto: "Baixo Risco", cor: "bg-yellow-100 text-yellow-800" };
    return { texto: "Alto Risco", cor: "bg-red-100 text-red-800" };
  };

  const pontuacao = calcularPontuacao();
  const classificacao = getClassificacao(pontuacao);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await escalasAvaliacaoService.criarAvaliacaoMorse(formData);

      toast({
        title: "Sucesso!",
        description: "Avaliação Escala de Morse criada com sucesso",
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
          <DialogTitle>Escala de Morse - Risco de Quedas</DialogTitle>
          <DialogDescription>
            Avaliação de risco de quedas. Pontuação total: 0-125 pontos
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
              <Label htmlFor="historicoQuedas">
                Histórico de Quedas *
                <span className="text-xs text-muted-foreground ml-2">(0 ou 25)</span>
              </Label>
              <Select
                value={formData.historicoQuedas.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, historicoQuedas: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Não (0 pontos)</SelectItem>
                  <SelectItem value="25">Sim (25 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosticoSecundario">
                Diagnóstico Secundário *
                <span className="text-xs text-muted-foreground ml-2">(0 ou 15)</span>
              </Label>
              <Select
                value={formData.diagnosticoSecundario.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, diagnosticoSecundario: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Não (0 pontos)</SelectItem>
                  <SelectItem value="15">Sim (15 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auxilioMarcha">
                Auxílio de Marcha *
                <span className="text-xs text-muted-foreground ml-2">(0, 15 ou 30)</span>
              </Label>
              <Select
                value={formData.auxilioMarcha.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, auxilioMarcha: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Nenhum/Acamado/Cadeira (0 pontos)</SelectItem>
                  <SelectItem value="15">Muletas/Bengala/Andador (15 pontos)</SelectItem>
                  <SelectItem value="30">Mobiliário (30 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="terapiaEndovenosa">
                Terapia Endovenosa *
                <span className="text-xs text-muted-foreground ml-2">(0 ou 20)</span>
              </Label>
              <Select
                value={formData.terapiaEndovenosa.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, terapiaEndovenosa: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Não (0 pontos)</SelectItem>
                  <SelectItem value="20">Sim (20 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marcha">
                Marcha/Transferência *
                <span className="text-xs text-muted-foreground ml-2">(0, 10 ou 20)</span>
              </Label>
              <Select
                value={formData.marcha.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, marcha: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Normal/Acamado/Imóvel (0 pontos)</SelectItem>
                  <SelectItem value="10">Fraca (10 pontos)</SelectItem>
                  <SelectItem value="20">Comprometida/Cambaleante (20 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estadoMental">
                Estado Mental *
                <span className="text-xs text-muted-foreground ml-2">(0 ou 15)</span>
              </Label>
              <Select
                value={formData.estadoMental.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, estadoMental: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">
                    Orientado/Capaz quanto à própria capacidade (0 pontos)
                  </SelectItem>
                  <SelectItem value="15">Esquece limitações (15 pontos)</SelectItem>
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

export default EscalaMorseDialog;

