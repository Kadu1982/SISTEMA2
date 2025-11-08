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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { procedimentosRapidosService, AtividadeEnfermagemDTO } from "@/services/procedimentosRapidosService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface AprazarAtividadeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atividade: AtividadeEnfermagemDTO | null;
  procedimentoId: number;
  onSuccess: () => void;
}

const AprazarAtividadeDialog: React.FC<AprazarAtividadeDialogProps> = ({
  open,
  onOpenChange,
  atividade,
  procedimentoId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [dataHora, setDataHora] = useState<Date | undefined>(undefined);
  const [hora, setHora] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Inicializa com a data/hora atual quando abre
  React.useEffect(() => {
    if (open && atividade) {
      const agora = new Date();
      setDataHora(agora);
      setHora(format(agora, "HH:mm"));
    }
  }, [open, atividade]);

  const handleAprazar = async () => {
    if (!atividade || !dataHora || !hora) {
      toast({
        title: "Erro",
        description: "Data e hora são obrigatórias",
        variant: "destructive",
      });
      return;
    }

    // Combina data e hora
    const [horas, minutos] = hora.split(":");
    const dataHoraCompleta = new Date(dataHora);
    dataHoraCompleta.setHours(parseInt(horas, 10));
    dataHoraCompleta.setMinutes(parseInt(minutos, 10));
    dataHoraCompleta.setSeconds(0);
    dataHoraCompleta.setMilliseconds(0);

    // Validações
    const agora = new Date();
    const umDiaDepois = new Date(agora);
    umDiaDepois.setDate(umDiaDepois.getDate() + 1);

    if (dataHoraCompleta < agora) {
      toast({
        title: "Erro",
        description: "O novo horário deve ser maior que a data/hora atual",
        variant: "destructive",
      });
      return;
    }

    if (dataHoraCompleta > umDiaDepois) {
      toast({
        title: "Erro",
        description: "O aprazamento não pode ser superior a 1 dia a partir da data atual",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await procedimentosRapidosService.aprazarAtividade(procedimentoId, atividade.id!, {
        novoHorario: dataHoraCompleta.toISOString(),
        motivoAlteracao: motivo.trim() || undefined,
      });

      toast({
        title: "Sucesso",
        description: "Atividade aprazada com sucesso",
      });

      // Limpa formulário
      setDataHora(undefined);
      setHora("");
      setMotivo("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao aprazar atividade:", error);
      toast({
        title: "Erro",
        description: error?.response?.data?.message || error?.message || "Erro ao aprazar atividade",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDataHora(undefined);
    setHora("");
    setMotivo("");
    onOpenChange(false);
  };

  if (!atividade) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Aprazar Atividade</DialogTitle>
          <DialogDescription>
            Ajuste o horário de execução da atividade. O sistema recalculará automaticamente os horários das atividades relacionadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informações da atividade */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atividade:</strong> {atividade.atividade}
              {atividade.horariosAprazados && atividade.horariosAprazados.length > 0 && (
                <div className="mt-2">
                  <strong>Horário atual:</strong>{" "}
                  {format(new Date(atividade.horariosAprazados[0]), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </div>
              )}
            </AlertDescription>
          </Alert>

          {/* Data */}
          <div>
            <Label htmlFor="data">
              Nova Data <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !dataHora && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dataHora ? (
                    format(dataHora, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dataHora}
                  onSelect={setDataHora}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Hora */}
          <div>
            <Label htmlFor="hora">
              Nova Hora <span className="text-red-500">*</span>
            </Label>
            <Input
              id="hora"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              disabled={loading}
              className="mt-1"
              required
            />
          </div>

          {/* Motivo da alteração */}
          <div>
            <Label htmlFor="motivo">Motivo da Alteração</Label>
            <Textarea
              id="motivo"
              placeholder="Informe o motivo da alteração do horário..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={loading}
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Alerta sobre recálculo */}
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> Ao alterar o horário desta atividade, todas as atividades pendentes
              relacionadas serão recalculadas automaticamente respeitando o intervalo e período solicitado.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleAprazar} disabled={loading || !dataHora || !hora}>
            {loading ? "Aprazando..." : "Confirmar Aprazamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AprazarAtividadeDialog;

