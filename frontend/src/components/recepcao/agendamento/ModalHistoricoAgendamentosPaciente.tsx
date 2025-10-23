import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import agendamentoExameService, { AgendamentoExameDTO } from '@/services/agendamento/agendamentoExameService';

interface ModalHistoricoAgendamentosPacienteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacienteId: number;
  pacienteNome?: string;
}

/**
 * Modal que exibe o histórico de agendamentos (inclusive cancelados)
 * de um paciente, reaproveitando o endpoint existente
 * GET /agendamentos-exames/paciente/{pacienteId}.
 */
export default function ModalHistoricoAgendamentosPaciente({
  open,
  onOpenChange,
  pacienteId,
  pacienteNome,
}: ModalHistoricoAgendamentosPacienteProps) {
  const [itens, setItens] = useState<AgendamentoExameDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !pacienteId) return;
    let ativo = true;
    (async () => {
      try {
        setLoading(true);
        setErro(null);
        const { data } = await agendamentoExameService.listarPorPaciente(pacienteId);
        if (!ativo) return;
        setItens(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!ativo) return;
        setErro(e?.response?.data?.message || 'Erro ao carregar histórico');
        setItens([]);
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [open, pacienteId]);

  const titulo = useMemo(
    () => `Histórico de Agendamentos${pacienteNome ? ` — ${pacienteNome}` : ''}`,
    [pacienteNome]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>
            Listagem cronológica dos agendamentos do paciente, incluindo cancelamentos e respectivos motivos.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Carregando histórico...</div>
        ) : erro ? (
          <div className="py-10 text-center text-red-600">{erro}</div>
        ) : itens.length === 0 ? (
          <div className="py-10 text-center text-gray-500">Nenhum agendamento encontrado.</div>
        ) : (
          <div className="space-y-3">
            {itens.map((ag) => (
              <Card key={ag.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Protocolo #{ag.protocolo}</div>
                    <div className="font-medium">
                      {new Date(ag.dataHoraExame).toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-700">
                      {ag.examesAgendados?.length
                        ? ag.examesAgendados.map((e) => e.exameNome).join(', ')
                        : 'Agendamento'}
                    </div>
                  </div>
                  <Badge variant={ag.status === 'CANCELADO' ? 'destructive' : 'default'}>
                    {ag.status}
                  </Badge>
                </div>

                {ag.status === 'CANCELADO' && (
                  <div className="mt-3 text-sm">
                    <Separator className="my-2" />
                    <div className="text-red-700 font-medium">Cancelado</div>
                    <div>Motivo: {ag.motivoCancelamento || '-'}</div>
                    <div>
                      Por: {ag.usuarioCancelamento || '-'} em{' '}
                      {ag.dataCancelamento
                        ? new Date(ag.dataCancelamento).toLocaleString('pt-BR')
                        : '-'}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


