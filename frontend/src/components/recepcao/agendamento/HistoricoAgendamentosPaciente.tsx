import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import agendamentoExameService, { AgendamentoExameDTO } from '@/services/agendamento/agendamentoExameService';

interface Props {
  pacienteId: number;
}

/**
 * Lista o histórico de agendamentos (inclui cancelados) para um paciente,
 * com filtros simples (período, status e busca textual).
 * Reaproveita o endpoint existente: GET /agendamentos-exames/paciente/{pacienteId}
 */
export default function HistoricoAgendamentosPaciente({ pacienteId }: Props) {
  const [itens, setItens] = useState<AgendamentoExameDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Filtros
  const [status, setStatus] = useState<string>('TODOS');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [busca, setBusca] = useState<string>('');

  useEffect(() => {
    if (!pacienteId) return;
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
  }, [pacienteId]);

  const itensFiltrados = useMemo(() => {
    const inicioTs = dataInicio ? new Date(dataInicio + 'T00:00:00').getTime() : null;
    const fimTs = dataFim ? new Date(dataFim + 'T23:59:59').getTime() : null;

    return itens.filter((ag) => {
      // filtro status
      if (status !== 'TODOS' && ag.status !== status) return false;

      // filtro período
      const ts = ag.dataHoraExame ? new Date(ag.dataHoraExame).getTime() : 0;
      if (inicioTs && ts < inicioTs) return false;
      if (fimTs && ts > fimTs) return false;

      // busca textual (protocolo, paciente, exames)
      if (busca) {
        const termo = busca.toLowerCase();
        const examesStr = Array.isArray(ag.examesAgendados)
          ? ag.examesAgendados.map((e) => `${e.exameNome} ${e.exameCodigo}`.toLowerCase()).join(' | ')
          : '';
        const alvo = `${ag.protocolo || ''} ${ag.pacienteNome || ''} ${examesStr}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      return true;
    });
  }, [itens, status, dataInicio, dataFim, busca]);

  return (
    <div className="space-y-4">
      {/* Filtros compactos para não cansar a leitura */}
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-40"
          />
          <span className="text-gray-500">até</span>
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="AGENDADO">Agendado</SelectItem>
              <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
              <SelectItem value="AGUARDANDO_ATENDIMENTO">Aguardando</SelectItem>
              <SelectItem value="EM_ATENDIMENTO">Em Atendimento</SelectItem>
              <SelectItem value="REALIZADO">Realizado</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
              <SelectItem value="NAO_COMPARECEU">Não Compareceu</SelectItem>
              <SelectItem value="REAGENDADO">Reagendado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Input
            placeholder="Buscar por protocolo, paciente ou exame..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div>
          <Button variant="outline" onClick={() => { setStatus('TODOS'); setDataInicio(''); setDataFim(''); setBusca(''); }}>
            Limpar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Carregando histórico...</div>
      ) : erro ? (
        <div className="py-10 text-center text-red-600">{erro}</div>
      ) : itensFiltrados.length === 0 ? (
        <div className="py-10 text-center text-gray-500">Nenhum agendamento encontrado.</div>
      ) : (
        <div className="space-y-3">
          {itensFiltrados.map((ag) => (
            <Card key={ag.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">Protocolo #{ag.protocolo}</div>
                  <div className="font-medium">
                    {ag.dataHoraExame ? new Date(ag.dataHoraExame).toLocaleString('pt-BR') : '-'}
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
    </div>
  );
}


