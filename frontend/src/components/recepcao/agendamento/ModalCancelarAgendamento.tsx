import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { XCircle, AlertCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { AgendamentoExameDTO } from '@/services/agendamento/agendamentoExameService';

interface ModalCancelarAgendamentoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento: AgendamentoExameDTO;
  onCancelar: (motivo: string) => void;
}

export default function ModalCancelarAgendamento({
  open,
  onOpenChange,
  agendamento,
  onCancelar
}: ModalCancelarAgendamentoProps) {
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');

  const handleCancelar = () => {
    if (!motivo.trim()) {
      setErro('Por favor, informe o motivo do cancelamento');
      return;
    }
    
    if (motivo.trim().length < 10) {
      setErro('O motivo deve ter pelo menos 10 caracteres');
      return;
    }
    
    onCancelar(motivo);
    setMotivo('');
    setErro('');
  };

  const handleClose = () => {
    setMotivo('');
    setErro('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            Cancelar Agendamento
          </DialogTitle>
          <DialogDescription>
            Esta ação não poderá ser desfeita. O paciente será notificado do cancelamento.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você está prestes a cancelar o agendamento:
            <div className="mt-2 space-y-1">
              <p><strong>Protocolo:</strong> {agendamento.protocolo}</p>
              <p><strong>Paciente:</strong> {agendamento.pacienteNome}</p>
              <p><strong>Data:</strong> {format(new Date(agendamento.dataHoraExame), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="motivo">Motivo do Cancelamento *</Label>
            <Textarea
              id="motivo"
              placeholder="Descreva o motivo do cancelamento..."
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setErro('');
              }}
              className="mt-1"
              rows={4}
            />
            {erro && (
              <p className="text-sm text-red-600 mt-1">{erro}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Manter Agendamento
          </Button>
          <Button 
            onClick={handleCancelar} 
            variant="destructive"
          >
            Confirmar Cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}