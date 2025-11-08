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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import {
  escalasAvaliacaoService,
  EscalaEVARequest,
} from "@/services/escalasAvaliacaoService";
import { useToast } from "@/hooks/use-toast";

interface EscalaEVADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacienteId: number;
  avaliadorId: number;
  onSuccess?: () => void;
}

/**
 * Dialog para criar avaliação Escala EVA (Escala Visual Analógica de Dor)
 * Pontuação: 0-10
 * Classificação: 0 (Sem dor), 1-3 (Dor leve), 4-6 (Dor moderada), 7-9 (Dor intensa), 10 (Dor insuportável)
 */
export const EscalaEVADialog: React.FC<EscalaEVADialogProps> = ({
  open,
  onOpenChange,
  pacienteId,
  avaliadorId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EscalaEVARequest>({
    pacienteId,
    avaliadorId,
    pontuacaoDor: 0,
    localizacaoDor: "",
    caracteristicasDor: "",
    fatoresPiora: "",
    fatoresMelhora: "",
    observacoes: "",
  });

  const getClassificacao = (pontuacao: number) => {
    if (pontuacao === 0) return { texto: "Sem dor", cor: "bg-green-100 text-green-800" };
    if (pontuacao <= 3) return { texto: "Dor leve", cor: "bg-blue-100 text-blue-800" };
    if (pontuacao <= 6) return { texto: "Dor moderada", cor: "bg-yellow-100 text-yellow-800" };
    if (pontuacao <= 9) return { texto: "Dor intensa", cor: "bg-orange-100 text-orange-800" };
    return { texto: "Dor insuportável", cor: "bg-red-100 text-red-800" };
  };

  const classificacao = getClassificacao(formData.pontuacaoDor);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await escalasAvaliacaoService.criarAvaliacaoEVA(formData);

      toast({
        title: "Sucesso!",
        description: "Avaliação Escala EVA criada com sucesso",
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
          <DialogTitle>Escala EVA - Escala Visual Analógica de Dor</DialogTitle>
          <DialogDescription>
            Avaliação da intensidade da dor. Pontuação: 0-10
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Resumo da Pontuação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pontuação da Dor</p>
                  <p className="text-2xl font-bold">{formData.pontuacaoDor} / 10</p>
                </div>
                <Badge className={classificacao.cor}>{classificacao.texto}</Badge>
              </div>
              <Slider
                value={[formData.pontuacaoDor]}
                onValueChange={(value) =>
                  setFormData({ ...formData, pontuacaoDor: value[0] })
                }
                max={10}
                min={0}
                step={1}
                disabled={loading}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0 - Sem dor</span>
                <span>10 - Pior dor imaginável</span>
              </div>
            </CardContent>
          </Card>

          {/* Campos da Escala */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="localizacaoDor">Localização da Dor</Label>
              <Input
                id="localizacaoDor"
                type="text"
                placeholder="Ex: Cabeça, Tórax, Abdome..."
                value={formData.localizacaoDor}
                onChange={(e) => setFormData({ ...formData, localizacaoDor: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caracteristicasDor">Características da Dor</Label>
              <Textarea
                id="caracteristicasDor"
                placeholder="Ex: Pulsátil, latejante, queimação, pontada..."
                value={formData.caracteristicasDor}
                onChange={(e) =>
                  setFormData({ ...formData, caracteristicasDor: e.target.value })
                }
                disabled={loading}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatoresPiora">Fatores que Pioram a Dor</Label>
              <Textarea
                id="fatoresPiora"
                placeholder="Ex: Movimento, toque, posição..."
                value={formData.fatoresPiora}
                onChange={(e) => setFormData({ ...formData, fatoresPiora: e.target.value })}
                disabled={loading}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatoresMelhora">Fatores que Melhoram a Dor</Label>
              <Textarea
                id="fatoresMelhora"
                placeholder="Ex: Repouso, medicação, calor..."
                value={formData.fatoresMelhora}
                onChange={(e) => setFormData({ ...formData, fatoresMelhora: e.target.value })}
                disabled={loading}
                rows={2}
              />
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

export default EscalaEVADialog;

