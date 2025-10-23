import api from '@/lib/api';

export interface Exame {
  id?: number;
  codigo: string;
  nome: string;
  nomeResumido?: string;
  grupoId?: number;
  grupoNome?: string;
  sinonimo?: string;
  codigoSigtap?: string;
  codigoTuss?: string;
  ativo: boolean;
  idadeMinima?: number;
  idadeMaxima?: number;
  sexoPermitido?: 'MASCULINO' | 'FEMININO' | 'AMBOS';
  diasValidade?: number;
  permiteAgendamento: boolean;
  exameUrgencia: boolean;
  tempoRealizacaoMinutos?: number;
  quantidadeSessoes?: number;
  orientacoesPaciente?: string;
  preparo?: string;
  mapaId?: number;
  ordemMapa?: number;
  tipoDigitacao: 'POR_CAMPO' | 'MEMORANDO' | 'MISTO';
  modeloLaudo?: string;
  usarAssinaturaEletronica: boolean;
  valorParticular?: number;
  valorSus?: number;
  tipoFaturamento?: 'BPA' | 'APAC' | 'PRESTADOR' | 'NAO_FATURA';
  codigoEquipamento?: string;
  usaInterfaceamento: boolean;
  materiais?: MaterialExame[];
  campos?: CampoExame[];
}

export interface MaterialExame {
  id?: number;
  codigo?: string;
  sigla: string;
  descricao: string;
  ativo: boolean;
  quantidade?: number;
  obrigatorio?: boolean;
}

export interface GrupoExame {
  id?: number;
  codigo?: string;
  nome: string;
  descricao?: string;
  ordem?: number;
  ativo: boolean;
}

export interface CampoExame {
  id?: number;
  exameId?: number;
  nome: string;
  label: string;
  tipoCampo: 'TEXTO' | 'NUMERO' | 'DECIMAL' | 'LISTA' | 'MEMORANDO' | 'DATA' | 'HORA' | 'CHECKBOX' | 'RADIO' | 'ARQUIVO';
  ordem: number;
  obrigatorio: boolean;
  tamanhoMaximo?: number;
  opcoesLista?: string;
  valorPadrao?: string;
  unidadeMedida?: string;
  casasDecimais?: number;
  valorMinimo?: number;
  valorMaximo?: number;
  mascara?: string;
  mostrarLaudo: boolean;
  ativo: boolean;
}

export interface RecepcaoExame {
  id?: number;
  numeroRecepcao?: string;
  codigoBarras?: string;
  pacienteId: number;
  pacienteNome?: string;
  pacienteCpf?: string;
  unidadeId: number;
  unidadeNome?: string;
  profissionalSolicitanteId?: number;
  profissionalSolicitanteNome?: string;
  agendamentoId?: number;
  dataRecepcao?: string;
  status: 'RECEPCIONADO' | 'AGUARDANDO_COLETA' | 'EM_COLETA' | 'COLETADO' | 'EM_ANALISE' | 'FINALIZADO' | 'ENTREGUE' | 'CANCELADO';
  urgente: boolean;
  observacoes?: string;
  biometriaColetada: boolean;
  convenioId?: number;
  numeroCarteirinha?: string;
  tipoAtendimento: 'SUS' | 'PARTICULAR' | 'CONVENIO' | 'GRATUITO';
  exames: ExameRecepcao[];
}

export interface ExameRecepcao {
  id?: number;
  recepcaoId?: number;
  exameId: number;
  exameNome?: string;
  exameCodigo?: string;
  motivoExameId?: number;
  quantidade: number;
  sessaoNumero?: number;
  autorizado: boolean;
  numeroAutorizacao?: string;
  valorExame?: number;
  observacoes?: string;
  status: 'AGUARDANDO_COLETA' | 'COLETADO' | 'EM_ANALISE' | 'RESULTADO_DIGITADO' | 'ASSINADO' | 'ENTREGUE' | 'CANCELADO';
}

export interface CriarRecepcaoRequest {
  pacienteId: number;
  unidadeId: number;
  profissionalSolicitanteId?: number;
  agendamentoId?: number;
  urgente: boolean;
  observacoes?: string;
  biometriaTemplate?: string;
  convenioId?: number;
  numeroCarteirinha?: string;
  tipoAtendimento: 'SUS' | 'PARTICULAR' | 'CONVENIO' | 'GRATUITO';
  exames: {
    exameId: number;
    motivoExameId?: number;
    quantidade: number;
    autorizado: boolean;
    numeroAutorizacao?: string;
    observacoes?: string;
  }[];
}

export interface ResultadoExame {
  id?: number;
  exameRecepcaoId: number;
  numeroRecepcao?: string;
  pacienteNome?: string;
  exameNome?: string;
  metodoId?: number;
  metodoNome?: string;
  dataResultado?: string;
  operadorDigitacao?: string;
  resultadoTexto?: string;
  valoresCampos?: ValorCampoResultado[];
  laudoGerado?: string;
  laudoLiberado: boolean;
  dataLiberacao?: string;
  assinado: boolean;
  profissionalAssinatura?: string;
  dataAssinatura?: string;
  impresso: boolean;
  dataImpressao?: string;
  quantidadeImpressoes: number;
  observacoes?: string;
}

export interface ValorCampoResultado {
  id?: number;
  resultadoId?: number;
  campoId: number;
  campoNome?: string;
  campoLabel?: string;
  valor?: string;
  valorNumerico?: number;
  valorTexto?: string;
  alterado: boolean;
  unidadeMedida?: string;
  valorReferenciaTexto?: string;
}

export interface ConfiguracaoLaboratorio {
  id?: number;
  unidadeId: number;
  controleTransacao: boolean;
  leituraCodigoBarras: boolean;
  usarEstagiosAtendimento: boolean;
  integracaoConsorcio: boolean;
  usarBiometria: boolean;
  gerarCodigoBarrasAutomatico: boolean;
  validarIdadeExame: boolean;
  permitirExameDuplicado: boolean;
  diasValidadeExame: number;
  digitacaoResultadoPorCampo: boolean;
  digitacaoResultadoMemorando: boolean;
  imprimirResultadoAutomatico: boolean;
  usarInterfaceamento: boolean;
  caminhoInterfaceamento?: string;
  verificarDocumentoEntrega: boolean;
  verificarBiometriaEntrega: boolean;
  permitirEntregaParcial: boolean;
  alertarExamePendente: boolean;
  impressoraEtiqueta?: string;
  impressoraComprovante?: string;
  impressoraMapa?: string;
  impressoraLaudo?: string;
  numeroViasEtiqueta: number;
  imprimirEtiquetaRecepcao: boolean;
  imprimirComprovanteRecepcao: boolean;
  configuracaoPpla?: string;
  larguraEtiqueta: number;
  alturaEtiqueta: number;
  incluirNomePacienteEtiqueta: boolean;
  incluirDataNascimentoEtiqueta: boolean;
  corEstagioRecepcao: string;
  corEstagioColeta: string;
  corEstagioResultado: string;
  corEstagioEntrega: string;
  periodoAlertaColeta: number;
  periodoAlertaResultado: number;
  usarAssinaturaEletronica: boolean;
  usarCertificadoDigital: boolean;
  caminhoImagemAssinatura?: string;
  usarPainelEletronico: boolean;
  tempoAtualizacaoPainel: number;
  exibirNomeCompletoPainel: boolean;
  exportarEsus: boolean;
  caminhoExportacaoEsus?: string;
}

const laboratorioService = {
  // Exames
  listarExames: () => api.get<Exame[]>('/laboratorio/exames'),
  listarExamesAtivos: () => api.get<Exame[]>('/laboratorio/exames/ativos'),
  buscarExame: (id: number) => api.get<Exame>(`/laboratorio/exames/${id}`),
  buscarExamePorCodigo: (codigo: string) => api.get<Exame>(`/laboratorio/exames/codigo/${codigo}`),
  buscarExames: (termo: string) => api.get<Exame[]>(`/laboratorio/exames/buscar?termo=${termo}`),
  criarExame: (exame: Exame) => api.post<Exame>('/laboratorio/exames', exame),
  atualizarExame: (id: number, exame: Exame) => api.put<Exame>(`/laboratorio/exames/${id}`, exame),
  deletarExame: (id: number) => api.delete(`/laboratorio/exames/${id}`),

  // Materiais
  listarMateriais: () => api.get<MaterialExame[]>('/laboratorio/materiais'),
  criarMaterial: (material: MaterialExame) => api.post<MaterialExame>('/laboratorio/materiais', material),
  atualizarMaterial: (id: number, material: MaterialExame) => api.put<MaterialExame>(`/laboratorio/materiais/${id}`, material),
  deletarMaterial: (id: number) => api.delete(`/laboratorio/materiais/${id}`),

  // Grupos
  listarGrupos: () => api.get<GrupoExame[]>('/laboratorio/grupos'),
  criarGrupo: (grupo: GrupoExame) => api.post<GrupoExame>('/laboratorio/grupos', grupo),
  atualizarGrupo: (id: number, grupo: GrupoExame) => api.put<GrupoExame>(`/laboratorio/grupos/${id}`, grupo),
  deletarGrupo: (id: number) => api.delete(`/laboratorio/grupos/${id}`),

  // Recepção
  criarRecepcao: (recepcao: CriarRecepcaoRequest) => api.post<RecepcaoExame>('/laboratorio/recepcao', recepcao),
  buscarRecepcao: (id: number) => api.get<RecepcaoExame>(`/laboratorio/recepcao/${id}`),
  buscarRecepcaoPorNumero: (numero: string) => api.get<RecepcaoExame>(`/laboratorio/recepcao/numero/${numero}`),
  listarRecepcoesPorPaciente: (pacienteId: number) => api.get<RecepcaoExame[]>(`/laboratorio/recepcao/paciente/${pacienteId}`),
  cancelarRecepcao: (id: number, motivo: string) => api.put(`/laboratorio/recepcao/${id}/cancelar?motivo=${motivo}`),

  // Resultados
  salvarResultado: (resultado: any) => api.post<ResultadoExame>('/laboratorio/resultados', resultado),
  buscarResultado: (id: number) => api.get<ResultadoExame>(`/laboratorio/resultados/${id}`),
  listarPendentesAssinatura: () => api.get<ResultadoExame[]>('/laboratorio/resultados/pendentes-assinatura'),
  listarPendentesDigitacao: (unidadeId?: number) =>
    api.get<ResultadoExame[]>(`/laboratorio/resultados/pendentes-digitacao${unidadeId ? `?unidadeId=${unidadeId}` : ''}`),
  assinarResultado: (id: number, profissionalId: number, assinaturaDigital?: string) =>
    api.put(`/laboratorio/resultados/${id}/assinar?profissionalId=${profissionalId}${assinaturaDigital ? `&assinaturaDigital=${assinaturaDigital}` : ''}`),

  // Coleta
  listarAguardandoColeta: (unidadeId?: number) => api.get<RecepcaoExame[]>(`/laboratorio/coleta/aguardando${unidadeId ? `?unidadeId=${unidadeId}` : ''}`),
  registrarColeta: (recepcaoId: number, materiais: any[]) => api.post(`/laboratorio/coleta/${recepcaoId}`, { materiais }),
  buscarColeta: (recepcaoId: number) => api.get(`/laboratorio/coleta/recepcao/${recepcaoId}`),
  
  // Entrega
  listarProntosEntrega: (unidadeId?: number) => api.get<ResultadoExame[]>(`/laboratorio/entrega/prontos${unidadeId ? `?unidadeId=${unidadeId}` : ''}`),
  registrarEntrega: (recepcaoId: number, dadosEntrega: {
    nomeRetirou: string;
    documentoRetirou: string;
    parentescoRetirou?: string;
    biometriaValidada?: boolean;
    documentoValidado?: boolean;
    assinaturaRetirada?: string;
    examesEntregues: number[];
    observacoes?: string;
  }) => api.post(`/laboratorio/entrega/${recepcaoId}`, dadosEntrega),
  buscarEntrega: (recepcaoId: number) => api.get(`/laboratorio/entrega/recepcao/${recepcaoId}`),

  // Configuração
  buscarConfiguracao: (unidadeId: number) => api.get<ConfiguracaoLaboratorio>(`/laboratorio/configuracao/unidade/${unidadeId}`),
  salvarConfiguracao: (config: ConfiguracaoLaboratorio) => api.post<ConfiguracaoLaboratorio>('/laboratorio/configuracao', config),
  atualizarConfiguracao: (id: number, config: ConfiguracaoLaboratorio) => api.put<ConfiguracaoLaboratorio>(`/laboratorio/configuracao/${id}`, config),
};

export default laboratorioService;