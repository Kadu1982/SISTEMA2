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
  EscalaGlasgowRequest,
} from "@/services/escalasAvaliacaoService";
import { useToast } from "@/hooks/use-toast";

interface EscalaGlasgowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacienteId: number;
  avaliadorId: number;
  onSuccess?: () => void;
}

/**
 * Dialog para criar avaliação Escala de Glasgow (Nível de Consciência)
 * Pontuação total: 3-15 pontos
 * Classificação: 3-8 (Grave), 9-12 (Moderado), 13-15 (Leve)
 */
export const EscalaGlasgowDialog: React.FC<EscalaGlasgowDialogProps> = ({
  open,
  onOpenChange,
  pacienteId,
  avaliadorId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EscalaGlasgowRequest>({
    pacienteId,
    avaliadorId,
    aberturaOcular: 4,
    respostaVerbal: 5,
    respostaMotora: 6,
    observacoes: "",
  });

  const calcularPontuacao = () => {
    return formData.aberturaOcular + formData.respostaVerbal + formData.respostaMotora;
  };

  const getClassificacao = (pontuacao: number) => {
    if (pontuacao <= 8) return { texto: "Grave", cor: "bg-red-100 text-red-800" };
    if (pontuacao <= 12) return { texto: "Moderado", cor: "bg-yellow-100 text-yellow-800" };
    return { texto: "Leve", cor: "bg-green-100 text-green-800" };
  };

  const pontuacao = calcularPontuacao();
  const classificacao = getClassificacao(pontuacao);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await escalasAvaliacaoService.criarAvaliacaoGlasgow(formData);

      toast({
        title: "Sucesso!",
        description: "Avaliação Escala de Glasgow criada com sucesso",
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escala de Glasgow - Nível de Consciência</DialogTitle>
          <DialogDescription>
            Avaliação do nível de consciência. Pontuação total: 3-15 pontos
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aberturaOcular">
                Abertura Ocular * <span className="text-xs text-muted-foreground">(1-4)</span>
              </Label>
              <Select
                value={formData.aberturaOcular.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, aberturaOcular: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Nenhuma (1 ponto)</SelectItem>
                  <SelectItem value="2">À dor (2 pontos)</SelectItem>
                  <SelectItem value="3">Ao comando verbal (3 pontos)</SelectItem>
                  <SelectItem value="4">Espontânea (4 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="respostaVerbal">
                Resposta Verbal * <span className="text-xs text-muted-foreground">(1-5)</span>
              </Label>
              <Select
                value={formData.respostaVerbal.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, respostaVerbal: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Nenhuma (1 ponto)</SelectItem>
                  <SelectItem value="2">Sons incompreensíveis (2 pontos)</SelectItem>
                  <SelectItem value="3">Palavras inapropriadas (3 pontos)</SelectItem>
                  <SelectItem value="4">Confuso (4 pontos)</SelectItem>
                  <SelectItem value="5">Orientado (5 pontos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="respostaMotora">
                Resposta Motora * <span className="text-xs text-muted-foreground">(1-6)</span>
              </Label>
              <Select
                value={formData.respostaMotora.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, respostaMotora: parseInt(value) })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Nenhuma (1 ponto)</SelectItem>
                  <SelectItem value="2">Extensão anormal - descerebração (2 pontos)</SelectItem>
                  <SelectItem value="3">Flexão anormal - decorticação (3 pontos)</SelectItem>
                  <SelectItem value="4">Retirada à dor (4 pontos)</SelectItem>
                  <SelectItem value="5">Localiza a dor (5 pontos)</SelectItem>
                  <SelectItem value="6">Obedece comandos (6 pontos)</SelectItem>
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

export default EscalaGlasgowDialog;

