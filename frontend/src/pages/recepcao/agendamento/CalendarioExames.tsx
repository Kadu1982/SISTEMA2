import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, AlertCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import horarioExameService, { DisponibilidadeHorario } from '@/services/agendamento/horarioExameService';
import bloqueioHorarioService from '@/services/agendamento/bloqueioHorarioService';

interface CalendarioExamesProps {
  unidadeId: number;
  onSelecionarHorario?: (data: Date, horario: string) => void;
}

interface DiaCalendario {
  data: Date;
  disponibilidade: 'alta' | 'media' | 'baixa' | 'bloqueado';
  percentualOcupacao: number;
  bloqueado: boolean;
  motivo?: string;
}

const CalendarioExames: React.FC<CalendarioExamesProps> = ({ unidadeId, onSelecionarHorario }) => {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date());
  const [diasCalendario, setDiasCalendario] = useState<Map<string, DiaCalendario>>(new Map());
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<DisponibilidadeHorario[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados do mês
  useEffect(() => {
    carregarMes();
  }, [mesAtual, unidadeId]);

  // Carregar horários do dia selecionado
  useEffect(() => {
    if (dataSelecionada) {
      carregarHorariosDia(dataSelecionada);
    }
  }, [dataSelecionada]);

  const carregarMes = async () => {
    setLoading(true);
    try {
      const inicio = startOfMonth(mesAtual);
      const fim = endOfMonth(mesAtual);
      const dias = eachDayOfInterval({ start: inicio, end: fim });

      // Carregar bloqueios do período
      const bloqueiosResponse = await bloqueioHorarioService.listarPorPeriodo(
        unidadeId,
        format(inicio, 'yyyy-MM-dd'),
        format(fim, 'yyyy-MM-dd')
      );

      const bloqueiosPorData = new Map<string, any>();
      bloqueiosResponse.data.forEach(bloqueio => {
        const key = bloqueio.dataInicio;
        bloqueiosPorData.set(key, bloqueio);
      });

      // Carregar disponibilidade para cada dia
      const novoDiasCalendario = new Map<string, DiaCalendario>();

      for (const dia of dias) {
        const dataStr = format(dia, 'yyyy-MM-dd');
        const bloqueio = bloqueiosPorData.get(dataStr);

        if (bloqueio && bloqueio.ativo) {
          novoDiasCalendario.set(dataStr, {
            data: dia,
            disponibilidade: 'bloqueado',
            percentualOcupacao: 100,
            bloqueado: true,
            motivo: bloqueio.motivo
          });
        } else {
          // TODO: Calcular disponibilidade real baseado em agendamentos
          novoDiasCalendario.set(dataStr, {
            data: dia,
            disponibilidade: 'alta',
            percentualOcupacao: 0,
            bloqueado: false
          });
        }
      }

      setDiasCalendario(novoDiasCalendario);
    } catch (error) {
      console.error('Erro ao carregar calendário:', error);
      toast.error('Erro ao carregar calendário');
    } finally {
      setLoading(false);
    }
  };

  const carregarHorariosDia = async (data: Date) => {
    setLoading(true);
    try {
      const dataStr = format(data, 'yyyy-MM-dd');
      const disponibilidade = await horarioExameService.calcularDisponibilidade(unidadeId, dataStr);
      setHorariosDisponiveis(disponibilidade);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      toast.error('Erro ao carregar horários disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const handleMesAnterior = () => {
    setMesAtual(subMonths(mesAtual, 1));
  };

  const handleProximoMes = () => {
    setMesAtual(addMonths(mesAtual, 1));
  };

  const getCorDisponibilidade = (disponibilidade: DiaCalendario['disponibilidade']) => {
    switch (disponibilidade) {
      case 'alta': return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'media': return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200';
      case 'baixa': return 'bg-orange-100 border-orange-300 hover:bg-orange-200';
      case 'bloqueado': return 'bg-red-100 border-red-300 hover:bg-red-200';
      default: return 'bg-gray-100 border-gray-300 hover:bg-gray-200';
    }
  };

  const getCorHorario = (cor: DisponibilidadeHorario['cor']) => {
    switch (cor) {
      case 'verde': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'amarelo': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'vermelho': return 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed';
    }
  };

  return (
    <div className="space-y-6">
      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Legenda de Disponibilidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-500"></div>
              <span className="text-sm">Alta disponibilidade (&gt;50% vagas)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-yellow-500"></div>
              <span className="text-sm">Média disponibilidade (20-50% vagas)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-orange-500"></div>
              <span className="text-sm">Baixa disponibilidade (&lt;20% vagas)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-red-500"></div>
              <span className="text-sm">Bloqueado / Sem vagas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendário Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleMesAnterior}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleProximoMes}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Selecione uma data para ver os horários disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={dataSelecionada}
              onSelect={setDataSelecionada}
              month={mesAtual}
              onMonthChange={setMesAtual}
              locale={ptBR}
              className="rounded-md border"
              modifiers={{
                bloqueado: (date) => {
                  const dataStr = format(date, 'yyyy-MM-dd');
                  const dia = diasCalendario.get(dataStr);
                  return dia?.bloqueado || false;
                },
                altaDisponibilidade: (date) => {
                  const dataStr = format(date, 'yyyy-MM-dd');
                  const dia = diasCalendario.get(dataStr);
                  return dia?.disponibilidade === 'alta';
                },
                mediaDisponibilidade: (date) => {
                  const dataStr = format(date, 'yyyy-MM-dd');
                  const dia = diasCalendario.get(dataStr);
                  return dia?.disponibilidade === 'media';
                },
                baixaDisponibilidade: (date) => {
                  const dataStr = format(date, 'yyyy-MM-dd');
                  const dia = diasCalendario.get(dataStr);
                  return dia?.disponibilidade === 'baixa';
                }
              }}
              modifiersClassNames={{
                bloqueado: 'bg-red-100 text-red-900',
                altaDisponibilidade: 'bg-green-100 text-green-900',
                mediaDisponibilidade: 'bg-yellow-100 text-yellow-900',
                baixaDisponibilidade: 'bg-orange-100 text-orange-900'
              }}
            />
          </CardContent>
        </Card>

        {/* Horários do Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horários Disponíveis
            </CardTitle>
            <CardDescription>
              {dataSelecionada
                ? format(dataSelecionada, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                : 'Selecione uma data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !dataSelecionada ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mb-2" />
                <p>Selecione uma data no calendário</p>
              </div>
            ) : horariosDisponiveis.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mb-2" />
                <p>Nenhum horário disponível nesta data</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {horariosDisponiveis.map((horario) => (
                  <Button
                    key={horario.horario}
                    variant="outline"
                    className={`${getCorHorario(horario.cor)} flex flex-col items-center py-4`}
                    disabled={!horario.permiteAgendamento}
                    onClick={() => {
                      if (onSelecionarHorario && dataSelecionada) {
                        onSelecionarHorario(dataSelecionada, horario.horario);
                      }
                    }}
                  >
                    <span className="font-bold text-lg">{horario.horario}</span>
                    <span className="text-xs mt-1">
                      {horario.disponiveis} vaga{horario.disponiveis !== 1 ? 's' : ''}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarioExames;
