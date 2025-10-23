import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Calendar, Clock, User } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { AgendamentoExameDTO } from '@/services/agendamento/agendamentoExameService';

interface ModalConfirmarAgendamentoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento: AgendamentoExameDTO;
  onConfirm: () => void;
}

export default function ModalConfirmarAgendamento({
  open,
  onOpenChange,
  agendamento,
  onConfirm
}: ModalConfirmarAgendamentoProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Confirmar Agendamento
          </DialogTitle>
          <DialogDescription>
            Deseja confirmar este agendamento de exame?
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <span className="text-sm text-gray-600">Protocolo:</span>
              <p className="font-mono font-medium">{agendamento.protocolo}</p>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-medium">{agendamento.pacienteNome}</p>
                <p className="text-sm text-gray-600">CPF: {agendamento.pacienteCpf}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  {format(new Date(agendamento.dataHoraExame), "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  {format(new Date(agendamento.dataHoraExame), 'HH:mm')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-gray-600">Exames:</span>
              {agendamento.examesAgendados.map((exame, idx) => (
                <Badge key={idx} variant="outline" className="mr-2">
                  {exame.exameNome}
                </Badge>
              ))}
            </div>

            {agendamento.contatoPaciente && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-800">Contato do paciente:</p>
                <p className="text-sm text-blue-700">{agendamento.contatoPaciente}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
            Confirmar Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}