-- Migration para criação do módulo Ambulatório Hospitalar
-- Versão: 1.0.0
-- Data: 2025-09-26

-- ============================================================
-- Tabela de Agendamentos do Ambulatório Hospitalar
-- ============================================================
CREATE TABLE ambulatorio_agendamentos (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    profissional_id BIGINT NOT NULL,
    unidade_id BIGINT NOT NULL,
    especialidade_id BIGINT NOT NULL,
    data_agendamento DATE NOT NULL,
    hora_agendamento TIME NOT NULL,
    tipo_consulta NVARCHAR(20),
    status_agendamento NVARCHAR(20) NOT NULL DEFAULT 'AGENDADO',
    prioridade NVARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    observacoes NVARCHAR(1000),
    motivo_consulta NVARCHAR(500),
    encaminhamento_interno BIT NOT NULL DEFAULT 0,
    agendamento_origem_id BIGINT,
    numero_guia NVARCHAR(50),
    convenio_id BIGINT,
    retorno_programado BIT NOT NULL DEFAULT 0,
    dias_retorno INT,
    data_criacao DATETIME2 NOT NULL DEFAULT GETDATE(),
    operador_criacao_id BIGINT NOT NULL,
    data_confirmacao DATETIME2,
    operador_confirmacao_id BIGINT,
    data_chegada DATETIME2,
    data_chamada DATETIME2,
    data_inicio_atendimento DATETIME2,
    data_fim_atendimento DATETIME2,
    tempo_espera_minutos INT,
    tempo_atendimento_minutos INT,
    numero_sala NVARCHAR(20),
    observacoes_atendimento NVARCHAR(1000),

    -- Constraints
    CONSTRAINT FK_ambulatorio_agendamentos_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT FK_ambulatorio_agendamentos_operador_criacao FOREIGN KEY (operador_criacao_id) REFERENCES operadores(id),
    CONSTRAINT FK_ambulatorio_agendamentos_operador_confirmacao FOREIGN KEY (operador_confirmacao_id) REFERENCES operadores(id),

    -- Checks
    CONSTRAINT CHK_ambulatorio_agendamentos_tipo_consulta
        CHECK (tipo_consulta IN ('PRIMEIRA_VEZ', 'RETORNO', 'ENCAMINHAMENTO', 'URGENCIA', 'REAVALIACAO')),
    CONSTRAINT CHK_ambulatorio_agendamentos_status
        CHECK (status_agendamento IN ('AGENDADO', 'CONFIRMADO', 'PRESENTE', 'CHAMADO', 'EM_ATENDIMENTO', 'ATENDIDO', 'FALTOU', 'CANCELADO', 'REAGENDADO')),
    CONSTRAINT CHK_ambulatorio_agendamentos_prioridade
        CHECK (prioridade IN ('BAIXA', 'NORMAL', 'ALTA', 'URGENTE'))
);

-- Índices para agendamentos
CREATE INDEX IDX_ambulatorio_agendamentos_paciente ON ambulatorio_agendamentos(paciente_id);
CREATE INDEX IDX_ambulatorio_agendamentos_profissional_data ON ambulatorio_agendamentos(profissional_id, data_agendamento);
CREATE INDEX IDX_ambulatorio_agendamentos_unidade_data ON ambulatorio_agendamentos(unidade_id, data_agendamento);
CREATE INDEX IDX_ambulatorio_agendamentos_especialidade ON ambulatorio_agendamentos(especialidade_id);
CREATE INDEX IDX_ambulatorio_agendamentos_data_status ON ambulatorio_agendamentos(data_agendamento, status_agendamento);
CREATE INDEX IDX_ambulatorio_agendamentos_status ON ambulatorio_agendamentos(status_agendamento);

-- ============================================================
-- Tabela de Escalas Médicas
-- ============================================================
CREATE TABLE ambulatorio_escalas_medicas (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    profissional_id BIGINT NOT NULL,
    unidade_id BIGINT NOT NULL,
    especialidade_id BIGINT NOT NULL,
    data_escala DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    intervalo_consulta_minutos INT NOT NULL DEFAULT 30,
    vagas_disponiveis INT NOT NULL,
    vagas_ocupadas INT NOT NULL DEFAULT 0,
    vagas_bloqueadas INT NOT NULL DEFAULT 0,
    status_escala NVARCHAR(20) NOT NULL DEFAULT 'ATIVA',
    tipo_escala NVARCHAR(20),
    permite_encaixe BIT NOT NULL DEFAULT 0,
    vagas_encaixe INT DEFAULT 0,
    numero_sala NVARCHAR(20),
    observacoes NVARCHAR(500),
    data_criacao DATETIME2 NOT NULL DEFAULT GETDATE(),
    operador_criacao_id BIGINT NOT NULL,
    data_ultima_alteracao DATETIME2,
    operador_alteracao_id BIGINT,

    -- Constraints
    CONSTRAINT FK_ambulatorio_escalas_operador_criacao FOREIGN KEY (operador_criacao_id) REFERENCES operadores(id),
    CONSTRAINT FK_ambulatorio_escalas_operador_alteracao FOREIGN KEY (operador_alteracao_id) REFERENCES operadores(id),

    -- Checks
    CONSTRAINT CHK_ambulatorio_escalas_status
        CHECK (status_escala IN ('ATIVA', 'INATIVA', 'CANCELADA', 'SUSPENSA', 'FINALIZADA')),
    CONSTRAINT CHK_ambulatorio_escalas_tipo
        CHECK (tipo_escala IN ('NORMAL', 'EXTRA', 'PLANTAO', 'SUBSTITUICAO', 'EMERGENCIA')),
    CONSTRAINT CHK_ambulatorio_escalas_vagas_positivas
        CHECK (vagas_disponiveis > 0 AND vagas_ocupadas >= 0 AND vagas_bloqueadas >= 0),
    CONSTRAINT CHK_ambulatorio_escalas_intervalo
        CHECK (intervalo_consulta_minutos >= 5)
);

-- Índices para escalas
CREATE INDEX IDX_ambulatorio_escalas_profissional_data ON ambulatorio_escalas_medicas(profissional_id, data_escala);
CREATE INDEX IDX_ambulatorio_escalas_unidade_data ON ambulatorio_escalas_medicas(unidade_id, data_escala);
CREATE INDEX IDX_ambulatorio_escalas_especialidade ON ambulatorio_escalas_medicas(especialidade_id);
CREATE INDEX IDX_ambulatorio_escalas_data_status ON ambulatorio_escalas_medicas(data_escala, status_escala);
CREATE INDEX IDX_ambulatorio_escalas_status ON ambulatorio_escalas_medicas(status_escala);

-- ============================================================
-- Tabela de Presença de Profissionais
-- ============================================================
CREATE TABLE ambulatorio_presenca_profissionais (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    escala_id BIGINT NOT NULL,
    profissional_id BIGINT NOT NULL,
    data_presenca DATE NOT NULL,
    hora_chegada TIME,
    hora_saida TIME,
    status_presenca NVARCHAR(20) NOT NULL DEFAULT 'AUSENTE',
    motivo_falta NVARCHAR(30),
    justificativa NVARCHAR(500),
    horas_trabalhadas INT,
    atraso_minutos INT NOT NULL DEFAULT 0,
    saida_antecipada_minutos INT NOT NULL DEFAULT 0,
    total_consultas_realizadas INT NOT NULL DEFAULT 0,
    total_faltas_pacientes INT NOT NULL DEFAULT 0,
    observacoes NVARCHAR(1000),
    data_registro DATETIME2 NOT NULL DEFAULT GETDATE(),
    operador_registro_id BIGINT NOT NULL,
    data_ultima_alteracao DATETIME2,
    operador_alteracao_id BIGINT,

    -- Constraints
    CONSTRAINT FK_ambulatorio_presenca_escala FOREIGN KEY (escala_id) REFERENCES ambulatorio_escalas_medicas(id),
    CONSTRAINT FK_ambulatorio_presenca_operador_registro FOREIGN KEY (operador_registro_id) REFERENCES operadores(id),
    CONSTRAINT FK_ambulatorio_presenca_operador_alteracao FOREIGN KEY (operador_alteracao_id) REFERENCES operadores(id),

    -- Checks
    CONSTRAINT CHK_ambulatorio_presenca_status
        CHECK (status_presenca IN ('PRESENTE', 'AUSENTE', 'FALTA_JUSTIFICADA', 'FALTA_INJUSTIFICADA', 'ATESTADO', 'FOLGA', 'FERIAS', 'LICENCA')),
    CONSTRAINT CHK_ambulatorio_presenca_motivo
        CHECK (motivo_falta IN ('DOENCA', 'COMPROMISSO_PESSOAL', 'PROBLEMA_FAMILIAR', 'TRANSPORTE', 'ATESTADO_MEDICO', 'LICENCA_MATERNIDADE', 'LICENCA_PATERNIDADE', 'FERIAS', 'FOLGA_PROGRAMADA', 'OUTRO')),

    -- Único por escala e data
    CONSTRAINT UQ_ambulatorio_presenca_escala_data UNIQUE (escala_id, data_presenca)
);

-- Índices para presença
CREATE INDEX IDX_ambulatorio_presenca_profissional_data ON ambulatorio_presenca_profissionais(profissional_id, data_presenca);
CREATE INDEX IDX_ambulatorio_presenca_escala ON ambulatorio_presenca_profissionais(escala_id);
CREATE INDEX IDX_ambulatorio_presenca_status ON ambulatorio_presenca_profissionais(status_presenca);

-- ============================================================
-- Tabela de Encaminhamentos Internos
-- ============================================================
CREATE TABLE ambulatorio_encaminhamentos_internos (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    atendimento_origem_id BIGINT,
    agendamento_origem_id BIGINT,
    profissional_origem_id BIGINT NOT NULL,
    especialidade_origem_id BIGINT NOT NULL,
    especialidade_destino_id BIGINT NOT NULL,
    profissional_destino_id BIGINT,
    unidade_destino_id BIGINT,
    tipo_encaminhamento NVARCHAR(30),
    prioridade NVARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    motivo_encaminhamento NVARCHAR(1000) NOT NULL,
    observacoes_clinicas NVARCHAR(1000),
    exames_anexos NVARCHAR(500),
    medicamentos_uso NVARCHAR(500),
    status_encaminhamento NVARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    data_encaminhamento DATETIME2 NOT NULL DEFAULT GETDATE(),
    operador_encaminhamento_id BIGINT NOT NULL,
    data_agendamento DATETIME2,
    operador_agendamento_id BIGINT,
    agendamento_gerado_id BIGINT,
    data_atendimento DATETIME2,
    observacoes_retorno NVARCHAR(1000),
    prazo_dias INT,
    urgente BIT NOT NULL DEFAULT 0,

    -- Constraints
    CONSTRAINT FK_ambulatorio_encaminhamentos_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT FK_ambulatorio_encaminhamentos_operador FOREIGN KEY (operador_encaminhamento_id) REFERENCES operadores(id),
    CONSTRAINT FK_ambulatorio_encaminhamentos_operador_agendamento FOREIGN KEY (operador_agendamento_id) REFERENCES operadores(id),

    -- Checks
    CONSTRAINT CHK_ambulatorio_encaminhamentos_tipo
        CHECK (tipo_encaminhamento IN ('CONSULTA_ESPECIALIZADA', 'SEGUNDA_OPINIAO', 'AVALIACAO_ESPECIFICA', 'PROCEDIMENTO', 'CIRURGIA', 'EMERGENCIA', 'INTERNACAO')),
    CONSTRAINT CHK_ambulatorio_encaminhamentos_prioridade
        CHECK (prioridade IN ('BAIXA', 'NORMAL', 'ALTA', 'URGENTE', 'EMERGENCIA')),
    CONSTRAINT CHK_ambulatorio_encaminhamentos_status
        CHECK (status_encaminhamento IN ('PENDENTE', 'AGENDADO', 'CONFIRMADO', 'ATENDIDO', 'CANCELADO', 'REJEITADO', 'VENCIDO'))
);

-- Índices para encaminhamentos
CREATE INDEX IDX_ambulatorio_encaminhamentos_paciente ON ambulatorio_encaminhamentos_internos(paciente_id);
CREATE INDEX IDX_ambulatorio_encaminhamentos_origem ON ambulatorio_encaminhamentos_internos(profissional_origem_id, especialidade_origem_id);
CREATE INDEX IDX_ambulatorio_encaminhamentos_destino ON ambulatorio_encaminhamentos_internos(especialidade_destino_id);
CREATE INDEX IDX_ambulatorio_encaminhamentos_status ON ambulatorio_encaminhamentos_internos(status_encaminhamento);
CREATE INDEX IDX_ambulatorio_encaminhamentos_urgente ON ambulatorio_encaminhamentos_internos(urgente, status_encaminhamento);

-- ============================================================
-- Tabela de Configurações do Ambulatório
-- ============================================================
CREATE TABLE ambulatorio_configuracoes (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    unidade_id BIGINT,
    especialidade_id BIGINT,
    chave_configuracao NVARCHAR(100) NOT NULL,
    valor_configuracao NVARCHAR(1000),
    tipo_configuracao NVARCHAR(20),
    descricao NVARCHAR(500),
    ativa BIT NOT NULL DEFAULT 1,
    obrigatoria BIT NOT NULL DEFAULT 0,
    data_criacao DATETIME2 NOT NULL DEFAULT GETDATE(),
    operador_criacao_id BIGINT NOT NULL,
    data_ultima_alteracao DATETIME2,
    operador_alteracao_id BIGINT,

    -- Constraints
    CONSTRAINT FK_ambulatorio_config_operador_criacao FOREIGN KEY (operador_criacao_id) REFERENCES operadores(id),
    CONSTRAINT FK_ambulatorio_config_operador_alteracao FOREIGN KEY (operador_alteracao_id) REFERENCES operadores(id),

    -- Checks
    CONSTRAINT CHK_ambulatorio_config_tipo
        CHECK (tipo_configuracao IN ('TEXTO', 'NUMERO', 'BOOLEAN', 'TEMPO', 'DATA', 'JSON', 'LISTA')),

    -- Único por chave, unidade e especialidade
    CONSTRAINT UQ_ambulatorio_config_chave_unidade_esp
        UNIQUE (chave_configuracao, unidade_id, especialidade_id)
);

-- Índices para configurações
CREATE INDEX IDX_ambulatorio_config_chave ON ambulatorio_configuracoes(chave_configuracao);
CREATE INDEX IDX_ambulatorio_config_unidade ON ambulatorio_configuracoes(unidade_id);
CREATE INDEX IDX_ambulatorio_config_especialidade ON ambulatorio_configuracoes(especialidade_id);
CREATE INDEX IDX_ambulatorio_config_ativa ON ambulatorio_configuracoes(ativa);

-- ============================================================
-- Inserir configurações padrão do ambulatório
-- ============================================================
INSERT INTO ambulatorio_configuracoes (
    chave_configuracao,
    valor_configuracao,
    tipo_configuracao,
    descricao,
    ativa,
    obrigatoria,
    operador_criacao_id
) VALUES
('HORARIO_FUNCIONAMENTO_INICIO', '07:00', 'TEMPO', 'Horário de início do funcionamento do ambulatório', 1, 1, 1),
('HORARIO_FUNCIONAMENTO_FIM', '17:00', 'TEMPO', 'Horário de fim do funcionamento do ambulatório', 1, 1, 1),
('INTERVALO_PADRAO_CONSULTA', '30', 'NUMERO', 'Intervalo padrão entre consultas (minutos)', 1, 1, 1),
('MAXIMO_AGENDAMENTOS_DIA', '50', 'NUMERO', 'Número máximo de agendamentos por dia', 1, 0, 1),
('PERMITE_AGENDAMENTO_MESMO_DIA', 'false', 'BOOLEAN', 'Permite agendamento para o mesmo dia', 1, 0, 1),
('DIAS_ANTECEDENCIA_AGENDAMENTO', '60', 'NUMERO', 'Dias de antecedência máxima para agendamento', 1, 0, 1),
('PERMITE_ENCAIXE', 'true', 'BOOLEAN', 'Permite encaixe de pacientes', 1, 0, 1),
('MAXIMO_ENCAIXES_DIA', '5', 'NUMERO', 'Número máximo de encaixes por dia', 1, 0, 1),
('TEMPO_TOLERANCIA_ATRASO', '15', 'NUMERO', 'Tempo de tolerância para atraso (minutos)', 1, 0, 1),
('PERMITE_REAGENDAMENTO', 'true', 'BOOLEAN', 'Permite reagendamento de consultas', 1, 0, 1),
('NOTIFICACAO_CONFIRMACAO_ATIVA', 'true', 'BOOLEAN', 'Ativa notificações de confirmação', 1, 0, 1),
('DIAS_CONFIRMACAO_ANTECIPADA', '1', 'NUMERO', 'Dias de antecedência para confirmação', 1, 0, 1),
('PERMITE_RETORNO_AUTOMATICO', 'true', 'BOOLEAN', 'Permite retorno automático', 1, 0, 1),
('DIAS_PADRAO_RETORNO', '30', 'NUMERO', 'Dias padrão para retorno', 1, 0, 1);

-- ============================================================
-- Comentários das tabelas
-- ============================================================
EXEC sp_addextendedproperty
    'MS_Description', 'Tabela de agendamentos do Ambulatório Hospitalar',
    'SCHEMA', 'dbo', 'TABLE', 'ambulatorio_agendamentos';

EXEC sp_addextendedproperty
    'MS_Description', 'Tabela de escalas médicas para controle de agendamentos',
    'SCHEMA', 'dbo', 'TABLE', 'ambulatorio_escalas_medicas';

EXEC sp_addextendedproperty
    'MS_Description', 'Tabela de controle de presença dos profissionais',
    'SCHEMA', 'dbo', 'TABLE', 'ambulatorio_presenca_profissionais';

EXEC sp_addextendedproperty
    'MS_Description', 'Tabela de encaminhamentos internos entre especialidades',
    'SCHEMA', 'dbo', 'TABLE', 'ambulatorio_encaminhamentos_internos';

EXEC sp_addextendedproperty
    'MS_Description', 'Tabela de configurações específicas do ambulatório',
    'SCHEMA', 'dbo', 'TABLE', 'ambulatorio_configuracoes';