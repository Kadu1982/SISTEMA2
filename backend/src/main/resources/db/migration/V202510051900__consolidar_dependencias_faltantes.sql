-- =====================================================
-- CONSOLIDAÇÃO DE DEPENDÊNCIAS FALTANTES
-- Data: 05/10/2025 19:00
-- Descrição: Garante que TODAS as tabelas necessárias existam
--            antes de outras migrations que dependem delas
-- Estratégia: CREATE TABLE IF NOT EXISTS (idempotente)
-- =====================================================

-- =====================================================
-- TABELAS FUNDAMENTAIS (devem existir primeiro)
-- =====================================================

-- Tabela de agendamentos (necessária para várias FKs)
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
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100),
    CONSTRAINT fk_agendamento_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_agendamento_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- Tabela de profissionais (necessária para várias FKs)
CREATE TABLE IF NOT EXISTS profissionais (
    id BIGSERIAL PRIMARY KEY,
    nome_completo VARCHAR(180) NOT NULL,
    tipo_cadastro VARCHAR(20),
    sexo VARCHAR(20),
    data_nascimento DATE,
    nome_mae VARCHAR(180),
    nome_pai VARCHAR(180),
    cns VARCHAR(20),
    nacionalidade VARCHAR(80),
    municipio_nascimento VARCHAR(120),
    data_chegada_pais DATE,
    naturalizado BOOLEAN,
    portaria_naturalizacao VARCHAR(60),
    raca_cor VARCHAR(20),
    etnia VARCHAR(80),
    permite_solicitar_insumos BOOLEAN,
    permite_solicitar_exames BOOLEAN,
    profissionalvisa BOOLEAN,
    telefone VARCHAR(30),
    email VARCHAR(120),
    data_atualizacao_cnes DATE,
    ativo BOOLEAN DEFAULT TRUE,

    -- Endereco (embeddable)
    logradouro VARCHAR(180),
    numero VARCHAR(20),
    complemento VARCHAR(60),
    bairro VARCHAR(120),
    municipio VARCHAR(120),
    uf VARCHAR(2),
    cep VARCHAR(12),

    -- Documentos (embeddable)
    cpf VARCHAR(14),
    rg_numero VARCHAR(30),
    rg_orgao_emissor VARCHAR(20),
    rg_uf VARCHAR(2),
    rg_data_emissao DATE,
    pis_pasep VARCHAR(20),
    ctps_numero VARCHAR(20),
    ctps_serie VARCHAR(20),
    ctps_uf VARCHAR(2),
    titulo_eleitor VARCHAR(20),

    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profissionais_nome ON profissionais (nome_completo);
CREATE INDEX IF NOT EXISTS idx_profissionais_cpf ON profissionais (cpf);
CREATE INDEX IF NOT EXISTS idx_profissionais_cns ON profissionais (cns);

-- Tabela de horários de exames (necessária para agendamentos_exames)
CREATE TABLE IF NOT EXISTS horarios_exames (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT,
    sala_id BIGINT,
    unidade_id BIGINT NOT NULL,
    exame_codigo VARCHAR(50),
    tipo_agendamento VARCHAR(20) DEFAULT 'AMBOS',
    dia_semana VARCHAR(20) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    intervalo_minutos INTEGER NOT NULL DEFAULT 30,
    vagas_por_horario INTEGER NOT NULL DEFAULT 1,
    permite_encaixe BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    observacoes TEXT,

    CONSTRAINT chk_hora_valida CHECK (hora_fim > hora_inicio),
    CONSTRAINT chk_intervalo_positivo CHECK (intervalo_minutos > 0),
    CONSTRAINT chk_vagas_positivas CHECK (vagas_por_horario > 0),
    CONSTRAINT chk_tipo_agendamento_hex CHECK (tipo_agendamento IN ('INTERNO', 'EXTERNO', 'AMBOS')),
    CONSTRAINT chk_dia_semana_hex CHECK (dia_semana IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'))
);

CREATE INDEX IF NOT EXISTS idx_horarios_exames_unidade ON horarios_exames(unidade_id);
CREATE INDEX IF NOT EXISTS idx_horarios_exames_profissional ON horarios_exames(profissional_id);
CREATE INDEX IF NOT EXISTS idx_horarios_exames_dia_semana ON horarios_exames(dia_semana);

-- =====================================================
-- TABELAS DE CLASSIFICAÇÃO DE RISCO
-- =====================================================

-- Garantir que classificacao_risco existe (necessária para várias migrations de ALTER)
-- NOTA: A tabela já é criada pela V20250923_1500, esta é apenas garantia adicional
CREATE TABLE IF NOT EXISTS classificacao_risco (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    atendimento_id BIGINT,
    protocolo_utilizado VARCHAR(20),
    queixa_principal VARCHAR(500),
    observacoes_abordagem VARCHAR(1000),
    medicamentos_uso VARCHAR(1000),
    alergias VARCHAR(500),
    reacoes_alergicas VARCHAR(500),
    sinais_vitais TEXT,
    sintoma_principal VARCHAR(200),
    avaliacao_glasgow INTEGER,
    escala_dor INTEGER,
    cor_prioridade VARCHAR(20),
    tempo_max_espera INTEGER,
    especialidade_sugerida VARCHAR(100),
    risco_sepse BOOLEAN DEFAULT FALSE,
    data_classificacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operador_id BIGINT,
    reavaliacao BOOLEAN DEFAULT FALSE,
    classificacao_anterior_id BIGINT,
    encaminhamento_social BOOLEAN DEFAULT FALSE,
    observacoes_gerais VARCHAR(1000)
);

CREATE INDEX IF NOT EXISTS idx_classificacao_risco_paciente ON classificacao_risco(paciente_id);
CREATE INDEX IF NOT EXISTS idx_classificacao_risco_atendimento ON classificacao_risco(atendimento_id);
CREATE INDEX IF NOT EXISTS idx_classificacao_risco_cor ON classificacao_risco(cor_prioridade);
CREATE INDEX IF NOT EXISTS idx_classificacao_risco_data ON classificacao_risco(data_classificacao);

-- =====================================================
-- TABELAS DE CID
-- =====================================================

CREATE TABLE IF NOT EXISTS cid (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    categoria VARCHAR(10),
    subcategoria VARCHAR(10),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cid_codigo ON cid(codigo);
CREATE INDEX IF NOT EXISTS idx_cid_descricao ON cid USING gin(to_tsvector('portuguese', descricao));

-- =====================================================
-- TABELAS AUXILIARES DE PROFISSIONAIS
-- =====================================================

CREATE TABLE IF NOT EXISTS profissional_registros_conselho (
    id BIGSERIAL PRIMARY KEY,
    conselho VARCHAR(20) NOT NULL,
    numero_registro VARCHAR(50) NOT NULL,
    uf VARCHAR(2),
    profissional_id BIGINT NOT NULL,
    CONSTRAINT fk_reg_conselho_prof FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profissional_especialidades (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30),
    nome VARCHAR(180),
    padrao BOOLEAN,
    profissional_id BIGINT NOT NULL,
    CONSTRAINT fk_prof_esp_prof FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profissional_vinculos_unidade (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT NOT NULL,
    unidade_id BIGINT NOT NULL,
    setor VARCHAR(120),
    cargo VARCHAR(120),
    funcao VARCHAR(120),
    empregador_cnpj VARCHAR(18),
    telefone_comercial VARCHAR(30),
    ramal VARCHAR(10),
    turno VARCHAR(40),
    ativo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_vinculo_prof FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
    CONSTRAINT fk_vinculo_unid FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

-- =====================================================
-- TABELAS DE ESPECIALIDADES
-- =====================================================

CREATE TABLE IF NOT EXISTS especialidades (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT NOW()
);

-- Inserir especialidades básicas se não existirem
INSERT INTO especialidades (codigo, nome, ativo) VALUES
('CLINICA_GERAL', 'Clínica Geral', TRUE),
('PEDIATRIA', 'Pediatria', TRUE),
('GINECOLOGIA', 'Ginecologia e Obstetrícia', TRUE),
('CARDIOLOGIA', 'Cardiologia', TRUE),
('ORTOPEDIA', 'Ortopedia', TRUE),
('DERMATOLOGIA', 'Dermatologia', TRUE),
('OFTALMOLOGIA', 'Oftalmologia', TRUE),
('ODONTOLOGIA', 'Odontologia', TRUE),
('PSICOLOGIA', 'Psicologia', TRUE),
('ENFERMAGEM', 'Enfermagem', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- TABELAS DE PRONTUÁRIO
-- =====================================================

CREATE TABLE IF NOT EXISTS prontuario_documento (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    atendimento_id BIGINT,
    tipo_documento VARCHAR(50) NOT NULL,
    titulo VARCHAR(255),
    conteudo TEXT,
    data_documento TIMESTAMP DEFAULT NOW(),
    profissional_id BIGINT,
    unidade_id BIGINT,
    assinado BOOLEAN DEFAULT FALSE,
    data_assinatura TIMESTAMP,
    hash_assinatura VARCHAR(500),
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    CONSTRAINT fk_pront_doc_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_pront_doc_atendimento FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id),
    CONSTRAINT fk_pront_doc_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

CREATE INDEX IF NOT EXISTS idx_prontuario_doc_paciente ON prontuario_documento(paciente_id);
CREATE INDEX IF NOT EXISTS idx_prontuario_doc_tipo ON prontuario_documento(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_prontuario_doc_data ON prontuario_documento(data_documento);

-- =====================================================
-- TABELAS DE STATUS E TIPOS
-- =====================================================

CREATE TABLE IF NOT EXISTS status_agendamento (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(200) NOT NULL,
    cor VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,
    ordem INTEGER,
    data_criacao TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS tipo_consulta (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(200) NOT NULL,
    duracao_minutos INTEGER DEFAULT 30,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT NOW()
);

INSERT INTO tipo_consulta (codigo, descricao, duracao_minutos) VALUES
('PRIMEIRA_VEZ', 'Primeira Consulta', 30),
('RETORNO', 'Retorno', 20),
('URGENCIA', 'Urgência', 15),
('PROCEDIMENTO', 'Procedimento', 45),
('EXAME', 'Exame', 30)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- CORREÇÃO DE FOREIGN KEYS PENDENTES (lab_* → profissionais)
-- =====================================================

DO $$
BEGIN
    -- lab_mapa_profissional.profissional_id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lab_mapa_profissional') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_lab_mapa_profissional_profissional'
        ) THEN
            EXECUTE 'ALTER TABLE lab_mapa_profissional
                     ADD CONSTRAINT fk_lab_mapa_profissional_profissional
                     FOREIGN KEY (profissional_id) REFERENCES profissionais(id)';
        END IF;
    END IF;

    -- lab_recepcao_exame.profissional_solicitante_id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lab_recepcao_exame') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_lab_recepcao_exame_prof_solic'
        ) THEN
            EXECUTE 'ALTER TABLE lab_recepcao_exame
                     ADD CONSTRAINT fk_lab_recepcao_exame_prof_solic
                     FOREIGN KEY (profissional_solicitante_id) REFERENCES profissionais(id)';
        END IF;
    END IF;

    -- lab_resultado_exame.profissional_assinatura_id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lab_resultado_exame') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_lab_resultado_prof_assinatura'
        ) THEN
            EXECUTE 'ALTER TABLE lab_resultado_exame
                     ADD CONSTRAINT fk_lab_resultado_prof_assinatura
                     FOREIGN KEY (profissional_assinatura_id) REFERENCES profissionais(id)';
        END IF;
    END IF;
END $$;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE agendamentos IS 'Agendamentos de consultas e procedimentos';
COMMENT ON TABLE profissionais IS 'Cadastro de profissionais de saúde';
COMMENT ON TABLE especialidades IS 'Especialidades médicas e de saúde';
COMMENT ON TABLE prontuario_documento IS 'Documentos do prontuário eletrônico';
COMMENT ON TABLE classificacao_risco IS 'Classificação de risco dos pacientes (Manchester/HumanizaSUS)';
COMMENT ON TABLE horarios_exames IS 'Horários disponíveis para agendamento de exames';
COMMENT ON TABLE status_agendamento IS 'Status possíveis para agendamentos';
COMMENT ON TABLE tipo_consulta IS 'Tipos de consulta disponíveis';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
