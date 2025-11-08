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
import { Loader2, Activity } from "lucide-react";
import {
  procedimentosRapidosService,
  CriarProcedimentoRapidoRequest,
} from "@/services/procedimentosRapidosService";
import { useToast } from "@/hooks/use-toast";
import PacienteAutocomplete from "@/components/upa/PacienteAutocomplete";

interface NovoProcedimentoRapidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Dialog para criar um novo Procedimento Rápido
 * Permite selecionar um paciente e criar um procedimento diretamente
 */
export const NovoProcedimentoRapidoDialog: React.FC<
  NovoProcedimentoRapidoDialogProps
> = ({ open, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paciente, setPaciente] = useState<{ id: number; nomeCompleto: string } | null>(null);
  const [formData, setFormData] = useState<CriarProcedimentoRapidoRequest>({
    pacienteId: 0,
    origemEncaminhamento: "",
    medicoSolicitante: "",
    especialidadeOrigem: "",
    alergias: "",
    observacoesGerais: "",
    atividades: [],
  });

  const handleSubmit = async () => {
    if (!paciente || !paciente.id) {
      toast({
        title: "Erro",
        description: "Selecione um paciente",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const request: CriarProcedimentoRapidoRequest = {
        ...formData,
        pacienteId: paciente.id,
      };

      await procedimentosRapidosService.criar(request);

      toast({
        title: "Sucesso!",
        description: "Procedimento rápido criado com sucesso",
      });

      // Limpa o formulário
      setPaciente(null);
      setFormData({
        pacienteId: 0,
        origemEncaminhamento: "",
        medicoSolicitante: "",
        especialidadeOrigem: "",
        alergias: "",
        observacoesGerais: "",
        atividades: [],
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Erro ao criar procedimento rápido",
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
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Novo Procedimento Rápido
          </DialogTitle>
          <DialogDescription>
            Crie um novo procedimento de cuidados de enfermagem para um paciente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Seleção de Paciente */}
          <div className="space-y-2">
            <Label htmlFor="paciente">Paciente *</Label>
            <PacienteAutocomplete
              pacienteSelecionado={paciente}
              onPacienteSelecionado={(p) => {
                setPaciente(p ? { id: p.id, nomeCompleto: p.nomeCompleto } : null);
                if (p) {
                  setFormData({ ...formData, pacienteId: p.id });
                }
              }}
              placeholder="Digite o nome do paciente..."
            />
            <p className="text-xs text-muted-foreground">
              Comece a digitar e selecione o paciente
            </p>
          </div>

          {/* Origem do Encaminhamento */}
          <div className="space-y-2">
            <Label htmlFor="origem">Origem do Encaminhamento</Label>
            <Input
              id="origem"
              type="text"
              placeholder="Ex: Atendimento Ambulatorial, UPA, etc."
              value={formData.origemEncaminhamento}
              onChange={(e) =>
                setFormData({ ...formData, origemEncaminhamento: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {/* Médico Solicitante */}
          <div className="space-y-2">
            <Label htmlFor="medico">Médico Solicitante</Label>
            <Input
              id="medico"
              type="text"
              placeholder="Nome do médico solicitante"
              value={formData.medicoSolicitante}
              onChange={(e) =>
                setFormData({ ...formData, medicoSolicitante: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {/* Especialidade */}
          <div className="space-y-2">
            <Label htmlFor="especialidade">Especialidade</Label>
            <Input
              id="especialidade"
              type="text"
              placeholder="Ex: Clínica Geral, Pediatria, etc."
              value={formData.especialidadeOrigem}
              onChange={(e) =>
                setFormData({ ...formData, especialidadeOrigem: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {/* Alergias */}
          <div className="space-y-2">
            <Label htmlFor="alergias">Alergias</Label>
            <Input
              id="alergias"
              type="text"
              placeholder="Liste as alergias conhecidas do paciente"
              value={formData.alergias}
              onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
              disabled={loading}
            />
          </div>

          {/* Observações Gerais */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Gerais</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais sobre o procedimento..."
              value={formData.observacoesGerais}
              onChange={(e) =>
                setFormData({ ...formData, observacoesGerais: e.target.value })
              }
              disabled={loading}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !paciente}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Procedimento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NovoProcedimentoRapidoDialog;

