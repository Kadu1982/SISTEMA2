-- Cria tabelas de agendamento de exames (entidade AgendamentoExame)

CREATE TABLE IF NOT EXISTS agendamentos_exames (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    protocolo VARCHAR(20) NOT NULL UNIQUE,
    data_agendamento TIMESTAMP NOT NULL,
    data_hora_exame TIMESTAMP NOT NULL,
    horario_exame_id BIGINT,
    profissional_id BIGINT,
    profissional_nome VARCHAR(100),
    sala_id BIGINT,
    sala_nome VARCHAR(50),
    unidade_id BIGINT NOT NULL,
    unidade_nome VARCHAR(100),
    status VARCHAR(40) NOT NULL DEFAULT 'AGENDADO',
    tipo_agendamento VARCHAR(30) NOT NULL DEFAULT 'INTERNO',
    origem_solicitacao VARCHAR(50),
    solicitante_id BIGINT,
    solicitante_nome VARCHAR(100),
    autorizacao_convenio VARCHAR(50),
    guia_convenio VARCHAR(50),
    observacoes TEXT,
    preparacao_paciente TEXT,
    contato_paciente VARCHAR(20),
    email_paciente VARCHAR(100),
    confirmado BOOLEAN DEFAULT FALSE,
    data_confirmacao TIMESTAMP,
    usuario_confirmacao VARCHAR(50),
    encaixe BOOLEAN DEFAULT FALSE,
    prioridade BOOLEAN DEFAULT FALSE,
    motivo_cancelamento TEXT,
    data_cancelamento TIMESTAMP,
    usuario_cancelamento VARCHAR(50),
    data_realizacao TIMESTAMP,
    usuario_realizacao VARCHAR(50),
    comprovante_pdf TEXT,
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    usuario_criacao VARCHAR(50),
    usuario_atualizacao VARCHAR(50),
    CONSTRAINT fk_agendamento_exame_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT fk_agendamento_exame_horario FOREIGN KEY (horario_exame_id) REFERENCES horarios_exames(id),
    CONSTRAINT fk_agendamento_exame_solicitante FOREIGN KEY (solicitante_id) REFERENCES profissionais(id)
);

CREATE INDEX IF NOT EXISTS idx_agendamento_exame_paciente ON agendamentos_exames(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamento_exame_unidade ON agendamentos_exames(unidade_id);
CREATE INDEX IF NOT EXISTS idx_agendamento_exame_status ON agendamentos_exames(status);
CREATE INDEX IF NOT EXISTS idx_agendamento_exame_data ON agendamentos_exames(data_hora_exame);

CREATE TABLE IF NOT EXISTS agendamento_exame_itens (
    id BIGSERIAL PRIMARY KEY,
    agendamento_exame_id BIGINT NOT NULL,
    exame_codigo VARCHAR(50),
    exame_nome VARCHAR(200),
    categoria VARCHAR(50),
    duracao_estimada INTEGER,
    requer_preparo BOOLEAN DEFAULT FALSE,
    descricao_preparo TEXT,
    observacoes_especificas TEXT,
    material_coleta VARCHAR(100),
    quantidade_material VARCHAR(50),
    CONSTRAINT fk_agendamento_item_agendamento FOREIGN KEY (agendamento_exame_id) REFERENCES agendamentos_exames(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agendamento_exame_itens_agendamento ON agendamento_exame_itens(agendamento_exame_id);
CREATE INDEX IF NOT EXISTS idx_agendamento_exame_itens_codigo ON agendamento_exame_itens(exame_codigo);
