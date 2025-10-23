import api from '@/lib/api';

export interface BloqueioHorarioDTO {
  id?: number;
  profissionalId?: number;
  profissionalNome?: string;
  salaId?: number;
  salaNome?: string;
  unidadeId: number;
  unidadeNome?: string;
  tipoBloqueio: 'FERIAS' | 'FERIADO' | 'MANUTENCAO' | 'EVENTO' | 'LICENCA' | 'AUSENCIA' | 'OUTRO';
  tipoBloqueioTexto?: string;
  dataInicio: string; // YYYY-MM-DD
  dataFim?: string; // YYYY-MM-DD
  horaInicio?: string; // HH:mm
  horaFim?: string; // HH:mm
  diaInteiro: boolean;
  motivo: string;
  ativo: boolean;
  operadorBloqueioId?: number;
  operadorBloqueioNome?: string;
}

export const TIPOS_BLOQUEIO = [
  { value: 'FERIAS', label: 'Férias' },
  { value: 'FERIADO', label: 'Feriado' },
  { value: 'MANUTENCAO', label: 'Manutenção/Reforma' },
  { value: 'EVENTO', label: 'Evento/Reunião' },
  { value: 'LICENCA', label: 'Licença Médica' },
  { value: 'AUSENCIA', label: 'Ausência Temporária' },
  { value: 'OUTRO', label: 'Outro' }
] as const;

const bloqueioHorarioService = {
  listarTodos: () => api.get<BloqueioHorarioDTO[]>('/bloqueios-horarios'),

  listarPorUnidade: (unidadeId: number) =>
    api.get<BloqueioHorarioDTO[]>(`/bloqueios-horarios/unidade/${unidadeId}`),

  listarPorData: (unidadeId: number, data: string) =>
    api.get<BloqueioHorarioDTO[]>(`/bloqueios-horarios/por-data?unidadeId=${unidadeId}&data=${data}`),

  listarPorPeriodo: (unidadeId: number, inicio: string, fim: string) =>
    api.get<BloqueioHorarioDTO[]>(
      `/bloqueios-horarios/por-periodo?unidadeId=${unidadeId}&inicio=${inicio}&fim=${fim}`
    ),

  buscarPorId: (id: number) =>
    api.get<BloqueioHorarioDTO>(`/bloqueios-horarios/${id}`),

  criar: (bloqueio: BloqueioHorarioDTO) =>
    api.post<BloqueioHorarioDTO>('/bloqueios-horarios', bloqueio),

  atualizar: (id: number, bloqueio: BloqueioHorarioDTO) =>
    api.put<BloqueioHorarioDTO>(`/bloqueios-horarios/${id}`, bloqueio),

  deletar: (id: number) =>
    api.delete(`/bloqueios-horarios/${id}`),

  /**
   * Verifica se uma data específica está bloqueada
   */
  verificarBloqueio: async (
    unidadeId: number,
    data: string,
    hora?: string
  ): Promise<boolean> => {
    try {
      const response = await bloqueioHorarioService.listarPorData(unidadeId, data);
      const bloqueios = response.data;

      if (bloqueios.length === 0) return false;

      // Verifica se algum bloqueio ativo afeta este horário
      return bloqueios.some(bloqueio => {
        if (!bloqueio.ativo) return false;

        // Se bloqueia dia inteiro
        if (bloqueio.diaInteiro) return true;

        // Se não tem horários específicos, bloqueia o dia todo
        if (!bloqueio.horaInicio || !bloqueio.horaFim) return true;

        // Se não foi especificada hora, considera bloqueado
        if (!hora) return true;

        // Verifica se a hora está dentro do período bloqueado
        return hora >= bloqueio.horaInicio && hora <= bloqueio.horaFim;
      });
    } catch (error) {
      console.error('Erro ao verificar bloqueio:', error);
      return false;
    }
  },

  /**
   * Retorna os bloqueios de um período no formato de eventos de calendário
   */
  obterEventosCalendario: async (
    unidadeId: number,
    inicio: string,
    fim: string
  ): Promise<Array<{
    date: string;
    title: string;
    tipo: BloqueioHorarioDTO['tipoBloqueio'];
    bloqueio: BloqueioHorarioDTO;
  }>> => {
    try {
      const response = await bloqueioHorarioService.listarPorPeriodo(unidadeId, inicio, fim);
      const bloqueios = response.data;

      const eventos: Array<any> = [];

      bloqueios.forEach(bloqueio => {
        if (!bloqueio.ativo) return;

        const dataInicio = new Date(bloqueio.dataInicio);
        const dataFim = bloqueio.dataFim ? new Date(bloqueio.dataFim) : dataInicio;

        // Cria evento para cada dia do período
        for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + 1)) {
          eventos.push({
            date: d.toISOString().split('T')[0],
            title: bloqueio.tipoBloqueioTexto || bloqueio.tipoBloqueio,
            tipo: bloqueio.tipoBloqueio,
            bloqueio
          });
        }
      });

      return eventos;
    } catch (error) {
      console.error('Erro ao obter eventos de calendário:', error);
      return [];
    }
  }
};

export default bloqueioHorarioService;
