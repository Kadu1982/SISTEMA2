import axios from 'axios';
import apiService from './apiService';

// Interfaces
export interface ConfiguracaoAssistenciaSocial {
  id?: number;
  tempoAtualizacaoTelas: number;
  valorSalarioMinimo: number;
  valorLinhaPobreza: number;
  valorLinhaExtremaPobreza: number;
  tempoAtendimentoProfissionais: number;
  tempoAlteracaoAtendimentoIndividual: number;
  valorBeneficioFamiliaAcolhedora: number;
  valorBeneficioFamiliaAcolhedoraEspecial: number;
  tempoAlteracaoContrareferencia: number;
  tempoAlteracaoDispensacaoBeneficios: number;
  desligarIntegranteGrupoServico: boolean;
  alertarDispensacaoBeneficioDuplicado: boolean;
  permitirTransferenciaIntegrantes: boolean;
  campoValorBaseObrigatorio: boolean;
  somenteIntegrantesFamiliaAtendimentoColetivo: boolean;
  controleAutomaticoPobreza: boolean;
  profissionaisIndicadoresRma: boolean;
  controleSeparadoFamiliaAcolhedora: boolean;
  evitarUnificacaoExclusaoFamiliasAcolhedoras: boolean;
  portalSolicitacaoAcesso: boolean;
  dataAtualizacao?: string;
  usuarioAtualizacao?: string;
}

export interface VinculoUnidadeVulnerabilidade {
  id?: number;
  unidade: {
    id: number;
    nome: string;
  };
  tipoVulnerabilidade: {
    id: number;
    nome: string;
  };
  dataCadastro?: string;
  usuarioCadastro?: string;
}

export interface Familia {
  id?: number;
  responsavel: {
    id: number;
    nome: string;
  };
  codigoFamiliar: string;
  tipoFamilia: string; // Enum values: CONTEMPORANEA, HOMOAFETIVA, MONOPARENTAL, QUILOMBOLA, INDIGENA, RIBEIRINHA, CIGANA
  classeSocial: string;
  // Address fields
  municipio: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  complemento?: string;
  // For frontend use only - to maintain compatibility with existing code
  endereco?: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    complemento?: string;
  };
  // Optional fields that might be needed by the backend
  quantidadeDependentes?: number;
  dataCadastro?: string;
  dataAtualizacao?: string;
  usuarioCadastro?: string;
  usuarioAtualizacao?: string;
}

export interface AtendimentoAssistencial {
  id?: number;
  data: string;
  hora: string;
  tipo: string; // INDIVIDUAL, COLETIVO, GRUPO
  motivos: string[];
  anotacoes: string;
  sigiloso: boolean;
  unidadeAssistencial: {
    id: number;
    nome: string;
  };
  profissional: {
    id: number;
    nome: string;
    especialidade: string;
  };
  pessoas?: {
    id: number;
    nome: string;
  }[];
  familia?: {
    id: number;
    responsavel: string;
  };
}

export interface Beneficio {
  id?: number;
  nome: string;
  tipo: {
    id: number;
    nome: string;
  };
  subtipo?: {
    id: number;
    nome: string;
  };
  valorBase: number;
  numeroLei?: string;
  observacoes?: string;
  ativo: boolean;
}

export interface DispensacaoBeneficio {
  id?: number;
  data: string;
  situacao: string; // PENDENTE, AUTORIZADO, REJEITADO, CANCELADO
  pessoa: {
    id: number;
    nome: string;
  };
  profissional: {
    id: number;
    nome: string;
  };
  unidadeAssistencial: {
    id: number;
    nome: string;
  };
  itens: {
    beneficio: {
      id: number;
      nome: string;
    };
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }[];
  observacoes?: string;
  dataAutorizacao?: string;
  usuarioAutorizacao?: string;
  dataRejeicao?: string;
  usuarioRejeicao?: string;
  motivoRejeicao?: string;
}

export interface Encaminhamento {
  id?: number;
  data: string;
  tipo: string;
  origem: {
    id: number;
    nome: string;
    tipo: string; // UNIDADE_ASSISTENCIAL, UNIDADE_SAUDE
  };
  destino: {
    id: number;
    nome: string;
    tipo: string; // UNIDADE_ASSISTENCIAL, UNIDADE_SAUDE, ORGAO_REDE
  };
  pessoa: {
    id: number;
    nome: string;
  };
  profissional: {
    id: number;
    nome: string;
    especialidade: string;
  };
  observacoes?: string;
  situacao: string; // PENDENTE, CONCLUIDO
  contraReferencia?: {
    data: string;
    profissional: string;
    telefone?: string;
    anotacoes: string;
  };
}

// API Services
const BASE_URL = '/assistencia-social';

// Configuração
export const getConfiguracao = async (): Promise<ConfiguracaoAssistenciaSocial> => {
  const response = await apiService.get(`${BASE_URL}/configuracoes`);
  return response.data;
};

export const salvarConfiguracao = async (configuracao: ConfiguracaoAssistenciaSocial): Promise<ConfiguracaoAssistenciaSocial> => {
  const response = await apiService.post(`${BASE_URL}/configuracoes`, configuracao);
  return response.data;
};

export const atualizarValorSalarioMinimo = async (valor: number): Promise<ConfiguracaoAssistenciaSocial> => {
  const response = await apiService.patch(`${BASE_URL}/configuracoes/salario-minimo?valorSalarioMinimo=${valor}`);
  return response.data;
};

export const atualizarValorLinhaPobreza = async (valor: number): Promise<ConfiguracaoAssistenciaSocial> => {
  const response = await apiService.patch(`${BASE_URL}/configuracoes/linha-pobreza?valorLinhaPobreza=${valor}`);
  return response.data;
};

export const atualizarValorLinhaExtremaPobreza = async (valor: number): Promise<ConfiguracaoAssistenciaSocial> => {
  const response = await apiService.patch(`${BASE_URL}/configuracoes/linha-extrema-pobreza?valorLinhaExtremaPobreza=${valor}`);
  return response.data;
};

// Vínculos Unidade-Vulnerabilidade
export const getVinculos = async (): Promise<VinculoUnidadeVulnerabilidade[]> => {
  const response = await apiService.get(`${BASE_URL}/vinculos-unidade-vulnerabilidade`);
  return response.data;
};

export const getVinculosPorUnidade = async (unidadeId: number): Promise<VinculoUnidadeVulnerabilidade[]> => {
  const response = await apiService.get(`${BASE_URL}/vinculos-unidade-vulnerabilidade/unidade/${unidadeId}`);
  return response.data;
};

export const criarVinculo = async (unidadeId: number, tipoVulnerabilidadeId: number): Promise<VinculoUnidadeVulnerabilidade> => {
  const response = await apiService.post(`${BASE_URL}/vinculos-unidade-vulnerabilidade?unidadeId=${unidadeId}&tipoVulnerabilidadeId=${tipoVulnerabilidadeId}`);
  return response.data;
};

export const removerVinculo = async (id: number): Promise<void> => {
  await apiService.delete(`${BASE_URL}/vinculos-unidade-vulnerabilidade/${id}`);
};

// Famílias
export const getFamilias = async (): Promise<Familia[]> => {
  try {
    const response = await apiService.get(`${BASE_URL}/familias`);
    // If the response is not paginated, return it directly
    if (!response.data.content) {
      return Array.isArray(response.data) ? response.data : [];
    }
    // Handle paginated response from backend
    return response.data.content || [];
  } catch (error) {
    console.error('Error fetching families:', error);
    throw error;
  }
};

export const getFamiliaPorId = async (id: number): Promise<Familia> => {
  const response = await apiService.get(`${BASE_URL}/familias/${id}`);
  return response.data;
};

export const criarFamilia = async (familia: Familia): Promise<Familia> => {
  // Map frontend data to backend format
  const familiaBackend = {
    ...familia,
    // If endereco exists, map its fields to the flat structure expected by the backend
    ...(familia.endereco && {
      municipio: familia.endereco.cidade,
      cep: familia.endereco.cep,
      logradouro: familia.endereco.logradouro,
      numero: familia.endereco.numero,
      bairro: familia.endereco.bairro,
      complemento: familia.endereco.complemento
    }),
    // Convert tipoFamilia string to enum format if needed
    tipoFamilia: familia.tipoFamilia?.toUpperCase().replace(/\s/g, '_')
  };

  // Remove the endereco object as it's not expected by the backend
  if (familiaBackend.endereco) {
    delete familiaBackend.endereco;
  }

  const response = await apiService.post(`${BASE_URL}/familias`, familiaBackend);
  return response.data;
};

export const atualizarFamilia = async (id: number, familia: Familia): Promise<Familia> => {
  // Map frontend data to backend format
  const familiaBackend = {
    ...familia,
    // If endereco exists, map its fields to the flat structure expected by the backend
    ...(familia.endereco && {
      municipio: familia.endereco.cidade,
      cep: familia.endereco.cep,
      logradouro: familia.endereco.logradouro,
      numero: familia.endereco.numero,
      bairro: familia.endereco.bairro,
      complemento: familia.endereco.complemento
    }),
    // Convert tipoFamilia string to enum format if needed
    tipoFamilia: familia.tipoFamilia?.toUpperCase().replace(/\s/g, '_')
  };

  // Remove the endereco object as it's not expected by the backend
  if (familiaBackend.endereco) {
    delete familiaBackend.endereco;
  }

  const response = await apiService.put(`${BASE_URL}/familias/${id}`, familiaBackend);
  return response.data;
};

// Atendimentos
export const getAtendimentos = async (): Promise<AtendimentoAssistencial[]> => {
  const response = await apiService.get(`${BASE_URL}/atendimentos`);
  return response.data;
};

export const getAtendimentoPorId = async (id: number): Promise<AtendimentoAssistencial> => {
  const response = await apiService.get(`${BASE_URL}/atendimentos/${id}`);
  return response.data;
};

export const criarAtendimento = async (atendimento: AtendimentoAssistencial): Promise<AtendimentoAssistencial> => {
  const response = await apiService.post(`${BASE_URL}/atendimentos`, atendimento);
  return response.data;
};

// Benefícios
export const getBeneficios = async (): Promise<Beneficio[]> => {
  const response = await apiService.get(`${BASE_URL}/beneficios`);
  return response.data;
};

export const getBeneficioPorId = async (id: number): Promise<Beneficio> => {
  const response = await apiService.get(`${BASE_URL}/beneficios/${id}`);
  return response.data;
};

export const criarBeneficio = async (beneficio: Beneficio): Promise<Beneficio> => {
  const response = await apiService.post(`${BASE_URL}/beneficios`, beneficio);
  return response.data;
};

export const atualizarBeneficio = async (id: number, beneficio: Beneficio): Promise<Beneficio> => {
  const response = await apiService.put(`${BASE_URL}/beneficios/${id}`, beneficio);
  return response.data;
};

// Dispensação de Benefícios
export const getDispensacoes = async (): Promise<DispensacaoBeneficio[]> => {
  const response = await apiService.get(`${BASE_URL}/dispensacoes`);
  return response.data;
};

export const getDispensacaoPorId = async (id: number): Promise<DispensacaoBeneficio> => {
  const response = await apiService.get(`${BASE_URL}/dispensacoes/${id}`);
  return response.data;
};

export const criarDispensacao = async (dispensacao: DispensacaoBeneficio): Promise<DispensacaoBeneficio> => {
  const response = await apiService.post(`${BASE_URL}/dispensacoes`, dispensacao);
  return response.data;
};

export const autorizarDispensacao = async (id: number): Promise<DispensacaoBeneficio> => {
  const response = await apiService.patch(`${BASE_URL}/dispensacoes/${id}/autorizar`);
  return response.data;
};

export const rejeitarDispensacao = async (id: number, motivo: string): Promise<DispensacaoBeneficio> => {
  const response = await apiService.patch(`${BASE_URL}/dispensacoes/${id}/rejeitar?motivo=${motivo}`);
  return response.data;
};

// Encaminhamentos
export const getEncaminhamentos = async (): Promise<Encaminhamento[]> => {
  const response = await apiService.get(`${BASE_URL}/encaminhamentos`);
  return response.data;
};

export const getEncaminhamentoPorId = async (id: number): Promise<Encaminhamento> => {
  const response = await apiService.get(`${BASE_URL}/encaminhamentos/${id}`);
  return response.data;
};

export const criarEncaminhamento = async (encaminhamento: Encaminhamento): Promise<Encaminhamento> => {
  const response = await apiService.post(`${BASE_URL}/encaminhamentos`, encaminhamento);
  return response.data;
};

export const registrarContraReferencia = async (id: number, contraReferencia: any): Promise<Encaminhamento> => {
  const response = await apiService.patch(`${BASE_URL}/encaminhamentos/${id}/contra-referencia`, contraReferencia);
  return response.data;
};

// Export all services
const assistenciaSocialService = {
  getConfiguracao,
  salvarConfiguracao,
  atualizarValorSalarioMinimo,
  atualizarValorLinhaPobreza,
  atualizarValorLinhaExtremaPobreza,
  getVinculos,
  getVinculosPorUnidade,
  criarVinculo,
  removerVinculo,
  getFamilias,
  getFamiliaPorId,
  criarFamilia,
  atualizarFamilia,
  getAtendimentos,
  getAtendimentoPorId,
  criarAtendimento,
  getBeneficios,
  getBeneficioPorId,
  criarBeneficio,
  atualizarBeneficio,
  getDispensacoes,
  getDispensacaoPorId,
  criarDispensacao,
  autorizarDispensacao,
  rejeitarDispensacao,
  getEncaminhamentos,
  getEncaminhamentoPorId,
  criarEncaminhamento,
  registrarContraReferencia
};

export default assistenciaSocialService;
