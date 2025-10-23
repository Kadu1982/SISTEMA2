import api from '@/lib/api';

export interface Vacina {
  id?: number;
  codigo: string;
  nome: string;
  descricao?: string;
  tipoVacina: 'ROTINA' | 'CAMPANHA' | 'COVID19' | 'ESPECIAL';
  codigoLediEsus?: string;
  codigoPni?: string;
  ativa: boolean;
  exportarSipni: boolean;
  exportarRnds: boolean;
  calendarioVacinal: boolean;
  idadeMinimaDias?: number;
  idadeMaximaDias?: number;
  intervaloMinimoDosesDias?: number;
  numeroDosesEsquema?: number;
}

export interface AplicacaoVacina {
  id?: number;
  pacienteId: number;
  pacienteNome?: string;
  vacinaId: number;
  vacinaNome?: string;
  unidadeId: number;
  unidadeNome?: string;
  profissionalId?: number;
  profissionalNome?: string;
  dataAplicacao: string; // YYYY-MM-DD
  horaAplicacao?: string;
  estrategiaVacinacao: 'ROTINA' | 'CAMPANHA' | 'BLOQUEIO' | 'INTENSIFICACAO' | 'ESPECIAL';
  localAtendimento: 'UBS' | 'DOMICILIO' | 'ESCOLA' | 'OUTROS' | 'NENHUM';
  dose?: string;
  lote?: string;
  fabricante?: string;
  dataValidade?: string;
  viaAdministracao?: string;
  localAplicacao?: string;
  observacoes?: string;
  exportadoEsus?: boolean;
  exportadoSipni?: boolean;
  exportadoRnds?: boolean;
}

export interface ConfiguracaoImunizacao {
  id?: number;
  unidadeId: number;
  exportarRnds: boolean;
  exportarEsusAb: boolean;
  exportarSipni: boolean;
  urlWebserviceRnds?: string;
  tokenRnds?: string;
  certificadoDigitalPath?: string;
  senhaCertificado?: string;
  intervaloExportacaoMinutos?: number;
  ativo: boolean;
}

const imunizacaoService = {
  // ============= VACINAS =============
  listarVacinas: () => api.get<Vacina[]>('/imunizacao/vacinas'),
  listarVacinasAtivas: () => api.get<Vacina[]>('/imunizacao/vacinas/ativas'),
  buscarVacina: (id: number) => api.get<Vacina>(`/imunizacao/vacinas/${id}`),
  criarVacina: (vacina: Vacina) => api.post<Vacina>('/imunizacao/vacinas', vacina),
  atualizarVacina: (id: number, vacina: Vacina) => api.put<Vacina>(`/imunizacao/vacinas/${id}`, vacina),
  deletarVacina: (id: number) => api.delete(`/imunizacao/vacinas/${id}`),

  // ============= APLICAÇÕES =============
  registrarAplicacao: (aplicacao: AplicacaoVacina) =>
    api.post<AplicacaoVacina>('/imunizacao/aplicacoes', aplicacao),

  buscarAplicacoesPorPaciente: (pacienteId: number) =>
    api.get<AplicacaoVacina[]>(`/imunizacao/aplicacoes/paciente/${pacienteId}`),

  buscarAplicacoesComFiltros: (params: {
    pacienteId?: number;
    vacinaId?: number;
    unidadeId?: number;
    dataInicio?: string;
    dataFim?: string;
    page?: number;
    size?: number;
  }) => api.get<{ content: AplicacaoVacina[]; totalElements: number }>('/imunizacao/aplicacoes', { params }),

  // ============= CONFIGURAÇÕES =============
  buscarConfiguracao: (unidadeId: number) =>
    api.get<ConfiguracaoImunizacao>(`/imunizacao/configuracao/unidade/${unidadeId}`),

  salvarConfiguracao: (config: ConfiguracaoImunizacao) =>
    api.post<ConfiguracaoImunizacao>('/imunizacao/configuracao', config),
};

export default imunizacaoService;
