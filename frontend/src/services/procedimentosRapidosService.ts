import api from "@/services/apiService";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export enum StatusProcedimento {
  AGUARDANDO = "AGUARDANDO",
  EM_ATENDIMENTO = "EM_ATENDIMENTO",
  FINALIZADO = "FINALIZADO",
  CANCELADO = "CANCELADO",
}

export enum SituacaoAtividade {
  PENDENTE = "PENDENTE",
  EM_EXECUCAO = "EM_EXECUCAO",
  EXECUTADO = "EXECUTADO",
  CANCELADO = "CANCELADO",
  NAO_REALIZADO = "NAO_REALIZADO",
}

export enum TipoAtividade {
  VACINAS = "VACINAS",
  PROCEDIMENTOS = "PROCEDIMENTOS",
}

export enum TipoDesfecho {
  LIBERAR_USUARIO = "LIBERAR_USUARIO",
  OBSERVACAO = "OBSERVACAO",
  ENCAMINHAMENTO_INTERNO = "ENCAMINHAMENTO_INTERNO",
  REAVALIACAO = "REAVALIACAO",
}

export interface DesfechoDTO {
  tipo: TipoDesfecho;
  setorDestino?: string;
  especialidade?: string;
  procedimentoSolicitado?: string;
  dataAgendadaReavaliacao?: string;
  observacoes?: string;
  dataRegistro?: string;
  profissionalResponsavel?: string;
}

export interface AtividadeEnfermagemDTO {
  id?: number;
  tipo: TipoAtividade;
  atividade: string;
  situacao?: SituacaoAtividade;
  dataHoraInicial?: string;
  dataHoraFinal?: string;
  profissional?: string;
  observacoes?: string;
  urgente?: boolean;
  alerta?: string;
  intervaloMinutos?: number;
  horariosAprazados?: string[];
  horariosAnteriores?: string[];
  dataCriacao?: string;
  dataAtualizacao?: string;
  atrasada?: boolean;
  proximoHorario?: string;
}

export interface ProcedimentoRapidoDTO {
  id: number;
  pacienteId: number;
  pacienteNome: string;
  pacienteIdade?: number;
  pacienteCpf?: string;
  operadorResponsavelId?: number;
  operadorResponsavelNome?: string;
  status: StatusProcedimento;
  origemEncaminhamento?: string;
  atendimentoMedicoOrigemId?: number;
  medicoSolicitante?: string;
  especialidadeOrigem?: string;
  atividades: AtividadeEnfermagemDTO[];
  desfecho?: DesfechoDTO;
  alergias?: string;
  observacoesGerais?: string;
  bloqueadoPorOperadorId?: number;
  bloqueadoPorOperadorNome?: string;
  bloqueadoEm?: string;
  dataHoraInicioAtendimento?: string;
  dataHoraFimAtendimento?: string;
  canceladoPor?: string;
  motivoCancelamento?: string;
  dataCancelamento?: string;
  dataCriacao: string;
  dataAtualizacao?: string;
  criadoPor?: string;
  atualizadoPor?: string;
  bloqueado?: boolean;
  temAtividadesPendentes?: boolean;
  quantidadeAtividadesPendentes?: number;
}

export interface ProcedimentoRapidoListDTO {
  id: number;
  pacienteNome: string;
  pacienteIdade?: number;
  status: StatusProcedimento;
  medicoSolicitante?: string;
  origemEncaminhamento?: string;
  quantidadeAtividadesPendentes?: number;
  quantidadeAtividadesTotal?: number;
  temAtividadesUrgentes?: boolean;
  temAtividadesAtrasadas?: boolean;
  operadorResponsavelNome?: string;
  bloqueado?: boolean;
  dataCriacao: string;
  dataHoraInicioAtendimento?: string;
}

export interface CriarProcedimentoRapidoRequest {
  pacienteId: number;
  origemEncaminhamento?: string;
  atendimentoMedicoOrigemId?: number;
  medicoSolicitante?: string;
  especialidadeOrigem?: string;
  alergias?: string;
  observacoesGerais?: string;
  atividades?: AtividadeEnfermagemDTO[];
}

export interface ExecutarAtividadeRequest {
  situacao: SituacaoAtividade;
  profissional?: string;
  observacoes?: string;
}

export interface AprazarAtividadeRequest {
  novoHorario: string;
  motivoAlteracao?: string;
}

export interface RegistrarDesfechoRequest {
  tipo: TipoDesfecho;
  setorDestino?: string;
  especialidade?: string;
  procedimentoSolicitado?: string;
  dataAgendadaReavaliacao?: string;
  observacoes?: string;
}

export interface CancelarProcedimentoRequest {
  motivo: string;
  observacoes?: string;
  cancelarAtividadesPendentes?: boolean;
}

export interface EncaminharParaProcedimentoRequest {
  atendimentoId: number;
  pacienteId: number;
  medicoSolicitante?: string;
  especialidadeOrigem?: string;
  setorId?: number;
  tipoDesfecho?: string; // "ALTA_SE_MELHORA", "ALTA_APOS_MEDICACAO", "CUIDADOS_ENFERMAGEM"
  alergias?: string;
  observacoes?: string;
  atividades?: AtividadeEnfermagemDTO[];
}

// ============================================================================
// SERVIÇO DE API
// ============================================================================

export const procedimentosRapidosService = {
  /**
   * Cria um novo procedimento rápido
   */
  async criar(request: CriarProcedimentoRapidoRequest): Promise<ProcedimentoRapidoDTO> {
    const { data } = await api.post("/procedimentos-rapidos", request);
    return data?.data || data;
  },

  /**
   * Lista todos os procedimentos (com filtros opcionais)
   */
  async listar(params?: {
    dataInicio?: string;
    dataFim?: string;
    status?: StatusProcedimento;
    statuses?: StatusProcedimento[];
    especialidade?: string;
    termo?: string;
  }): Promise<ProcedimentoRapidoListDTO[]> {
    // Converte array de statuses para query params múltiplos
    const queryParams: any = { ...params };
    if (params?.statuses && params.statuses.length > 0) {
      queryParams.statuses = params.statuses;
    }
    const { data } = await api.get("/procedimentos-rapidos", { params: queryParams });
    return data?.data || data;
  },

  /**
   * Lista procedimentos aguardando atendimento
   */
  async listarAguardando(): Promise<ProcedimentoRapidoListDTO[]> {
    const { data } = await api.get("/procedimentos-rapidos/aguardando");
    return data?.data || data;
  },

  /**
   * Lista procedimentos com atividades urgentes
   */
  async listarUrgentes(): Promise<ProcedimentoRapidoListDTO[]> {
    const { data } = await api.get("/procedimentos-rapidos/urgentes");
    return data?.data || data;
  },

  /**
   * Busca procedimento por ID
   */
  async buscarPorId(id: number): Promise<ProcedimentoRapidoDTO> {
    const { data } = await api.get(`/procedimentos-rapidos/${id}`);
    return data?.data || data;
  },

  /**
   * Atualiza o status do procedimento
   */
  async atualizarStatus(id: number, status: StatusProcedimento): Promise<ProcedimentoRapidoDTO> {
    const { data } = await api.put(`/procedimentos-rapidos/${id}/status`, null, {
      params: { status },
    });
    return data?.data || data;
  },

  /**
   * Inicia atendimento do procedimento
   */
  async iniciarAtendimento(id: number, operadorId: number): Promise<ProcedimentoRapidoDTO> {
    const { data } = await api.post(`/procedimentos-rapidos/${id}/iniciar`, null, {
      params: { operadorId },
    });
    return data?.data || data;
  },

  /**
   * Adiciona uma atividade ao procedimento
   */
  async adicionarAtividade(id: number, atividade: AtividadeEnfermagemDTO): Promise<ProcedimentoRapidoDTO> {
    const { data } = await api.post(`/procedimentos-rapidos/${id}/atividades`, atividade);
    return data?.data || data;
  },

  /**
   * Executa/atualiza uma atividade
   */
  async executarAtividade(
    procedimentoId: number,
    atividadeId: number,
    request: ExecutarAtividadeRequest
  ): Promise<ProcedimentoRapidoDTO> {
    const { data } = await api.put(
      `/procedimentos-rapidos/${procedimentoId}/atividades/${atividadeId}`,
      request
    );
    return data?.data || data;
  },

  /**
   * Realiza aprazamento de horários de uma atividade
   */
  async aprazarAtividade(
    procedimentoId: number,
    atividadeId: number,
    request: AprazarAtividadeRequest
  ): Promise<ProcedimentoRapidoDTO> {
    const { data } = await api.put(
      `/procedimentos-rapidos/${procedimentoId}/atividades/${atividadeId}/aprazamento`,
      request
    );
    return data?.data || data;
  },

  /**
   * Registra o desfecho e finaliza o procedimento
   */
  async registrarDesfecho(id: number, request: RegistrarDesfechoRequest): Promise<ProcedimentoRapidoDTO> {
    const { data } = await api.post(`/procedimentos-rapidos/${id}/desfecho`, request);
    return data?.data || data;
  },

  /**
   * Cancela o procedimento
   */
  async cancelar(id: number, request: CancelarProcedimentoRequest): Promise<ProcedimentoRapidoDTO> {
    const { data } = await api.post(`/procedimentos-rapidos/${id}/cancelar`, request);
    return data?.data || data;
  },

  /**
   * Desbloqueia o procedimento para outro operador
   */
  async desbloquear(id: number, operadorId: number): Promise<ProcedimentoRapidoDTO> {
    const { data } = await api.post(`/procedimentos-rapidos/${id}/desbloquear`, null, {
      params: { operadorId },
    });
    return data?.data || data;
  },

  /**
   * Obtém histórico completo do procedimento
   */
  async obterHistorico(id: number): Promise<ProcedimentoRapidoDTO> {
    const { data } = await api.get(`/procedimentos-rapidos/${id}/historico`);
    return data?.data || data;
  },

  /**
   * Encaminha paciente do Atendimento Ambulatorial para Procedimentos Rápidos
   */
  async encaminharDeAtendimento(
    request: EncaminharParaProcedimentoRequest
  ): Promise<ProcedimentoRapidoDTO> {
    const { data } = await api.post("/procedimentos-rapidos/encaminhar-atendimento", request);
    return data?.data || data;
  },

  /**
   * Lista motivos de cancelamento disponíveis
   */
  async listarMotivosCancelamento(): Promise<string[]> {
    const { data } = await api.get("/procedimentos-rapidos/motivos-cancelamento");
    return data?.data || data;
  },

  /**
   * Vincula um paciente cadastrado a um procedimento criado para usuário não identificado
   */
  async vincularPaciente(procedimentoId: number, pacienteId: number): Promise<ProcedimentoRapidoDTO> {
    const { data } = await api.put(`/procedimentos-rapidos/${procedimentoId}/vincular-paciente`, {
      pacienteId,
    });
    return data?.data || data;
  },

  /**
   * Verifica se paciente tem procedimento ativo
   */
  async temProcedimentoAtivo(pacienteId: number): Promise<boolean> {
    const { data } = await api.get(`/procedimentos-rapidos/paciente/${pacienteId}/tem-ativo`);
    return data?.data ?? data ?? false;
  },

  /**
   * Busca procedimento ativo de um paciente
   */
  async buscarProcedimentoAtivoPorPaciente(pacienteId: number): Promise<ProcedimentoRapidoDTO | null> {
    try {
      const { data } = await api.get(`/procedimentos-rapidos/paciente/${pacienteId}/ativo`);
      return data?.data || data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

export default procedimentosRapidosService;
