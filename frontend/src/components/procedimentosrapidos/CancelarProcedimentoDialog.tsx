import React, { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { procedimentosRapidosService, ProcedimentoRapidoDTO } from "@/services/procedimentosRapidosService";

interface CancelarProcedimentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedimento: ProcedimentoRapidoDTO | null;
  onSuccess: () => void;
}

const CancelarProcedimentoDialog: React.FC<CancelarProcedimentoDialogProps> = ({
  open,
  onOpenChange,
  procedimento,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [motivo, setMotivo] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");
  const [cancelarAtividades, setCancelarAtividades] = useState<boolean>(false);
  const [motivosDisponiveis, setMotivosDisponiveis] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [carregandoMotivos, setCarregandoMotivos] = useState(false);

  const temAtividadesPendentes = procedimento?.temAtividadesPendentes || false;
  const quantidadeAtividadesPendentes = procedimento?.quantidadeAtividadesPendentes || 0;

  // Carrega motivos de cancelamento
  useEffect(() => {
    if (open) {
      carregarMotivos();
    }
  }, [open]);

  const carregarMotivos = async () => {
    try {
      setCarregandoMotivos(true);
      const motivos = await procedimentosRapidosService.listarMotivosCancelamento();
      setMotivosDisponiveis(motivos);
    } catch (error: any) {
      console.error("Erro ao carregar motivos de cancelamento:", error);
      // Usa motivos padrão em caso de erro
      setMotivosDisponiveis([
        "Paciente não compareceu",
        "Paciente desistiu do atendimento",
        "Erro no encaminhamento",
        "Atendimento duplicado",
        "Paciente transferido",
        "Procedimento não necessário",
        "Outro motivo",
      ]);
    } finally {
      setCarregandoMotivos(false);
    }
  };

  const handleCancelar = async () => {
    if (!procedimento) return;

    // Validações
    if (!motivo || motivo.trim() === "") {
      toast({
        title: "Erro",
        description: "O motivo do cancelamento é obrigatório",
        variant: "destructive",
      });
      return;
    }

    // Se há atividades pendentes e não foi marcado para cancelar, exige observações
    if (temAtividadesPendentes && !cancelarAtividades && (!observacoes || observacoes.trim() === "")) {
      toast({
        title: "Erro",
        description: `O usuário possui ${quantidadeAtividadesPendentes} atividade(s) pendente(s) para execução. É obrigatório informar observações ao cancelar o atendimento com atividades pendentes.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await procedimentosRapidosService.cancelar(procedimento.id, {
        motivo: motivo.trim(),
        observacoes: observacoes.trim() || undefined,
        cancelarAtividadesPendentes: cancelarAtividades,
      });

      toast({
        title: "Sucesso",
        description: "Procedimento cancelado com sucesso",
      });

      // Limpa formulário
      setMotivo("");
      setObservacoes("");
      setCancelarAtividades(false);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao cancelar procedimento:", error);
      toast({
        title: "Erro",
        description: error?.response?.data?.message || error?.message || "Erro ao cancelar procedimento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMotivo("");
    setObservacoes("");
    setCancelarAtividades(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cancelar Procedimento Rápido</DialogTitle>
          <DialogDescription>
            Informe o motivo do cancelamento do procedimento. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Alerta sobre atividades pendentes */}
          {temAtividadesPendentes && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Este procedimento possui {quantidadeAtividadesPendentes}{" "}
                atividade(s) pendente(s) para execução. Ao cancelar, todas as atividades pendentes
                serão canceladas automaticamente.
              </AlertDescription>
            </Alert>
          )}

          {/* Motivo do cancelamento */}
          <div>
            <Label htmlFor="motivo">
              Motivo do Cancelamento <span className="text-red-500">*</span>
            </Label>
            <Select
              value={motivo}
              onValueChange={setMotivo}
              disabled={carregandoMotivos || loading}
            >
              <SelectTrigger id="motivo" className="mt-1">
                <SelectValue placeholder="Selecione o motivo do cancelamento" />
              </SelectTrigger>
              <SelectContent>
                {motivosDisponiveis.map((motivoItem) => (
                  <SelectItem key={motivoItem} value={motivoItem}>
                    {motivoItem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">
              Observações
              {temAtividadesPendentes && !cancelarAtividades && (
                <span className="text-red-500"> *</span>
              )}
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Informe observações sobre o cancelamento..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={loading}
              className="mt-1 min-h-[100px]"
              required={temAtividadesPendentes && !cancelarAtividades}
            />
            {temAtividadesPendentes && !cancelarAtividades && (
              <p className="text-sm text-muted-foreground mt-1">
                Obrigatório quando há atividades pendentes
              </p>
            )}
          </div>

          {/* Checkbox para cancelar atividades pendentes */}
          {temAtividadesPendentes && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="cancelarAtividades"
                checked={cancelarAtividades}
                onChange={(e) => setCancelarAtividades(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="cancelarAtividades" className="text-sm font-normal cursor-pointer">
                Cancelar todas as atividades pendentes automaticamente
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleCancelar} disabled={loading || !motivo}>
            {loading ? "Cancelando..." : "Confirmar Cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelarProcedimentoDialog;

