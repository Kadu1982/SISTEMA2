import api from '@/lib/api';

// ==================== INTERFACES ====================

// Solicitação do SAMU (TARM)
export interface SolicitacaoSAMU {
  id?: number;
  codigo: number;
  telefone: string;
  motivoQueixa?: string;
  tipoOcorrenciaId?: number;
  tipoSolicitanteId?: number;
  tipoLigacaoId?: number;
  origemSolicitacaoId?: number;
  estadoEmocional?: 'NORMAL' | 'ALTERADO';
  solicitante?: string;
  dataHora: string;
  horario: string;

  // Usuário (opcional)
  usuarioId?: number;
  usuarioNome?: string;

  // Ocorrência
  municipio: string;
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  pontoReferencia?: string;
  latitude?: number;
  longitude?: number;

  // Encaminhamento
  tipoEncaminhamentoId?: number;
  profissionalEncaminhamentoId?: number;
  detalhamento?: string;
  classificacaoRisco?: string;
  avaliacaoDor?: number;
  tempoAtendimento?: string;

  // Metadata
  operadorRegistroId?: number;
  unidadeId?: number;
  status?: string;
}

// Atendimento de Solicitação (Regulação Médica)
export interface AtendimentoSolicitacao {
  id?: number;
  solicitacaoId: number;
  profissionalId: number;
  detalhamento: string;
  classificacaoRisco: 'MUITO_RISCO' | 'MEDIO_RISCO' | 'NAO_INFORMADO';
  avaliacaoDor: number; // 0-10
  tipoEncaminhamentoId: number;
  profissionalEncaminhamentoId?: number;
  dataHoraInicio: string;
  dataHoraEncerramento?: string;
  tempoAtendimento?: string;
}

// Solicitação de Ambulância
export interface SolicitacaoAmbulancia {
  id?: number;
  solicitacaoId: number;
  ambulanciaId: number;
  tipoAmbulanciaId: number;
  situacaoAmbulanciaId: number;
  profissionalId?: number;
  especialidadeId?: number;
  unidadeEncaminhamentoId?: number;
  procedimentoId?: number;
  dataHoraInicio: string;
  dataHoraEncerramento?: string;
  tempoAtendimento?: string;
}

// Cadastros Base
export interface TipoAmbulancia {
  id?: number;
  codigo: string;
  descricao: string;
  sigla: string; // USA, USB, VT, VIR
  procedimentoSolicitAmbulId?: number;
  ativo: boolean;
}

export interface Ambulancia {
  id?: number;
  descricao: string;
  placa: string;
  tipoAmbulanciaId: number;
  equipeId?: number;
  situacaoAtualId?: number;
  baseOperacionalId?: number;
  ativo: boolean;
}

export interface SituacaoAmbulancia {
  id?: number;
  descricao: string;
  cor: string;
  ativo: boolean;
}

export interface EquipeSAMU {
  id?: number;
  descricao: string;
  medicoId?: number;
  enfermeiroId?: number;
  motoristaId?: number;
  socorristaId?: number;
  ativo: boolean;
}

export interface TipoSolicitante {
  id?: number;
  descricao: string;
  ativo: boolean;
}

export interface TipoLigacao {
  id?: number;
  descricao: string;
  encerramento: boolean;
  ativo: boolean;
}

export interface OrigemSolicitacao {
  id?: number;
  descricao: string;
  ativo: boolean;
}

export interface TipoEncaminhamento {
  id?: number;
  descricao: string;
  encerramento: boolean;
  ativo: boolean;
}

export interface TipoOcorrencia {
  id?: number;
  descricao: string;
  ativo: boolean;
}

export interface Equipamento {
  id?: number;
  descricao: string;
  tipoEquipamentoId: number;
  ativo: boolean;
}

// Configuração do Módulo SAMU
export interface ConfiguracaoSAMU {
  id?: number;
  unidadeId: number;

  // Campos de Solicitação
  informarTipoOcorrencia: 'NAO' | 'OBRIGATORIO' | 'NAO_OBRIGATORIO';
  informarTipoSolicitante: 'NAO' | 'OBRIGATORIO' | 'NAO_OBRIGATORIO';
  informarTipoLigacao: 'NAO' | 'OBRIGATORIO' | 'NAO_OBRIGATORIO';
  tipoLigacaoPadrao?: number;
  informarOrigemSolicitacao: 'NAO' | 'OBRIGATORIO' | 'NAO_OBRIGATORIO';
  informarUsuarioSolicitacao: boolean;

  // Situações padrão
  situacaoAmbIniciarEtapa?: number;
  situacaoAmbEncerrarEtapa?: number;

  // Períodos dos Estágios (Dias)
  periodoSolicitacoesSamu: number;
  periodoAtendimentoSolicitacoes: number;
  periodoSolicitacoesAmbulancia: number;

  // Períodos de Recarga (Segundos)
  recargaSolicitacoesSamu: number;
  recargaAtendimentoSolicitacoes: number;
  recargaSolicitacoesAmbulancia: number;
}

// Histórico e Relatórios
export interface HistoricoSolicitacao {
  solicitacoes: SolicitacaoSAMU[];
  totalElements: number;
  totalPages: number;
}

export interface FiltrosHistorico {
  usuarioId?: number;
  dataInicio?: string;
  dataFim?: string;
  status?: string;
  page?: number;
  size?: number;
}

// ==================== SERVICE ====================

const samuService = {
  // ============= SOLICITAÇÕES DO SAMU (TARM) =============
  listarSolicitacoes: (params?: {
    dataInicio?: string;
    dataFim?: string;
    status?: string;
    page?: number;
    size?: number;
  }) => api.get<{ content: SolicitacaoSAMU[]; totalElements: number }>('/samu/solicitacoes', { params }),

  buscarSolicitacao: (id: number) => api.get<SolicitacaoSAMU>(`/samu/solicitacoes/${id}`),

  criarSolicitacao: (solicitacao: SolicitacaoSAMU) =>
    api.post<SolicitacaoSAMU>('/samu/solicitacoes', solicitacao),

  atualizarSolicitacao: (id: number, solicitacao: SolicitacaoSAMU) =>
    api.put<SolicitacaoSAMU>(`/samu/solicitacoes/${id}`, solicitacao),

  // ============= ATENDIMENTOS DE SOLICITAÇÕES (REGULAÇÃO) =============
  listarSolicitacoesPendentesRegulacao: (profissionalId?: number) =>
    api.get<SolicitacaoSAMU[]>('/samu/atendimentos/pendentes', {
      params: { profissionalId }
    }),

  criarAtendimentoSolicitacao: (atendimento: AtendimentoSolicitacao) =>
    api.post<AtendimentoSolicitacao>('/samu/atendimentos', atendimento),

  encerrarAtendimentoSolicitacao: (id: number) =>
    api.put<AtendimentoSolicitacao>(`/samu/atendimentos/${id}/encerrar`),

  // ============= SOLICITAÇÕES DE AMBULÂNCIAS =============
  listarSolicitacoesAmbulancia: (params?: {
    status?: string;
    ambulanciaId?: number;
  }) => api.get<SolicitacaoAmbulancia[]>('/samu/ambulancias/solicitacoes', { params }),

  criarSolicitacaoAmbulancia: (solicitacao: SolicitacaoAmbulancia) =>
    api.post<SolicitacaoAmbulancia>('/samu/ambulancias/solicitacoes', solicitacao),

  encerrarSolicitacaoAmbulancia: (id: number) =>
    api.put<SolicitacaoAmbulancia>(`/samu/ambulancias/solicitacoes/${id}/encerrar`),

  // ============= CONTROLE DE AMBULÂNCIAS =============
  listarAmbulanciasPorSituacao: (situacaoId?: number) =>
    api.get<Ambulancia[]>('/samu/ambulancias/controle', {
      params: { situacaoId }
    }),

  atualizarSituacaoAmbulancia: (ambulanciaId: number, situacaoId: number, detalhamento?: string) =>
    api.put(`/samu/ambulancias/${ambulanciaId}/situacao`, {
      situacaoId,
      detalhamento
    }),

  // ============= HISTÓRICO =============
  buscarHistoricoSolicitacoes: (filtros: FiltrosHistorico) =>
    api.get<HistoricoSolicitacao>('/samu/historico/solicitacoes', {
      params: filtros
    }),

  // ============= CADASTROS =============
  // Tipos de Ambulâncias
  listarTiposAmbulancia: () => api.get<TipoAmbulancia[]>('/samu/cadastros/tipos-ambulancia'),
  criarTipoAmbulancia: (tipo: TipoAmbulancia) =>
    api.post<TipoAmbulancia>('/samu/cadastros/tipos-ambulancia', tipo),
  atualizarTipoAmbulancia: (id: number, tipo: TipoAmbulancia) =>
    api.put<TipoAmbulancia>(`/samu/cadastros/tipos-ambulancia/${id}`, tipo),
  deletarTipoAmbulancia: (id: number) =>
    api.delete(`/samu/cadastros/tipos-ambulancia/${id}`),

  // Ambulâncias
  listarAmbulanciasTodas: () => api.get<Ambulancia[]>('/samu/cadastros/ambulancias'),
  criarAmbulancia: (ambulancia: Ambulancia) =>
    api.post<Ambulancia>('/samu/cadastros/ambulancias', ambulancia),
  atualizarAmbulancia: (id: number, ambulancia: Ambulancia) =>
    api.put<Ambulancia>(`/samu/cadastros/ambulancias/${id}`, ambulancia),
  deletarAmbulancia: (id: number) =>
    api.delete(`/samu/cadastros/ambulancias/${id}`),

  // Situações de Ambulâncias
  listarSituacoesAmbulancia: () => api.get<SituacaoAmbulancia[]>('/samu/cadastros/situacoes-ambulancia'),
  criarSituacaoAmbulancia: (situacao: SituacaoAmbulancia) =>
    api.post<SituacaoAmbulancia>('/samu/cadastros/situacoes-ambulancia', situacao),
  atualizarSituacaoAmbulancia: (id: number, situacao: SituacaoAmbulancia) =>
    api.put<SituacaoAmbulancia>(`/samu/cadastros/situacoes-ambulancia/${id}`, situacao),
  deletarSituacaoAmbulancia: (id: number) =>
    api.delete(`/samu/cadastros/situacoes-ambulancia/${id}`),

  // Equipes
  listarEquipes: () => api.get<EquipeSAMU[]>('/samu/cadastros/equipes'),
  criarEquipe: (equipe: EquipeSAMU) =>
    api.post<EquipeSAMU>('/samu/cadastros/equipes', equipe),
  atualizarEquipe: (id: number, equipe: EquipeSAMU) =>
    api.put<EquipeSAMU>(`/samu/cadastros/equipes/${id}`, equipe),
  deletarEquipe: (id: number) =>
    api.delete(`/samu/cadastros/equipes/${id}`),

  // Tipos de Solicitantes
  listarTiposSolicitante: () => api.get<TipoSolicitante[]>('/samu/cadastros/tipos-solicitante'),
  criarTipoSolicitante: (tipo: TipoSolicitante) =>
    api.post<TipoSolicitante>('/samu/cadastros/tipos-solicitante', tipo),

  // Tipos de Ligações
  listarTiposLigacao: () => api.get<TipoLigacao[]>('/samu/cadastros/tipos-ligacao'),
  criarTipoLigacao: (tipo: TipoLigacao) =>
    api.post<TipoLigacao>('/samu/cadastros/tipos-ligacao', tipo),

  // Origens de Solicitações
  listarOrigensSolicitacao: () => api.get<OrigemSolicitacao[]>('/samu/cadastros/origens-solicitacao'),
  criarOrigemSolicitacao: (origem: OrigemSolicitacao) =>
    api.post<OrigemSolicitacao>('/samu/cadastros/origens-solicitacao', origem),

  // Tipos de Encaminhamentos
  listarTiposEncaminhamento: () => api.get<TipoEncaminhamento[]>('/samu/cadastros/tipos-encaminhamento'),
  criarTipoEncaminhamento: (tipo: TipoEncaminhamento) =>
    api.post<TipoEncaminhamento>('/samu/cadastros/tipos-encaminhamento', tipo),

  // Tipos de Ocorrências
  listarTiposOcorrencia: () => api.get<TipoOcorrencia[]>('/samu/cadastros/tipos-ocorrencia'),
  criarTipoOcorrencia: (tipo: TipoOcorrencia) =>
    api.post<TipoOcorrencia>('/samu/cadastros/tipos-ocorrencia', tipo),

  // Equipamentos
  listarEquipamentos: () => api.get<Equipamento[]>('/samu/cadastros/equipamentos'),
  criarEquipamento: (equipamento: Equipamento) =>
    api.post<Equipamento>('/samu/cadastros/equipamentos', equipamento),

  // ============= CONFIGURAÇÕES =============
  buscarConfiguracao: (unidadeId: number) =>
    api.get<ConfiguracaoSAMU>(`/samu/configuracoes/unidade/${unidadeId}`),

  salvarConfiguracao: (config: ConfiguracaoSAMU) =>
    api.post<ConfiguracaoSAMU>('/samu/configuracoes', config),
};

export default samuService;
