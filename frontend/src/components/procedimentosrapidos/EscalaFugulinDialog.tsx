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
  EscalaFugulinRequest,
} from "@/services/escalasAvaliacaoService";
import { useToast } from "@/hooks/use-toast";

interface EscalaFugulinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacienteId: number;
  avaliadorId: number;
  onSuccess?: () => void;
}

/**
 * Dialog para criar avaliação Escala de Fugulin (Sistema de Classificação de Pacientes)
 * Pontuação total: 13-37 pontos
 * Classificação: 13-17 (Cuidado Mínimo), 18-22 (Intermediário), 23-27 (Alta Dependência), 28-32 (Semi-Intensivo), 33-37 (Intensivo)
 */
export const EscalaFugulinDialog: React.FC<EscalaFugulinDialogProps> = ({
  open,
  onOpenChange,
  pacienteId,
  avaliadorId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EscalaFugulinRequest>({
    pacienteId,
    avaliadorId,
    estadoMental: 1,
    oxigenacao: 1,
    sinaisVitais: 1,
    motilidade: 1,
    deambulacao: 1,
    alimentacao: 1,
    cuidadoCorporal: 1,
    eliminacao: 1,
    terapeutica: 1,
    observacoes: "",
  });

  const calcularPontuacao = () => {
    return (
      formData.estadoMental +
      formData.oxigenacao +
      formData.sinaisVitais +
      formData.motilidade +
      formData.deambulacao +
      formData.alimentacao +
      formData.cuidadoCorporal +
      formData.eliminacao +
      formData.terapeutica
    );
  };

  const getClassificacao = (pontuacao: number) => {
    if (pontuacao <= 17) return { texto: "Cuidado Mínimo", cor: "bg-green-100 text-green-800" };
    if (pontuacao <= 22) return { texto: "Cuidado Intermediário", cor: "bg-blue-100 text-blue-800" };
    if (pontuacao <= 27) return { texto: "Alta Dependência", cor: "bg-yellow-100 text-yellow-800" };
    if (pontuacao <= 32) return { texto: "Semi-Intensivo", cor: "bg-orange-100 text-orange-800" };
    return { texto: "Cuidado Intensivo", cor: "bg-red-100 text-red-800" };
  };

  const pontuacao = calcularPontuacao();
  const classificacao = getClassificacao(pontuacao);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await escalasAvaliacaoService.criarAvaliacaoFugulin(formData);

      toast({
        title: "Sucesso!",
        description: "Avaliação Escala de Fugulin criada com sucesso",
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
          <DialogTitle>Escala de Fugulin - Classificação de Pacientes</DialogTitle>
          <DialogDescription>
            Sistema de Classificação de Pacientes. Pontuação total: 13-37 pontos
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
              <Label htmlFor="estadoMental">
                Estado Mental * <span className="text-xs text-muted-foreground">(1-4)</span>
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
                  <SelectItem value="1">Orientado no tempo e espaço (1 ponto)</SelectItem>
                  <SelectItem value="2">Confuso/Sonolento (2 pontos)</SelectItem>
                  <SelectItem value="3">Torporoso/Agitado (3 pontos)</SelectItem>
                  <SelectItem value="4">Inconsciente (4 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oxigenacao">
                Oxigenação * <span className="text-xs text-muted-foreground">(1-4)</span>
              </Label>
              <Select
                value={formData.oxigenacao.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, oxigenacao: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ar ambiente (1 ponto)</SelectItem>
                  <SelectItem value="2">Cateter nasal/Máscara (2 pontos)</SelectItem>
                  <SelectItem value="3">Máscara com reservatório/VNI (3 pontos)</SelectItem>
                  <SelectItem value="4">Ventilação mecânica (4 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sinaisVitais">
                Sinais Vitais * <span className="text-xs text-muted-foreground">(1-4)</span>
              </Label>
              <Select
                value={formData.sinaisVitais.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, sinaisVitais: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Controle de rotina 4/4h (1 ponto)</SelectItem>
                  <SelectItem value="2">Controle 2/2h ou 3/3h (2 pontos)</SelectItem>
                  <SelectItem value="3">Controle 1/1h (3 pontos)</SelectItem>
                  <SelectItem value="4">Controle constante (4 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motilidade">
                Motilidade * <span className="text-xs text-muted-foreground">(1-4)</span>
              </Label>
              <Select
                value={formData.motilidade.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, motilidade: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Movimenta todos os segmentos (1 ponto)</SelectItem>
                  <SelectItem value="2">Dificuldade para movimentar (2 pontos)</SelectItem>
                  <SelectItem value="3">Movimenta apenas extremidades (3 pontos)</SelectItem>
                  <SelectItem value="4">Imóvel (4 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deambulacao">
                Deambulação * <span className="text-xs text-muted-foreground">(1-4)</span>
              </Label>
              <Select
                value={formData.deambulacao.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, deambulacao: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Deambula (1 ponto)</SelectItem>
                  <SelectItem value="2">Locomove-se com auxílio (2 pontos)</SelectItem>
                  <SelectItem value="3">Restrito ao leito/cadeira (3 pontos)</SelectItem>
                  <SelectItem value="4">Restrito ao leito (4 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alimentacao">
                Alimentação * <span className="text-xs text-muted-foreground">(1-4)</span>
              </Label>
              <Select
                value={formData.alimentacao.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, alimentacao: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Auto-suficiente (1 ponto)</SelectItem>
                  <SelectItem value="2">Necessita de auxílio (2 pontos)</SelectItem>
                  <SelectItem value="3">Sonda nasoenteral/Gastrostomia (3 pontos)</SelectItem>
                  <SelectItem value="4">Parenteral (4 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuidadoCorporal">
                Cuidado Corporal * <span className="text-xs text-muted-foreground">(1-4)</span>
              </Label>
              <Select
                value={formData.cuidadoCorporal.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, cuidadoCorporal: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Auto-suficiente (1 ponto)</SelectItem>
                  <SelectItem value="2">Necessita de auxílio (2 pontos)</SelectItem>
                  <SelectItem value="3">Dependente - banho no leito (3 pontos)</SelectItem>
                  <SelectItem value="4">Dependente total (4 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eliminacao">
                Eliminação * <span className="text-xs text-muted-foreground">(1-4)</span>
              </Label>
              <Select
                value={formData.eliminacao.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, eliminacao: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Auto-suficiente (1 ponto)</SelectItem>
                  <SelectItem value="2">Necessita de auxílio (2 pontos)</SelectItem>
                  <SelectItem value="3">Incontinente/Sonda/Fralda (3 pontos)</SelectItem>
                  <SelectItem value="4">Evacuação no leito (4 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="terapeutica">
                Terapêutica * <span className="text-xs text-muted-foreground">(1-5)</span>
              </Label>
              <Select
                value={formData.terapeutica.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, terapeutica: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">VO/IM/SC (1 ponto)</SelectItem>
                  <SelectItem value="2">EV contínua (2 pontos)</SelectItem>
                  <SelectItem value="3">EV múltipla (3 pontos)</SelectItem>
                  <SelectItem value="4">Quimioterapia (4 pontos)</SelectItem>
                  <SelectItem value="5">Drogas vasoativas (5 pontos)</SelectItem>
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

export default EscalaFugulinDialog;

