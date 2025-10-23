import api from '@/lib/api';

export interface HorarioExameDTO {
  id?: number;
  profissionalId?: number;
  profissionalNome?: string;
  salaId?: number;
  salaNome?: string;
  unidadeId: number;
  unidadeNome?: string;
  exameCodigo?: string;
  exameNome?: string;
  tipoAgendamento: 'INTERNO' | 'EXTERNO' | 'AMBOS';
  diaSemana: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  diaSemanaTexto?: string;
  horaInicio: string; // HH:mm
  horaFim: string; // HH:mm
  intervaloMinutos: number;
  vagasPorHorario: number;
  permiteEncaixe: boolean;
  ativo: boolean;
  observacoes?: string;
  quantidadeSlots?: number;
  vagasTotais?: number;
}

export interface DisponibilidadeHorario {
  horario: string; // HH:mm
  vagas: number;
  ocupadas: number;
  disponiveis: number;
  percentualOcupacao: number;
  cor: 'verde' | 'amarelo' | 'vermelho';
  permiteAgendamento: boolean;
}

const horarioExameService = {
  listarTodos: () => api.get<HorarioExameDTO[]>('/horarios-exames'),

  listarPorUnidade: (unidadeId: number) =>
    api.get<HorarioExameDTO[]>(`/horarios-exames/unidade/${unidadeId}`),

  listarPorProfissional: (profissionalId: number) =>
    api.get<HorarioExameDTO[]>(`/horarios-exames/profissional/${profissionalId}`),

  listarPorData: (unidadeId: number, data: string) =>
    api.get<HorarioExameDTO[]>(`/horarios-exames/por-data?unidadeId=${unidadeId}&data=${data}`),

  buscarPorId: (id: number) =>
    api.get<HorarioExameDTO>(`/horarios-exames/${id}`),

  criar: (horario: HorarioExameDTO) =>
    api.post<HorarioExameDTO>('/horarios-exames', horario),

  atualizar: (id: number, horario: HorarioExameDTO) =>
    api.put<HorarioExameDTO>(`/horarios-exames/${id}`, horario),

  deletar: (id: number) =>
    api.delete(`/horarios-exames/${id}`),

  ativar: (id: number) =>
    api.patch(`/horarios-exames/${id}/ativar`),

  /**
   * Calcula a disponibilidade de horários para uma data específica
   */
  calcularDisponibilidade: async (
    unidadeId: number,
    data: string,
    agendamentosExistentes: number = 0
  ): Promise<DisponibilidadeHorario[]> => {
    try {
      const response = await horarioExameService.listarPorData(unidadeId, data);
      const horarios = response.data;

      // Agrupa horários por slot de tempo
      const disponibilidade: Map<string, DisponibilidadeHorario> = new Map();

      horarios.forEach(horario => {
        if (!horario.ativo) return;

        const inicio = parseTime(horario.horaInicio);
        const fim = parseTime(horario.horaFim);
        const intervalo = horario.intervaloMinutos;

        let currentTime = inicio;

        while (currentTime < fim) {
          const horarioStr = formatTime(currentTime);
          const existing = disponibilidade.get(horarioStr);

          const vagas = horario.vagasPorHorario;

          if (existing) {
            existing.vagas += vagas;
          } else {
            disponibilidade.set(horarioStr, {
              horario: horarioStr,
              vagas,
              ocupadas: 0, // TODO: buscar agendamentos existentes
              disponiveis: vagas,
              percentualOcupacao: 0,
              cor: 'verde',
              permiteAgendamento: true
            });
          }

          currentTime += intervalo * 60000; // converter minutos para ms
        }
      });

      // Calcular cores baseado na ocupação
      const result = Array.from(disponibilidade.values()).map(d => {
        d.percentualOcupacao = d.vagas > 0 ? (d.ocupadas / d.vagas) * 100 : 0;

        if (d.percentualOcupacao >= 100) {
          d.cor = 'vermelho';
          d.permiteAgendamento = false;
        } else if (d.percentualOcupacao >= 50) {
          d.cor = 'amarelo';
          d.permiteAgendamento = true;
        } else {
          d.cor = 'verde';
          d.permiteAgendamento = true;
        }

        return d;
      });

      return result.sort((a, b) => a.horario.localeCompare(b.horario));
    } catch (error) {
      console.error('Erro ao calcular disponibilidade:', error);
      return [];
    }
  }
};

// Helpers
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toTimeString().substring(0, 5);
}

export default horarioExameService;
