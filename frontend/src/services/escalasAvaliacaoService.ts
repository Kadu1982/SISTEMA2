import api from "@/services/apiService";

// ============================================================================
// TIPOS E INTERFACES - ESCALA DE MORSE
// ============================================================================

export interface EscalaMorseDTO {
  id?: number;
  pacienteId: number;
  nomePaciente?: string;
  historicoQuedas: number;
  diagnosticoSecundario: number;
  auxilioMarcha: number;
  terapiaEndovenosa: number;
  marcha: number;
  estadoMental: number;
  pontuacaoTotal?: number;
  classificacaoRisco?: string;
  avaliadorId: number;
  nomeAvaliador?: string;
  dataAvaliacao?: string;
  observacoes?: string;
}

export interface EscalaMorseRequest {
  pacienteId: number;
  historicoQuedas: number;
  diagnosticoSecundario: number;
  auxilioMarcha: number;
  terapiaEndovenosa: number;
  marcha: number;
  estadoMental: number;
  avaliadorId: number;
  observacoes?: string;
}

// ============================================================================
// TIPOS E INTERFACES - ESCALA DE BRADEN
// ============================================================================

export interface EscalaBradenDTO {
  id?: number;
  pacienteId: number;
  nomePaciente?: string;
  percepcaoSensorial: number;
  umidade: number;
  atividade: number;
  mobilidade: number;
  nutricao: number;
  friccaoCisalhamento: number;
  pontuacaoTotal?: number;
  classificacaoRisco?: string;
  avaliadorId: number;
  nomeAvaliador?: string;
  dataAvaliacao?: string;
  observacoes?: string;
}

export interface EscalaBradenRequest {
  pacienteId: number;
  percepcaoSensorial: number;
  umidade: number;
  atividade: number;
  mobilidade: number;
  nutricao: number;
  friccaoCisalhamento: number;
  avaliadorId: number;
  observacoes?: string;
}

// ============================================================================
// TIPOS E INTERFACES - ESCALA DE FUGULIN
// ============================================================================

export interface EscalaFugulinDTO {
  id?: number;
  pacienteId: number;
  nomePaciente?: string;
  estadoMental: number;
  oxigenacao: number;
  sinaisVitais: number;
  motilidade: number;
  deambulacao: number;
  alimentacao: number;
  cuidadoCorporal: number;
  eliminacao: number;
  terapeutica: number;
  pontuacaoTotal?: number;
  classificacaoCuidado?: string;
  avaliadorId: number;
  nomeAvaliador?: string;
  dataAvaliacao?: string;
  observacoes?: string;
}

export interface EscalaFugulinRequest {
  pacienteId: number;
  estadoMental: number;
  oxigenacao: number;
  sinaisVitais: number;
  motilidade: number;
  deambulacao: number;
  alimentacao: number;
  cuidadoCorporal: number;
  eliminacao: number;
  terapeutica: number;
  avaliadorId: number;
  observacoes?: string;
}

// ============================================================================
// TIPOS E INTERFACES - ESCALA DE GLASGOW
// ============================================================================

export interface EscalaGlasgowDTO {
  id?: number;
  pacienteId: number;
  nomePaciente?: string;
  aberturaOcular: number;
  respostaVerbal: number;
  respostaMotora: number;
  pontuacaoTotal?: number;
  classificacaoNivelConsciencia?: string;
  avaliadorId: number;
  nomeAvaliador?: string;
  dataAvaliacao?: string;
  observacoes?: string;
}

export interface EscalaGlasgowRequest {
  pacienteId: number;
  aberturaOcular: number;
  respostaVerbal: number;
  respostaMotora: number;
  avaliadorId: number;
  observacoes?: string;
}

// ============================================================================
// TIPOS E INTERFACES - ESCALA EVA
// ============================================================================

export interface EscalaEVADTO {
  id?: number;
  pacienteId: number;
  nomePaciente?: string;
  pontuacaoDor: number;
  classificacaoDor?: string;
  localizacaoDor?: string;
  caracteristicasDor?: string;
  fatoresPiora?: string;
  fatoresMelhora?: string;
  avaliadorId: number;
  nomeAvaliador?: string;
  dataAvaliacao?: string;
  observacoes?: string;
}

export interface EscalaEVARequest {
  pacienteId: number;
  pontuacaoDor: number;
  localizacaoDor?: string;
  caracteristicasDor?: string;
  fatoresPiora?: string;
  fatoresMelhora?: string;
  avaliadorId: number;
  observacoes?: string;
}

// ============================================================================
// SERVIÇO DE API
// ============================================================================

export const escalasAvaliacaoService = {
  // ==================== ESCALA DE MORSE ====================

  /**
   * Cria uma avaliação Escala de Morse
   */
  async criarAvaliacaoMorse(request: EscalaMorseRequest): Promise<EscalaMorseDTO> {
    const { data } = await api.post("/escalas/morse", request);
    return data?.data || data;
  },

  /**
   * Lista avaliações Morse por paciente
   */
  async listarAvaliacoesMorse(pacienteId: number): Promise<EscalaMorseDTO[]> {
    const { data } = await api.get(`/escalas/morse/paciente/${pacienteId}`);
    return data?.data || data || [];
  },

  // ==================== ESCALA DE BRADEN ====================

  /**
   * Cria uma avaliação Escala de Braden
   */
  async criarAvaliacaoBraden(request: EscalaBradenRequest): Promise<EscalaBradenDTO> {
    const { data } = await api.post("/escalas/braden", request);
    return data?.data || data;
  },

  /**
   * Lista avaliações Braden por paciente
   */
  async listarAvaliacoesBraden(pacienteId: number): Promise<EscalaBradenDTO[]> {
    const { data } = await api.get(`/escalas/braden/paciente/${pacienteId}`);
    return data?.data || data || [];
  },

  // ==================== ESCALA DE FUGULIN ====================

  /**
   * Cria uma avaliação Escala de Fugulin
   */
  async criarAvaliacaoFugulin(
    request: EscalaFugulinRequest
  ): Promise<EscalaFugulinDTO> {
    const { data } = await api.post("/escalas/fugulin", request);
    return data?.data || data;
  },

  /**
   * Lista avaliações Fugulin por paciente
   */
  async listarAvaliacoesFugulin(pacienteId: number): Promise<EscalaFugulinDTO[]> {
    const { data } = await api.get(`/escalas/fugulin/paciente/${pacienteId}`);
    return data?.data || data || [];
  },

  // ==================== ESCALA DE GLASGOW ====================

  /**
   * Cria uma avaliação Escala de Glasgow
   */
  async criarAvaliacaoGlasgow(
    request: EscalaGlasgowRequest
  ): Promise<EscalaGlasgowDTO> {
    const { data } = await api.post("/escalas/glasgow", request);
    return data?.data || data;
  },

  /**
   * Lista avaliações Glasgow por paciente
   */
  async listarAvaliacoesGlasgow(pacienteId: number): Promise<EscalaGlasgowDTO[]> {
    const { data } = await api.get(`/escalas/glasgow/paciente/${pacienteId}`);
    return data?.data || data || [];
  },

  // ==================== ESCALA EVA ====================

  /**
   * Cria uma avaliação Escala EVA
   */
  async criarAvaliacaoEVA(request: EscalaEVARequest): Promise<EscalaEVADTO> {
    const { data } = await api.post("/escalas/eva", request);
    return data?.data || data;
  },

  /**
   * Lista avaliações EVA por paciente
   */
  async listarAvaliacoesEVA(pacienteId: number): Promise<EscalaEVADTO[]> {
    const { data } = await api.get(`/escalas/eva/paciente/${pacienteId}`);
    return data?.data || data || [];
  },
};

export default escalasAvaliacaoService;

