import api from '../lib/api';

export interface AgendamentoAmbulatorio {
  id: number;
  pacienteId: number;
  nomePaciente: string;
  cpfPaciente: string;
  profissionalId: number;
  nomeProfissional: string;
  unidadeId: number;
  nomeUnidade: string;
  especialidadeId: number;
  nomeEspecialidade: string;
  dataAgendamento: string;
  horaAgendamento: string;
  tipoConsulta: string;
  statusAgendamento: string;
  prioridade: string;
  observacoes?: string;
  motivoConsulta?: string;
  encaminhamentoInterno: boolean;
  agendamentoOrigemId?: number;
  numeroGuia?: string;
  convenioId?: number;
  nomeConvenio?: string;
  retornoProgramado: boolean;
  diasRetorno?: number;
  dataCriacao: string;
  operadorCriacaoId: number;
  nomeOperadorCriacao: string;
  dataConfirmacao?: string;
  dataChegada?: string;
  dataChamada?: string;
  dataInicioAtendimento?: string;
  dataFimAtendimento?: string;
  tempoEsperaMinutos?: number;
  tempoAtendimentoMinutos?: number;
  numeroSala?: string;
  observacoesAtendimento?: string;
}

export interface EscalaMedica {
  id: number;
  profissionalId: number;
  nomeProfissional: string;
  crmProfissional: string;
  unidadeId: number;
  nomeUnidade: string;
  especialidadeId: number;
  nomeEspecialidade: string;
  dataEscala: string;
  horaInicio: string;
  horaFim: string;
  intervaloConsultaMinutos: number;
  vagasDisponiveis: number;
  vagasOcupadas: number;
  vagasBloqueadas: number;
  vagasLivres: number;
  statusEscala: string;
  tipoEscala: string;
  permiteEncaixe: boolean;
  vagasEncaixe: number;
  numeroSala?: string;
  observacoes?: string;
  dataCriacao: string;
  operadorCriacaoId: number;
  nomeOperadorCriacao: string;
  dataUltimaAlteracao?: string;
  hasVagasDisponiveis: boolean;
  totalHorasEscala: number;
  totalConsultasPossivel: number;
}

export interface CriarAgendamentoRequest {
  pacienteId: number;
  profissionalId: number;
  unidadeId: number;
  especialidadeId: number;
  dataAgendamento: string;
  horaAgendamento: string;
  tipoConsulta?: string;
  prioridade?: string;
  observacoes?: string;
  motivoConsulta?: string;
  encaminhamentoInterno?: boolean;
  agendamentoOrigemId?: number;
  numeroGuia?: string;
  convenioId?: number;
  retornoProgramado?: boolean;
  diasRetorno?: number;
  operadorCriacaoId: number;
}

export interface CriarEscalaRequest {
  profissionalId: number;
  unidadeId: number;
  especialidadeId: number;
  dataEscala: string;
  horaInicio: string;
  horaFim: string;
  intervaloConsultaMinutos: number;
  vagasDisponiveis: number;
  tipoEscala?: string;
  permiteEncaixe?: boolean;
  vagasEncaixe?: number;
  numeroSala?: string;
  observacoes?: string;
  operadorCriacaoId: number;
}

class AmbulatorioService {
  // =============== AGENDAMENTOS ===============

  async criarAgendamento(data: CriarAgendamentoRequest) {
    const response = await api.post('/hospitalar/ambulatorio/agendamentos', data);
    return response.data;
  }

  async listarAgendamentos(data: string, unidadeId?: number) {
    const params = new URLSearchParams({ data });
    if (unidadeId) {
      params.append('unidadeId', unidadeId.toString());
    }
    const response = await api.get(`/hospitalar/ambulatorio/agendamentos?${params}`);
    return response.data;
  }

  async listarPacientesAguardando(data: string) {
    const response = await api.get(`/hospitalar/ambulatorio/agendamentos/aguardando?data=${data}`);
    return response.data;
  }

  async confirmarPresenca(agendamentoId: number, operadorId: number) {
    const response = await api.post(
      `/hospitalar/ambulatorio/agendamentos/${agendamentoId}/confirmar-presenca?operadorId=${operadorId}`
    );
    return response.data;
  }

  async chamarPaciente(agendamentoId: number, operadorId: number) {
    const response = await api.post(
      `/hospitalar/ambulatorio/agendamentos/${agendamentoId}/chamar?operadorId=${operadorId}`
    );
    return response.data;
  }

  async iniciarAtendimento(agendamentoId: number, operadorId: number) {
    const response = await api.post(
      `/hospitalar/ambulatorio/agendamentos/${agendamentoId}/iniciar-atendimento?operadorId=${operadorId}`
    );
    return response.data;
  }

  async finalizarAtendimento(agendamentoId: number, operadorId: number, observacoes?: string) {
    const params = new URLSearchParams({ operadorId: operadorId.toString() });
    if (observacoes) {
      params.append('observacoes', observacoes);
    }
    const response = await api.post(
      `/hospitalar/ambulatorio/agendamentos/${agendamentoId}/finalizar-atendimento?${params}`
    );
    return response.data;
  }

  async obterEstatisticasAgendamentos(dataInicio: string, dataFim: string) {
    const response = await api.get(
      `/hospitalar/ambulatorio/agendamentos/estatisticas?dataInicio=${dataInicio}&dataFim=${dataFim}`
    );
    return response.data;
  }

  // =============== ESCALAS MÉDICAS ===============

  async criarEscala(data: CriarEscalaRequest) {
    const response = await api.post('/hospitalar/ambulatorio/escalas', data);
    return response.data;
  }

  async listarEscalas(data: string, unidadeId?: number) {
    const params = new URLSearchParams({ data });
    if (unidadeId) {
      params.append('unidadeId', unidadeId.toString());
    }
    const response = await api.get(`/hospitalar/ambulatorio/escalas?${params}`);
    return response.data;
  }

  async listarEscalasComVagas(data: string) {
    const response = await api.get(`/hospitalar/ambulatorio/escalas/com-vagas?data=${data}`);
    return response.data;
  }

  async inativarEscala(escalaId: number, operadorId: number, motivo: string) {
    const response = await api.post(
      `/hospitalar/ambulatorio/escalas/${escalaId}/inativar?operadorId=${operadorId}&motivo=${encodeURIComponent(motivo)}`
    );
    return response.data;
  }

  async bloquearVagas(escalaId: number, quantidadeVagas: number, operadorId: number, motivo: string) {
    const response = await api.post(
      `/hospitalar/ambulatorio/escalas/${escalaId}/bloquear-vagas?quantidadeVagas=${quantidadeVagas}&operadorId=${operadorId}&motivo=${encodeURIComponent(motivo)}`
    );
    return response.data;
  }

  // =============== DASHBOARD ===============

  async obterDashboard(data: string, unidadeId?: number) {
    const params = new URLSearchParams({ data });
    if (unidadeId) {
      params.append('unidadeId', unidadeId.toString());
    }
    const response = await api.get(`/hospitalar/ambulatorio/dashboard?${params}`);
    return response.data;
  }

  async obterStatus() {
    const response = await api.get('/hospitalar/ambulatorio/status');
    return response.data;
  }
}

export default new AmbulatorioService();