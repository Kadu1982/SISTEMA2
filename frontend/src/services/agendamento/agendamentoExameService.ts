import api from '@/lib/api';

/**
 * Interface do agendamento de exame
 */
export interface AgendamentoExameDTO {
  id?: number;
  protocolo: string;
  
  // Dados do paciente
  pacienteId: number;
  pacienteNome: string;
  pacienteCpf?: string;
  pacienteTelefone?: string;
  
  // Dados do agendamento
  dataAgendamento: string; // ISO datetime
  dataHoraExame: string; // ISO datetime
  horarioExameId?: number;
  
  // Profissional e local
  profissionalId?: number;
  profissionalNome?: string;
  salaId?: number;
  salaNome?: string;
  unidadeId: number;
  unidadeNome?: string;
  
  // Status e tipo
  status: 'AGENDADO' | 'CONFIRMADO' | 'AGUARDANDO_ATENDIMENTO' | 'EM_ATENDIMENTO' | 
          'REALIZADO' | 'CANCELADO' | 'NAO_COMPARECEU' | 'REAGENDADO';
  tipoAgendamento: 'INTERNO' | 'EXTERNO' | 'AMBOS';
  
  // Solicitação
  origemSolicitacao?: string;
  solicitanteId?: number;
  solicitanteNome?: string;
  autorizacaoConvenio?: string;
  guiaConvenio?: string;
  
  // Exames
  examesAgendados: ExameAgendadoDTO[];
  
  // Informações adicionais
  observacoes?: string;
  preparacaoPaciente?: string;
  contatoPaciente?: string;
  emailPaciente?: string;
  
  // Confirmação
  confirmado: boolean;
  dataConfirmacao?: string;
  usuarioConfirmacao?: string;
  
  // Flags
  encaixe: boolean;
  prioridade: boolean;
  
  // Cancelamento
  motivoCancelamento?: string;
  dataCancelamento?: string;
  usuarioCancelamento?: string;
  
  // Realização
  dataRealizacao?: string;
  usuarioRealizacao?: string;
  
  // Comprovante
  comprovantePdf?: string;
  
  // Auditoria
  dataCriacao: string;
  dataAtualizacao?: string;
  usuarioCriacao?: string;
  usuarioAtualizacao?: string;
  
  // Dados calculados
  duracaoTotalEstimada?: number;
  requerPreparoEspecial?: boolean;
  atrasado?: boolean;
  podeSerCancelado?: boolean;
  podeSerConfirmado?: boolean;
  podeSerRealizado?: boolean;
}

export interface ExameAgendadoDTO {
  exameCodigo: string;
  exameNome: string;
  categoria?: string;
  duracaoEstimada?: number;
  requerPreparo?: boolean;
  descricaoPreparo?: string;
  observacoesEspecificas?: string;
  materialColeta?: string;
  quantidadeMaterial?: string;
}

export interface NovoAgendamentoExameRequest {
  pacienteId: number;
  dataHoraExame: string;
  horarioExameId?: number;
  profissionalId?: number;
  salaId?: number;
  unidadeId: number;
  tipoAgendamento: 'INTERNO' | 'EXTERNO' | 'AMBOS';
  origemSolicitacao?: string;
  solicitanteId?: number;
  solicitanteNome?: string;
  autorizacaoConvenio?: string;
  guiaConvenio?: string;
  exames: ExameRequest[];
  observacoes?: string;
  preparacaoPaciente?: string;
  contatoPaciente?: string;
  emailPaciente?: string;
  encaixe?: boolean;
  prioridade?: boolean;
}

export interface ExameRequest {
  exameCodigo: string;
  exameNome: string;
  categoria?: string;
  duracaoEstimada?: number;
  requerPreparo?: boolean;
  descricaoPreparo?: string;
  observacoesEspecificas?: string;
  materialColeta?: string;
  quantidadeMaterial?: string;
}

/**
 * Service para gerenciamento de agendamentos de exames
 */
const agendamentoExameService = {
  /**
   * Cria novo agendamento de exame
   */
  criar: (request: NovoAgendamentoExameRequest) =>
    api.post<AgendamentoExameDTO>('/agendamentos-exames', request),

  /**
   * Busca agendamento por ID
   */
  buscarPorId: (id: number) =>
    api.get<AgendamentoExameDTO>(`/agendamentos-exames/${id}`),

  /**
   * Busca agendamento por protocolo
   */
  buscarPorProtocolo: (protocolo: string) =>
    api.get<AgendamentoExameDTO>(`/agendamentos-exames/protocolo/${protocolo}`),

  /**
   * Lista agendamentos por paciente
   */
  listarPorPaciente: (pacienteId: number) =>
    api.get<AgendamentoExameDTO[]>(`/agendamentos-exames/paciente/${pacienteId}`),

  /**
   * Lista agendamentos por data
   */
  listarPorData: (data: string) => // formato: yyyy-MM-dd
    api.get<AgendamentoExameDTO[]>(`/agendamentos-exames/data/${data}`),

  /**
   * Lista agendamentos por período
   */
  listarPorPeriodo: (dataInicio: string, dataFim: string) =>
    api.get<AgendamentoExameDTO[]>(`/agendamentos-exames/periodo`, {
      params: { dataInicio, dataFim }
    }),

  /**
   * Lista agendamentos por status
   */
  listarPorStatus: (status: AgendamentoExameDTO['status']) =>
    api.get<AgendamentoExameDTO[]>(`/agendamentos-exames/status/${status}`),

  /**
   * Lista agendamentos por unidade
   */
  listarPorUnidade: (unidadeId: number) =>
    api.get<AgendamentoExameDTO[]>(`/agendamentos-exames/unidade/${unidadeId}`),

  /**
   * Confirma agendamento
   */
  confirmar: (id: number, usuario: string) =>
    api.put<AgendamentoExameDTO>(`/agendamentos-exames/${id}/confirmar`, null, {
      params: { usuario }
    }),

  /**
   * Cancela agendamento
   */
  cancelar: (id: number, motivo: string, usuario: string) =>
    api.put<AgendamentoExameDTO>(`/agendamentos-exames/${id}/cancelar`, null, {
      params: { motivo, usuario }
    }),

  /**
   * Marca agendamento como realizado
   */
  marcarRealizado: (id: number, usuario: string) =>
    api.put<AgendamentoExameDTO>(`/agendamentos-exames/${id}/realizar`, null, {
      params: { usuario }
    }),

  /**
   * Marca como não compareceu
   */
  marcarNaoCompareceu: (id: number, usuario: string) =>
    api.put<AgendamentoExameDTO>(`/agendamentos-exames/${id}/nao-compareceu`, null, {
      params: { usuario }
    }),

  /**
   * Reagenda agendamento
   */
  reagendar: (id: number, novaDataHora: string, motivo: string, usuario: string) =>
    api.put<AgendamentoExameDTO>(`/agendamentos-exames/${id}/reagendar`, null, {
      params: { novaDataHora, motivo, usuario }
    }),

  /**
   * Atualiza status do agendamento
   */
  atualizarStatus: (id: number, novoStatus: AgendamentoExameDTO['status'], usuario: string) =>
    api.put<AgendamentoExameDTO>(`/agendamentos-exames/${id}/status`, null, {
      params: { novoStatus, usuario }
    }),

  /**
   * Lista agendamentos pendentes de confirmação
   */
  listarPendentesConfirmacao: () =>
    api.get<AgendamentoExameDTO[]>('/agendamentos-exames/pendentes-confirmacao'),

  /**
   * Lista agendamentos atrasados
   */
  listarAtrasados: () =>
    api.get<AgendamentoExameDTO[]>('/agendamentos-exames/atrasados'),

  /**
   * Verifica disponibilidade de horário
   */
  verificarDisponibilidade: async (horarioExameId: number, dataHora: string) => {
    const response = await api.get<{ disponivel: boolean }>('/agendamentos-exames/verificar-disponibilidade', {
      params: { horarioExameId, dataHora }
    });
    return response.data.disponivel;
  },

  /**
   * Baixa comprovante PDF
   */
  baixarComprovante: async (id: number) => {
    const response = await api.get(`/agendamentos-exames/${id}/comprovante`, {
      responseType: 'blob'
    });
    
    // Criar link para download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `comprovante-agendamento-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Busca agenda do dia para profissional
   */
  buscarAgendaDiaProfissional: (profissionalId: number, data: string) =>
    api.get<AgendamentoExameDTO[]>(`/agendamentos-exames/agenda-profissional/${profissionalId}`, {
      params: { data }
    })
};

// Helpers para formatação de status
export const statusAgendamentoExame = {
  AGENDADO: { label: 'Agendado', cor: 'primary' },
  CONFIRMADO: { label: 'Confirmado', cor: 'success' },
  AGUARDANDO_ATENDIMENTO: { label: 'Aguardando Atendimento', cor: 'warning' },
  EM_ATENDIMENTO: { label: 'Em Atendimento', cor: 'info' },
  REALIZADO: { label: 'Realizado', cor: 'success' },
  CANCELADO: { label: 'Cancelado', cor: 'danger' },
  NAO_COMPARECEU: { label: 'Não Compareceu', cor: 'warning' },
  REAGENDADO: { label: 'Reagendado', cor: 'secondary' }
};

export default agendamentoExameService;