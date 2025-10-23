-- =====================================================
-- MIGRATION COMPLETA - CRIAR TODAS AS TABELAS FALTANTES
-- Data: 04/10/2025 19:00
-- DescriÃ§Ã£o: Cria TODAS as tabelas necessÃ¡rias caso nÃ£o existam
-- EstratÃ©gia: CREATE TABLE IF NOT EXISTS para ser idempotente
-- =====================================================

-- =====================================================
-- MÃ“DULO: AGENDAMENTOS E RECEPÃ‡ÃƒO
-- =====================================================

CREATE TABLE IF NOT EXISTS agendamentos (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    profissional_id BIGINT,
    unidade_id BIGINT,
    data_agendamento DATE NOT NULL,
    hora_agendamento TIME NOT NULL,
    tipo_consulta VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'AGENDADO',
    motivo VARCHAR(500),
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT now(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100),
    CONSTRAINT fk_agendamento_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_agendamento_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- ConfiguraÃ§Ãµes de RecepÃ§Ã£o
CREATE TABLE IF NOT EXISTS configuracao_recepcao (
    id BIGSERIAL PRIMARY KEY,
    unidade_id BIGINT,
    chave VARCHAR(100) NOT NULL,
    valor TEXT,
    tipo VARCHAR(50),
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT now(),
    data_atualizacao TIMESTAMP,
    CONSTRAINT fk_config_recepcao_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

-- Status de Agendamento
CREATE TABLE IF NOT EXISTS status_agendamento (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(200) NOT NULL,
    cor VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,
    ordem INTEGER,
    data_criacao TIMESTAMP DEFAULT now()
);

-- Tipos de Consulta
CREATE TABLE IF NOT EXISTS tipo_consulta (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(200) NOT NULL,
    duracao_minutos INTEGER DEFAULT 30,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT now()
);

-- =====================================================
-- MÃ“DULO: CID (ClassificaÃ§Ã£o Internacional de DoenÃ§as)
-- =====================================================

CREATE TABLE IF NOT EXISTS cid (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    categoria VARCHAR(10),
    subcategoria VARCHAR(10),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cid_codigo ON cid(codigo);
CREATE INDEX IF NOT EXISTS idx_cid_descricao ON cid USING gin(to_tsvector('portuguese', descricao));

-- =====================================================
-- MÃ“DULO: PROFISSIONAIS
-- =====================================================

CREATE TABLE IF NOT EXISTS profissionais (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    data_nascimento DATE,
    sexo VARCHAR(20),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT now(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_profissionais_cpf ON profissionais(cpf);
CREATE INDEX IF NOT EXISTS idx_profissionais_nome ON profissionais(nome_completo);

-- EndereÃ§o do Profissional
CREATE TABLE IF NOT EXISTS endereco_profissional (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT NOT NULL,
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    tipo VARCHAR(50) DEFAULT 'RESIDENCIAL',
    principal BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_endereco_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE
);

-- Documentos do Profissional
CREATE TABLE IF NOT EXISTS documentos_profissional (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    numero_documento VARCHAR(100),
    orgao_emissor VARCHAR(100),
    data_emissao DATE,
    data_validade DATE,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_documentos_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE
);

-- Registro em Conselho Profissional
CREATE TABLE IF NOT EXISTS registro_conselho (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT NOT NULL,
    conselho VARCHAR(50) NOT NULL,
    numero_registro VARCHAR(50) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    data_inscricao DATE,
    data_validade DATE,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_registro_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
    CONSTRAINT uk_registro_conselho UNIQUE (conselho, numero_registro, uf)
);

-- Especialidades do Profissional
CREATE TABLE IF NOT EXISTS profissional_especialidade (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT NOT NULL,
    especialidade_id BIGINT NOT NULL,
    registro_especialidade VARCHAR(100),
    data_obtencao DATE,
    principal BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_prof_esp_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE
);

-- VÃ­nculo Profissional com Unidade
CREATE TABLE IF NOT EXISTS vinculo_profissional_unidade (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT NOT NULL,
    unidade_id BIGINT NOT NULL,
    cargo VARCHAR(100),
    carga_horaria_semanal INTEGER,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    tipo_vinculo VARCHAR(50),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_vinculo_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id),
    CONSTRAINT fk_vinculo_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

-- =====================================================
-- MÃ“DULO: ESPECIALIDADES
-- =====================================================

CREATE TABLE IF NOT EXISTS especialidades (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT now()
);

INSERT INTO especialidades (codigo, nome, ativo) VALUES
('CLINICA_GERAL', 'ClÃ­nica Geral', TRUE),
('PEDIATRIA', 'Pediatria', TRUE),
('GINECOLOGIA', 'Ginecologia e ObstetrÃ­cia', TRUE),
('CARDIOLOGIA', 'Cardiologia', TRUE),
('ORTOPEDIA', 'Ortopedia', TRUE),
('DERMATOLOGIA', 'Dermatologia', TRUE),
('OFTALMOLOGIA', 'Oftalmologia', TRUE),
('ODONTOLOGIA', 'Odontologia', TRUE),
('PSICOLOGIA', 'Psicologia', TRUE),
('ENFERMAGEM', 'Enfermagem', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- MÃ“DULO: PRONTUÃRIO E DOCUMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS prontuario_documento (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    atendimento_id BIGINT,
    tipo_documento VARCHAR(50) NOT NULL,
    titulo VARCHAR(255),
    conteudo TEXT,
    data_documento TIMESTAMP DEFAULT now(),
    profissional_id BIGINT,
    unidade_id BIGINT,
    assinado BOOLEAN DEFAULT FALSE,
    data_assinatura TIMESTAMP,
    hash_assinatura VARCHAR(500),
    data_criacao TIMESTAMP DEFAULT now(),
    data_atualizacao TIMESTAMP,
    CONSTRAINT fk_pront_doc_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_pront_doc_atendimento FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id),
    CONSTRAINT fk_pront_doc_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

CREATE INDEX IF NOT EXISTS idx_prontuario_doc_paciente ON prontuario_documento(paciente_id);
CREATE INDEX IF NOT EXISTS idx_prontuario_doc_tipo ON prontuario_documento(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_prontuario_doc_data ON prontuario_documento(data_documento);

-- =====================================================
-- MÃ“DULO: DOCUMENTOS GERAIS
-- =====================================================

CREATE TABLE IF NOT EXISTS documentos (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    conteudo BYTEA,
    mime_type VARCHAR(100),
    tamanho_bytes BIGINT,
    caminho_arquivo VARCHAR(500),
    hash_arquivo VARCHAR(500),
    paciente_id BIGINT,
    atendimento_id BIGINT,
    agendamento_id BIGINT,
    data_upload TIMESTAMP DEFAULT now(),
    uploaded_by VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_doc_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_doc_atendimento FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id),
    CONSTRAINT fk_doc_agendamento FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id)
);

CREATE INDEX IF NOT EXISTS idx_documentos_paciente ON documentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo);

-- =====================================================
-- INSERIR DADOS INICIAIS DE REFERÃŠNCIA
-- =====================================================

-- Status de Agendamento
INSERT INTO status_agendamento (codigo, descricao, cor, ordem) VALUES
('AGENDADO', 'Agendado', '#4CAF50', 1),
('CONFIRMADO', 'Confirmado', '#2196F3', 2),
('PRESENTE', 'Presente', '#9C27B0', 3),
('EM_ATENDIMENTO', 'Em Atendimento', '#FF9800', 4),
('ATENDIDO', 'Atendido', '#4CAF50', 5),
('FALTOU', 'Faltou', '#F44336', 6),
('CANCELADO', 'Cancelado', '#757575', 7),
('REAGENDADO', 'Reagendado', '#00BCD4', 8)
ON CONFLICT (codigo) DO NOTHING;

-- Tipos de Consulta
INSERT INTO tipo_consulta (codigo, descricao, duracao_minutos) VALUES
('PRIMEIRA_VEZ', 'Primeira Consulta', 30),
('RETORNO', 'Retorno', 20),
('URGENCIA', 'UrgÃªncia', 15),
('PROCEDIMENTO', 'Procedimento', 45),
('EXAME', 'Exame', 30)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- COMENTÃRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE agendamentos IS 'Agendamentos de consultas e procedimentos';
COMMENT ON TABLE profissionais IS 'Cadastro de profissionais de saÃºde';
COMMENT ON TABLE especialidades IS 'Especialidades mÃ©dicas e de saÃºde';
COMMENT ON TABLE prontuario_documento IS 'Documentos do prontuÃ¡rio eletrÃ´nico';
COMMENT ON TABLE status_agendamento IS 'Status possÃ­veis para agendamentos';
COMMENT ON TABLE tipo_consulta IS 'Tipos de consulta disponÃ­veis';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================




