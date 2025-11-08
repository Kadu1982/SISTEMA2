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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, User, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PacienteAutocomplete from "@/components/upa/PacienteAutocomplete";
import { procedimentosRapidosService } from "@/services/procedimentosRapidosService";
import apiService from "@/services/apiService";

interface VincularUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedimentoId: number;
  onSuccess: () => void;
}

interface Paciente {
  id: number;
  nomeCompleto: string;
  cpf?: string;
}

const VincularUsuarioDialog: React.FC<VincularUsuarioDialogProps> = ({
  open,
  onOpenChange,
  procedimentoId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVincular = async () => {
    if (!paciente || !paciente.id) {
      toast({
        title: "Erro",
        description: "Selecione um paciente para vincular",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Vincula o paciente ao procedimento
      await procedimentosRapidosService.vincularPaciente(procedimentoId, paciente.id);

      toast({
        title: "Sucesso",
        description: `Paciente ${paciente.nomeCompleto} vinculado com sucesso`,
      });

      // Limpa formulário
      setPaciente(null);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao vincular paciente:", error);
      toast({
        title: "Erro",
        description: error?.response?.data?.message || error?.message || "Erro ao vincular paciente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPaciente(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Vincular Usuário ao Procedimento
          </DialogTitle>
          <DialogDescription>
            Este procedimento foi criado para um usuário não identificado. Selecione o paciente
            cadastrado no sistema para vincular ao atendimento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> Ao vincular um paciente, todas as informações do procedimento
              serão associadas a este paciente. Esta ação não pode ser desfeita.
            </AlertDescription>
          </Alert>

          {/* Seleção de Paciente */}
          <div className="space-y-2">
            <Label htmlFor="paciente">
              Paciente Cadastrado <span className="text-red-500">*</span>
            </Label>
            <PacienteAutocomplete
              pacienteSelecionado={paciente ? { id: paciente.id, nomeCompleto: paciente.nomeCompleto } : null}
              onPacienteSelecionado={(p) => {
                setPaciente(p ? { id: p.id, nomeCompleto: p.nomeCompleto } : null);
              }}
              placeholder="Digite o nome ou CPF do paciente..."
            />
            <p className="text-xs text-muted-foreground">
              Comece a digitar e selecione o paciente cadastrado no sistema
            </p>
          </div>

          {/* Informações do Paciente Selecionado */}
          {paciente && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-900">Paciente Selecionado</span>
              </div>
              <div className="text-sm text-blue-800">
                <p><strong>Nome:</strong> {paciente.nomeCompleto}</p>
                {paciente.cpf && (
                  <p><strong>CPF:</strong> {paciente.cpf}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleVincular} disabled={loading || !paciente}>
            {loading ? "Vinculando..." : "Confirmar Vínculo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VincularUsuarioDialog;

