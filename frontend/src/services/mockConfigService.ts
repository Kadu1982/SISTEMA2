import { toast } from '@/components/ui/use-toast';

// Mock data for system settings
const mockGeneralSettings = {
  systemName: 'Cidade Saúde Digital',
  organizationName: 'Secretaria Municipal de Saúde',
  adminEmail: 'admin@saude.gov.br',
  supportPhone: '0800123456',
  maintenanceMode: false,
  defaultLanguage: 'pt-BR',
  defaultTimeZone: 'America/Sao_Paulo',
  systemLogo: '',
  systemFavicon: '',
};

const mockSecuritySettings = {
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  passwordExpiryDays: 90,
  twoFactorAuthEnabled: false,
  allowedIpRanges: '',
};

const mockEmailSettings = {
  smtpServer: 'smtp.example.com',
  smtpPort: 587,
  smtpUsername: 'user@example.com',
  smtpPassword: 'password123',
  smtpSecurity: 'tls',
  emailSender: 'noreply@saude.gov.br',
  emailReplyTo: 'suporte@saude.gov.br',
  emailSignature: 'Equipe de Suporte - Cidade Saúde Digital',
};

const mockDatabaseSettings = {
  dbHost: 'localhost',
  dbPort: 5432,
  dbName: 'cidade_saude_digital',
  dbUsername: 'postgres',
  dbPassword: 'postgres',
  backupEnabled: true,
  backupFrequency: 'daily',
  backupTime: '02:00',
  backupRetentionDays: 30,
};

// Mock data for operators
const mockOperators = [
  {
    id: 1,
    nome: 'Administrador Master',
    login: 'admin.master',
    email: 'admin.master@saude.gov.br',
    perfilId: 1,
    perfilNome: 'ADMINISTRADOR_SISTEMA',
    unidadeSaudeId: 1,
    unidadeSaudeNome: 'Unidade Central',
    ativo: true,
    isMaster: true,
    dataCriacao: '2023-01-01T00:00:00',
    dataUltimoAcesso: '2023-06-15T10:30:00',
  },
  {
    id: 2,
    nome: 'João Silva',
    login: 'joao.silva',
    email: 'joao.silva@saude.gov.br',
    perfilId: 2,
    perfilNome: 'MEDICO',
    unidadeSaudeId: 1,
    unidadeSaudeNome: 'Unidade Central',
    ativo: true,
    isMaster: false,
    dataCriacao: '2023-01-02T00:00:00',
    dataUltimoAcesso: '2023-06-14T14:20:00',
  },
  {
    id: 3,
    nome: 'Maria Santos',
    login: 'maria.santos',
    email: 'maria.santos@saude.gov.br',
    perfilId: 3,
    perfilNome: 'ENFERMEIRO',
    unidadeSaudeId: 2,
    unidadeSaudeNome: 'Posto de Saúde Norte',
    ativo: true,
    isMaster: false,
    dataCriacao: '2023-01-03T00:00:00',
    dataUltimoAcesso: '2023-06-13T09:15:00',
  },
  {
    id: 4,
    nome: 'Pedro Oliveira',
    login: 'pedro.oliveira',
    email: 'pedro.oliveira@saude.gov.br',
    perfilId: 4,
    perfilNome: 'RECEPCIONISTA',
    unidadeSaudeId: 3,
    unidadeSaudeNome: 'Posto de Saúde Sul',
    ativo: false,
    isMaster: false,
    dataCriacao: '2023-01-04T00:00:00',
    dataUltimoAcesso: '2023-05-20T16:45:00',
  },
];

// Mock data for roles
const mockRoles = [
  {
    id: 1,
    nome: 'ADMINISTRADOR_SISTEMA',
    descricao: 'Acesso completo ao sistema',
    permissoes: [
      { id: 1, nome: 'CONFIGURACAO_VISUALIZAR', descricao: 'Visualizar configurações do sistema', grupo: 'Configurações' },
      { id: 2, nome: 'CONFIGURACAO_EDITAR', descricao: 'Editar configurações do sistema', grupo: 'Configurações' },
      { id: 3, nome: 'OPERADOR_VISUALIZAR', descricao: 'Visualizar operadores', grupo: 'Operadores' },
      { id: 4, nome: 'OPERADOR_CRIAR', descricao: 'Criar operadores', grupo: 'Operadores' },
      { id: 5, nome: 'OPERADOR_EDITAR', descricao: 'Editar operadores', grupo: 'Operadores' },
      { id: 6, nome: 'OPERADOR_EXCLUIR', descricao: 'Excluir operadores', grupo: 'Operadores' },
      { id: 7, nome: 'PERFIL_VISUALIZAR', descricao: 'Visualizar perfis', grupo: 'Perfis' },
      { id: 8, nome: 'PERFIL_CRIAR', descricao: 'Criar perfis', grupo: 'Perfis' },
      { id: 9, nome: 'PERFIL_EDITAR', descricao: 'Editar perfis', grupo: 'Perfis' },
      { id: 10, nome: 'PERFIL_EXCLUIR', descricao: 'Excluir perfis', grupo: 'Perfis' },
    ],
  },
  {
    id: 2,
    nome: 'MEDICO',
    descricao: 'Acesso às funcionalidades médicas',
    permissoes: [
      { id: 11, nome: 'ATENDIMENTO_VISUALIZAR', descricao: 'Visualizar atendimentos', grupo: 'Atendimentos' },
      { id: 12, nome: 'ATENDIMENTO_CRIAR', descricao: 'Criar atendimentos', grupo: 'Atendimentos' },
      { id: 13, nome: 'ATENDIMENTO_EDITAR', descricao: 'Editar atendimentos', grupo: 'Atendimentos' },
      { id: 14, nome: 'PACIENTE_VISUALIZAR', descricao: 'Visualizar pacientes', grupo: 'Pacientes' },
      { id: 15, nome: 'EXAME_SOLICITAR', descricao: 'Solicitar exames', grupo: 'Exames' },
      { id: 16, nome: 'EXAME_VISUALIZAR', descricao: 'Visualizar exames', grupo: 'Exames' },
    ],
  },
  {
    id: 3,
    nome: 'ENFERMEIRO',
    descricao: 'Acesso às funcionalidades de enfermagem',
    permissoes: [
      { id: 14, nome: 'PACIENTE_VISUALIZAR', descricao: 'Visualizar pacientes', grupo: 'Pacientes' },
      { id: 17, nome: 'TRIAGEM_REALIZAR', descricao: 'Realizar triagem', grupo: 'Triagem' },
      { id: 18, nome: 'VACINA_APLICAR', descricao: 'Aplicar vacinas', grupo: 'Vacinas' },
      { id: 19, nome: 'VACINA_VISUALIZAR', descricao: 'Visualizar vacinas', grupo: 'Vacinas' },
    ],
  },
  {
    id: 4,
    nome: 'RECEPCIONISTA',
    descricao: 'Acesso às funcionalidades de recepção',
    permissoes: [
      { id: 14, nome: 'PACIENTE_VISUALIZAR', descricao: 'Visualizar pacientes', grupo: 'Pacientes' },
      { id: 20, nome: 'PACIENTE_CADASTRAR', descricao: 'Cadastrar pacientes', grupo: 'Pacientes' },
      { id: 21, nome: 'AGENDAMENTO_CRIAR', descricao: 'Criar agendamentos', grupo: 'Agendamentos' },
      { id: 22, nome: 'AGENDAMENTO_VISUALIZAR', descricao: 'Visualizar agendamentos', grupo: 'Agendamentos' },
      { id: 23, nome: 'AGENDAMENTO_EDITAR', descricao: 'Editar agendamentos', grupo: 'Agendamentos' },
    ],
  },
];

// Mock data for permissions
const mockPermissions = [
  { id: 1, nome: 'CONFIGURACAO_VISUALIZAR', descricao: 'Visualizar configurações do sistema', grupo: 'Configurações' },
  { id: 2, nome: 'CONFIGURACAO_EDITAR', descricao: 'Editar configurações do sistema', grupo: 'Configurações' },
  { id: 3, nome: 'OPERADOR_VISUALIZAR', descricao: 'Visualizar operadores', grupo: 'Operadores' },
  { id: 4, nome: 'OPERADOR_CRIAR', descricao: 'Criar operadores', grupo: 'Operadores' },
  { id: 5, nome: 'OPERADOR_EDITAR', descricao: 'Editar operadores', grupo: 'Operadores' },
  { id: 6, nome: 'OPERADOR_EXCLUIR', descricao: 'Excluir operadores', grupo: 'Operadores' },
  { id: 7, nome: 'PERFIL_VISUALIZAR', descricao: 'Visualizar perfis', grupo: 'Perfis' },
  { id: 8, nome: 'PERFIL_CRIAR', descricao: 'Criar perfis', grupo: 'Perfis' },
  { id: 9, nome: 'PERFIL_EDITAR', descricao: 'Editar perfis', grupo: 'Perfis' },
  { id: 10, nome: 'PERFIL_EXCLUIR', descricao: 'Excluir perfis', grupo: 'Perfis' },
  { id: 11, nome: 'ATENDIMENTO_VISUALIZAR', descricao: 'Visualizar atendimentos', grupo: 'Atendimentos' },
  { id: 12, nome: 'ATENDIMENTO_CRIAR', descricao: 'Criar atendimentos', grupo: 'Atendimentos' },
  { id: 13, nome: 'ATENDIMENTO_EDITAR', descricao: 'Editar atendimentos', grupo: 'Atendimentos' },
  { id: 14, nome: 'PACIENTE_VISUALIZAR', descricao: 'Visualizar pacientes', grupo: 'Pacientes' },
  { id: 15, nome: 'EXAME_SOLICITAR', descricao: 'Solicitar exames', grupo: 'Exames' },
  { id: 16, nome: 'EXAME_VISUALIZAR', descricao: 'Visualizar exames', grupo: 'Exames' },
  { id: 17, nome: 'TRIAGEM_REALIZAR', descricao: 'Realizar triagem', grupo: 'Triagem' },
  { id: 18, nome: 'VACINA_APLICAR', descricao: 'Aplicar vacinas', grupo: 'Vacinas' },
  { id: 19, nome: 'VACINA_VISUALIZAR', descricao: 'Visualizar vacinas', grupo: 'Vacinas' },
  { id: 20, nome: 'PACIENTE_CADASTRAR', descricao: 'Cadastrar pacientes', grupo: 'Pacientes' },
  { id: 21, nome: 'AGENDAMENTO_CRIAR', descricao: 'Criar agendamentos', grupo: 'Agendamentos' },
  { id: 22, nome: 'AGENDAMENTO_VISUALIZAR', descricao: 'Visualizar agendamentos', grupo: 'Agendamentos' },
  { id: 23, nome: 'AGENDAMENTO_EDITAR', descricao: 'Editar agendamentos', grupo: 'Agendamentos' },
];

// Mock data for health units
const mockUnidadesSaude = [
  { id: 1, nome: 'Unidade Central', endereco: 'Rua Principal, 123' },
  { id: 2, nome: 'Posto de Saúde Norte', endereco: 'Av. Norte, 456' },
  { id: 3, nome: 'Posto de Saúde Sul', endereco: 'Av. Sul, 789' },
  { id: 4, nome: 'Posto de Saúde Leste', endereco: 'Av. Leste, 101' },
  { id: 5, nome: 'Posto de Saúde Oeste', endereco: 'Av. Oeste, 202' },
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock service for system settings
export const mockConfigService = {
  // General settings
  getConfiguracoesGerais: async () => {
    await delay(500);
    return mockGeneralSettings;
  },
  updateConfiguracoesGerais: async (data: any) => {
    await delay(500);
    Object.assign(mockGeneralSettings, data);
    toast({
      title: 'Sucesso',
      description: 'Configurações gerais atualizadas com sucesso.',
    });
    return mockGeneralSettings;
  },

  // Security settings
  getConfiguracoesSeguranca: async () => {
    await delay(500);
    return mockSecuritySettings;
  },
  updateConfiguracoesSeguranca: async (data: any) => {
    await delay(500);
    Object.assign(mockSecuritySettings, data);
    toast({
      title: 'Sucesso',
      description: 'Configurações de segurança atualizadas com sucesso.',
    });
    return mockSecuritySettings;
  },

  // Email settings
  getConfiguracoesEmail: async () => {
    await delay(500);
    return mockEmailSettings;
  },
  updateConfiguracoesEmail: async (data: any) => {
    await delay(500);
    Object.assign(mockEmailSettings, data);
    toast({
      title: 'Sucesso',
      description: 'Configurações de email atualizadas com sucesso.',
    });
    return mockEmailSettings;
  },
  testarConexaoEmail: async (data: any) => {
    await delay(1000);
    const success = Math.random() > 0.3; // 70% chance of success
    if (success) {
      toast({
        title: 'Sucesso',
        description: 'Conexão com o servidor de email testada com sucesso.',
      });
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível conectar ao servidor de email. Verifique as configurações.',
        variant: 'destructive',
      });
    }
    return success;
  },

  // Database settings
  getConfiguracoesBancoDados: async () => {
    await delay(500);
    return mockDatabaseSettings;
  },
  updateConfiguracoesBancoDados: async (data: any) => {
    await delay(500);
    Object.assign(mockDatabaseSettings, data);
    toast({
      title: 'Sucesso',
      description: 'Configurações de banco de dados atualizadas com sucesso.',
    });
    return mockDatabaseSettings;
  },
  testarConexaoBancoDados: async (data: any) => {
    await delay(1000);
    const success = Math.random() > 0.3; // 70% chance of success
    if (success) {
      toast({
        title: 'Sucesso',
        description: 'Conexão com o banco de dados testada com sucesso.',
      });
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível conectar ao banco de dados. Verifique as configurações.',
        variant: 'destructive',
      });
    }
    return success;
  },
  realizarBackup: async () => {
    await delay(2000);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `/backups/cidade_saude_digital_${timestamp}.sql`;
    toast({
      title: 'Sucesso',
      description: `Backup realizado com sucesso: ${backupPath}`,
    });
    return backupPath;
  },

  // Operators
  getOperadores: async () => {
    await delay(500);
    return [...mockOperators];
  },
  getOperador: async (id: number) => {
    await delay(500);
    const operador = mockOperators.find(op => op.id === id);
    if (!operador) {
      throw new Error('Operador não encontrado');
    }
    return { ...operador };
  },
  createOperador: async (data: any) => {
    await delay(500);
    const newId = Math.max(...mockOperators.map(op => op.id)) + 1;
    const newOperador = {
      id: newId,
      ...data,
      dataCriacao: new Date().toISOString(),
      dataUltimoAcesso: null,
    };
    mockOperators.push(newOperador);
    return { ...newOperador };
  },
  updateOperador: async (id: number, data: any) => {
    await delay(500);
    const index = mockOperators.findIndex(op => op.id === id);
    if (index === -1) {
      throw new Error('Operador não encontrado');
    }
    mockOperators[index] = { ...mockOperators[index], ...data };
    return { ...mockOperators[index] };
  },
  deleteOperador: async (id: number) => {
    await delay(500);
    const index = mockOperators.findIndex(op => op.id === id);
    if (index === -1) {
      throw new Error('Operador não encontrado');
    }
    mockOperators.splice(index, 1);
    return true;
  },

  // Roles
  getPerfis: async () => {
    await delay(500);
    return [...mockRoles];
  },
  getPerfil: async (id: number) => {
    await delay(500);
    const perfil = mockRoles.find(p => p.id === id);
    if (!perfil) {
      throw new Error('Perfil não encontrado');
    }
    return { ...perfil };
  },
  createPerfil: async (data: any) => {
    await delay(500);
    const newId = Math.max(...mockRoles.map(p => p.id)) + 1;
    const permissoes = data.permissoes.map((id: string) => {
      const permissao = mockPermissions.find(p => p.id === parseInt(id));
      if (!permissao) {
        throw new Error(`Permissão com ID ${id} não encontrada`);
      }
      return { ...permissao };
    });
    const newPerfil = {
      id: newId,
      nome: data.nome,
      descricao: data.descricao,
      permissoes,
    };
    mockRoles.push(newPerfil);
    return { ...newPerfil };
  },
  updatePerfil: async (id: number, data: any) => {
    await delay(500);
    const index = mockRoles.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Perfil não encontrado');
    }
    const permissoes = data.permissoes.map((id: string) => {
      const permissao = mockPermissions.find(p => p.id === parseInt(id));
      if (!permissao) {
        throw new Error(`Permissão com ID ${id} não encontrada`);
      }
      return { ...permissao };
    });
    mockRoles[index] = {
      ...mockRoles[index],
      nome: data.nome,
      descricao: data.descricao,
      permissoes,
    };
    return { ...mockRoles[index] };
  },
  deletePerfil: async (id: number) => {
    await delay(500);
    const index = mockRoles.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Perfil não encontrado');
    }
    mockRoles.splice(index, 1);
    return true;
  },

  // Permissions
  getPermissoes: async () => {
    await delay(500);
    return [...mockPermissions];
  },

  // Health units
  getUnidadesSaude: async () => {
    await delay(500);
    return [...mockUnidadesSaude];
  },
};

export default mockConfigService;