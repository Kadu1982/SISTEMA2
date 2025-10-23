export interface DadosClinicosPaciente {
  condicoesCronicas?: string[];
  indiceRisco?: number;
  ultimaConsulta?: string;
}

export interface Paciente {
  id?: number | string;
  nomeCompleto: string;
  nomeSocial?: string;
  nomeMae?: string;
  cpfMae?: string | null;
  cpf: string;
  justificativaAusenciaCpf?: string;
  cns?: string;
  cartaoSus?: string;
  nomePai?: string;
  sexo?: string;
  dataNascimento: string;
  acamado?: boolean;
  domiciliado?: boolean;
  condSaudeMental?: boolean;
  usaPlantas?: boolean;
  outrasCondicoes?: string;

  // ✅ NOVOS CAMPOS PARA SAÚDE DA MULHER
  dataUltimaMenstruacao?: string;
  gestante?: boolean;
  semanasGestacao?: number;

  // Campos legados para compatibilidade
  nome?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  genero?: string;
  estadoCivil?: string;
  profissao?: string;
  contatoEmergencia?: string;
  telefoneEmergencia?: string;
  observacoesMedicas?: string;
  prioridade?: string;
  unidadeSaude?: string;
  microarea?: string;
  equipeESF?: string;
  acs?: string;
  condicoesCronicas?: string[];
  ultimaConsulta?: string;

  // Endereco
  municipio?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;

  // Contato
  telefoneCelular?: string;
  telefoneContato?: string;

  // Documentos
  tipoSanguineo?: string;
  rg?: string;
  orgaoEmissor?: string;
  certidaoNascimento?: string;
  carteiraTrabalho?: string;
  tituloEleitor?: string;

  // Outros dados
  prontuarioFamiliar?: string;
  corRaca?: string;
  etnia?: string;
  escolaridade?: string;
  situacaoFamiliar?: string;
  cbo?: string;

  dadosClinicos?: DadosClinicosPaciente;

  // Status
  ativo?: boolean;

  // Campos de auditoria
  dataCriacao?: string;
  dataAtualizacao?: string;
  criadoPor?: string;
  atualizadoPor?: string;
}

// Lista/sugestão leve utilizada em componentes de UPA (autocomplete/seleção)
// Mantém compatibilidade com usos existentes sem impactar o tipo Paciente principal
export interface PacienteList {
  id: number;
  nomeCompleto: string;
  cpf?: string;
  cns?: string;
  dataNascimento?: string;
  sexo?: string;
  idade?: number;
  endereco?: string;
  telefone?: string;
}

// Tipo para criação de paciente (campos obrigatórios)
export interface CriarPacienteRequest {
  // Campos obrigatorios
  nomeCompleto: string;
  dataNascimento: string;

  // Campos opcionais
  nomeSocial?: string;
  nomeMae?: string;
  cpfMae?: string | null;
  nomePai?: string;
  cpf?: string;
  justificativaAusenciaCpf?: string;
  cns?: string;
  sexo?: string;
  acamado?: boolean;
  domiciliado?: boolean;
  condSaudeMental?: boolean;
  usaPlantas?: boolean;
  outrasCondicoes?: string;
  unidadeSaude?: string;
  microarea?: string;
  equipeESF?: string;
  acs?: string;
  condicoesCronicas?: string[];
  ultimaConsulta?: string;
  dadosClinicos?: DadosClinicosPaciente;
  municipio?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  telefoneCelular?: string;
  telefoneContato?: string;
  tipoSanguineo?: string;
  rg?: string;
  orgaoEmissor?: string;
  certidaoNascimento?: string;
  carteiraTrabalho?: string;
  tituloEleitor?: string;
  prontuarioFamiliar?: string;
  corRaca?: string;
  etnia?: string;
  escolaridade?: string;
  situacaoFamiliar?: string;
  cbo?: string;

  // Campos legados para compatibilidade
  nome?: string;
  cartaoSus?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  genero?: string;
  estadoCivil?: string;
  profissao?: string;
  contatoEmergencia?: string;
  telefoneEmergencia?: string;
  observacoesMedicas?: string;
}

// Tipo para atualização de paciente (todos os campos opcionais exceto ID)
export interface AtualizarPacienteRequest {
  id: number | string;

  // Campos opcionais
  nomeCompleto?: string;
  nomeSocial?: string;
  nomeMae?: string;
  cpfMae?: string | null;
  nomePai?: string;
  cpf?: string;
  justificativaAusenciaCpf?: string;
  cns?: string;
  sexo?: string;
  dataNascimento?: string;
  acamado?: boolean;
  domiciliado?: boolean;
  condSaudeMental?: boolean;
  usaPlantas?: boolean;
  outrasCondicoes?: string;
  unidadeSaude?: string;
  microarea?: string;
  equipeESF?: string;
  acs?: string;
  condicoesCronicas?: string[];
  ultimaConsulta?: string;
  dadosClinicos?: DadosClinicosPaciente;
  municipio?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  telefoneCelular?: string;
  telefoneContato?: string;
  tipoSanguineo?: string;
  rg?: string;
  orgaoEmissor?: string;
  certidaoNascimento?: string;
  carteiraTrabalho?: string;
  tituloEleitor?: string;
  prontuarioFamiliar?: string;
  corRaca?: string;
  etnia?: string;
  escolaridade?: string;
  situacaoFamiliar?: string;
  cbo?: string;
  ativo?: boolean;

  // Campos legados para compatibilidade
  nome?: string;
  cartaoSus?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  genero?: string;
  estadoCivil?: string;
  profissao?: string;
  contatoEmergencia?: string;
  telefoneEmergencia?: string;
  observacoesMedicas?: string;
}

// Tipo para resposta de busca
export interface PacienteBuscaResponse {
  pacientes: Paciente[];
  total: number;
  pagina: number;
  totalPaginas: number;
}