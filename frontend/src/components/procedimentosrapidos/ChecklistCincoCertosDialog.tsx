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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChecklistCincoCertosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atividadeId?: number;
  onComplete?: (checklist: ChecklistCincoCertosData) => void;
}

export interface ChecklistCincoCertosData {
  pacienteCerto: boolean;
  medicamentoCerto: boolean;
  doseCerta: boolean;
  viaCerta: boolean;
  horarioCerto: boolean;
}

/**
 * Dialog para validar Checklist dos 5 Certos
 * Obrigatório antes de assinar atividades de enfermagem
 * Os 5 Certos: Paciente, Medicamento, Dose, Via, Horário
 */
export const ChecklistCincoCertosDialog: React.FC<ChecklistCincoCertosDialogProps> = ({
  open,
  onOpenChange,
  atividadeId,
  onComplete,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistCincoCertosData>({
    pacienteCerto: false,
    medicamentoCerto: false,
    doseCerta: false,
    viaCerta: false,
    horarioCerto: false,
  });

  const isCompleto = () => {
    return (
      checklist.pacienteCerto &&
      checklist.medicamentoCerto &&
      checklist.doseCerta &&
      checklist.viaCerta &&
      checklist.horarioCerto
    );
  };

  const getCamposNaoValidados = () => {
    const campos: string[] = [];
    if (!checklist.pacienteCerto) campos.push("Paciente");
    if (!checklist.medicamentoCerto) campos.push("Medicamento");
    if (!checklist.doseCerta) campos.push("Dose");
    if (!checklist.viaCerta) campos.push("Via");
    if (!checklist.horarioCerto) campos.push("Horário");
    return campos;
  };

  const handleSubmit = () => {
    if (!isCompleto()) {
      const campos = getCamposNaoValidados();
      toast({
        title: "Checklist Incompleto",
        description: `Por favor, valide todos os itens: ${campos.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    onComplete?.(checklist);
    onOpenChange(false);
    toast({
      title: "Sucesso!",
      description: "Checklist dos 5 Certos validado com sucesso",
    });
  };

  const handleReset = () => {
    setChecklist({
      pacienteCerto: false,
      medicamentoCerto: false,
      doseCerta: false,
      viaCerta: false,
      horarioCerto: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Checklist dos 5 Certos
          </DialogTitle>
          <DialogDescription>
            Valide todos os itens antes de administrar o medicamento ou realizar o procedimento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status do Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Status</span>
                {isCompleto() ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completo
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    {5 - getCamposNaoValidados().length} / 5 validados
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isCompleto() && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Campos pendentes: {getCamposNaoValidados().join(", ")}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Itens do Checklist */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="pacienteCerto"
                checked={checklist.pacienteCerto}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, pacienteCerto: checked === true })
                }
                disabled={loading}
              />
              <Label
                htmlFor="pacienteCerto"
                className="flex-1 cursor-pointer font-medium text-base"
              >
                1. Paciente Certo
                <span className="block text-sm text-muted-foreground font-normal mt-1">
                  Verifique se o paciente é o correto (nome, prontuário, pulseira)
                </span>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="medicamentoCerto"
                checked={checklist.medicamentoCerto}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, medicamentoCerto: checked === true })
                }
                disabled={loading}
              />
              <Label
                htmlFor="medicamentoCerto"
                className="flex-1 cursor-pointer font-medium text-base"
              >
                2. Medicamento Certo
                <span className="block text-sm text-muted-foreground font-normal mt-1">
                  Confirme o nome do medicamento na prescrição e no frasco/ampola
                </span>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="doseCerta"
                checked={checklist.doseCerta}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, doseCerta: checked === true })
                }
                disabled={loading}
              />
              <Label htmlFor="doseCerta" className="flex-1 cursor-pointer font-medium text-base">
                3. Dose Certa
                <span className="block text-sm text-muted-foreground font-normal mt-1">
                  Verifique a dose prescrita e a quantidade a ser administrada
                </span>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="viaCerta"
                checked={checklist.viaCerta}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, viaCerta: checked === true })
                }
                disabled={loading}
              />
              <Label htmlFor="viaCerta" className="flex-1 cursor-pointer font-medium text-base">
                4. Via Certa
                <span className="block text-sm text-muted-foreground font-normal mt-1">
                  Confirme a via de administração (oral, endovenosa, intramuscular, etc.)
                </span>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="horarioCerto"
                checked={checklist.horarioCerto}
                onCheckedChange={(checked) =>
                  setChecklist({ ...checklist, horarioCerto: checked === true })
                }
                disabled={loading}
              />
              <Label
                htmlFor="horarioCerto"
                className="flex-1 cursor-pointer font-medium text-base"
              >
                5. Horário Certo
                <span className="block text-sm text-muted-foreground font-normal mt-1">
                  Verifique se está no horário correto conforme prescrição
                </span>
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            Limpar
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !isCompleto()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              "Validar Checklist"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistCincoCertosDialog;

