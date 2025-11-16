-- ================================================================
-- BASELINE CONSOLIDADA DO SISTEMA DE SAÚDE
-- Data: 2025-11-15
-- Versão: V999999999999
-- Descrição: Migration consolidada com schema completo do sistema
--
-- ATENÇÃO: Esta é uma migration baseline que consolida TODAS
-- as migrations anteriores em um único arquivo para facilitar
-- deploy em novos ambientes (VPS, homologação, etc)
--
-- Para ambiente de desenvolvimento com banco já migrado:
-- Esta migration será marcada como aplicada automaticamente
-- ================================================================

-- ===============================
-- MÓDULO: CORE - Estrutura Base
-- ===============================

-- Unidades de Saúde
CREATE TABLE IF NOT EXISTS unidades_saude (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    codigo_cnes VARCHAR(7) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL DEFAULT 'UBS',
    endereco VARCHAR(500),
    cep VARCHAR(8),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    telefone VARCHAR(20),
    email VARCHAR(100),
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    horario_funcionamento VARCHAR(200),
    gestor_responsavel VARCHAR(100),
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50)
);

-- Operadores do Sistema
CREATE TABLE IF NOT EXISTS operador (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(100),
    cpf VARCHAR(20),
    email VARCHAR(100),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    template_id VARCHAR(100),
    unidade_saude_id BIGINT,
    unidade_id BIGINT,
    unidade_atual_id BIGINT,
    is_master BOOLEAN NOT NULL DEFAULT FALSE,
    ultimo_login TIMESTAMP,
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50),
    CONSTRAINT fk_operador_unidade_saude FOREIGN KEY (unidade_saude_id) REFERENCES unidades_saude (id),
    CONSTRAINT fk_operador_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude (id),
    CONSTRAINT fk_operador_unidade_atual FOREIGN KEY (unidade_atual_id) REFERENCES unidades_saude (id)
);

-- Perfis do Sistema
CREATE TABLE IF NOT EXISTS perfis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    sistema_perfil BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    tipo VARCHAR(50),
    nome_customizado VARCHAR(100),
    nivel_customizado INTEGER,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50)
);

-- Perfis dos Operadores (many-to-many)
CREATE TABLE IF NOT EXISTS operador_perfis (
    operador_id BIGINT NOT NULL,
    perfil VARCHAR(50) NOT NULL,
    perfil_id BIGINT,
    PRIMARY KEY (operador_id, perfil),
    CONSTRAINT fk_operador_perfis_operador FOREIGN KEY (operador_id) REFERENCES operador (id) ON DELETE CASCADE,
    CONSTRAINT fk_operador_perfis_perfil FOREIGN KEY (perfil_id) REFERENCES perfis (id) ON DELETE CASCADE
);

-- Permissões dos Perfis
CREATE TABLE IF NOT EXISTS perfil_permissoes (
    perfil_id BIGINT NOT NULL,
    permissao VARCHAR(255) NOT NULL,
    PRIMARY KEY (perfil_id, permissao),
    CONSTRAINT fk_perfil_permissoes_perfil FOREIGN KEY (perfil_id) REFERENCES perfis (id) ON DELETE CASCADE
);

-- Perfil Acesso Permissões
CREATE TABLE IF NOT EXISTS perfil_acesso_permissoes (
    perfil_id BIGINT NOT NULL,
    permissao VARCHAR(255) NOT NULL,
    PRIMARY KEY (perfil_id, permissao),
    CONSTRAINT fk_perfil_acesso_permissoes_perfil FOREIGN KEY (perfil_id) REFERENCES perfis (id) ON DELETE CASCADE
);

-- Perfil Acesso Módulos
CREATE TABLE IF NOT EXISTS perfil_acesso_modulos (
    perfil_id BIGINT NOT NULL,
    modulo VARCHAR(100) NOT NULL,
    PRIMARY KEY (perfil_id, modulo),
    CONSTRAINT fk_perfil_acesso_modulos_perfil FOREIGN KEY (perfil_id) REFERENCES perfis (id) ON DELETE CASCADE
);

-- Operador-Unidade (many-to-many)
CREATE TABLE IF NOT EXISTS operador_unidade (
    operador_id BIGINT NOT NULL,
    unidade_id BIGINT NOT NULL,
    PRIMARY KEY (operador_id, unidade_id),
    CONSTRAINT fk_operador_unidade_operador FOREIGN KEY (operador_id) REFERENCES operador(id),
    CONSTRAINT fk_operador_unidade_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

-- Restrições JSON do Operador
CREATE TABLE IF NOT EXISTS operador_restricoes_json (
    operador_id BIGINT PRIMARY KEY,
    restricoes_json TEXT,
    CONSTRAINT fk_operador_restricoes FOREIGN KEY (operador_id) REFERENCES operador(id) ON DELETE CASCADE
);

-- Operador Módulo Unidade
CREATE TABLE IF NOT EXISTS operador_modulo_unidade (
    id BIGSERIAL PRIMARY KEY,
    operador_id BIGINT NOT NULL,
    modulo VARCHAR(100) NOT NULL,
    unidade_id BIGINT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_operador_modulo FOREIGN KEY (operador_id) REFERENCES operador(id),
    CONSTRAINT fk_unidade_modulo FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id),
    CONSTRAINT uk_operador_modulo_unidade UNIQUE (operador_id, modulo, unidade_id)
);

-- Configurações do Sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    id SERIAL PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descricao TEXT,
    grupo VARCHAR(100),
    tipo VARCHAR(50),
    editavel BOOLEAN DEFAULT TRUE,
    valores_possiveis TEXT,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50)
);

-- Audit/Log de Eventos
CREATE TABLE IF NOT EXISTS audit_evento (
    id BIGSERIAL PRIMARY KEY,
    operador_id BIGINT,
    data_evento TIMESTAMP NOT NULL DEFAULT NOW(),
    tipo_evento VARCHAR(50) NOT NULL,
    entidade VARCHAR(100),
    entidade_id BIGINT,
    acao VARCHAR(50),
    detalhes TEXT,
    ip_origem VARCHAR(50),
    CONSTRAINT fk_audit_operador FOREIGN KEY (operador_id) REFERENCES operador(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_evento_data ON audit_evento(data_evento);
CREATE INDEX IF NOT EXISTS idx_audit_evento_oper ON audit_evento(operador_id);

-- ===============================
-- MÓDULO: PACIENTES E ATENDIMENTO
-- ===============================

-- Pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    cpf VARCHAR(20),
    rg VARCHAR(20),
    cns VARCHAR(20),
    sexo VARCHAR(10),
    endereco TEXT,
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(100),
    nome_mae VARCHAR(255),
    nome_pai VARCHAR(255),
    alergias TEXT,
    data_cadastro TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50)
);

-- Profissionais
CREATE TABLE IF NOT EXISTS profissionais (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    data_nascimento DATE,
    telefone VARCHAR(20),
    email VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP
);

-- Profissional - Registros Conselho
CREATE TABLE IF NOT EXISTS profissional_registros_conselho (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT NOT NULL,
    conselho VARCHAR(50) NOT NULL,
    numero VARCHAR(50) NOT NULL,
    uf VARCHAR(2),
    data_registro DATE,
    ativo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_prof_registro_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id)
);

-- Profissional - Especialidades
CREATE TABLE IF NOT EXISTS profissional_especialidades (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT NOT NULL,
    cbo VARCHAR(10),
    especialidade VARCHAR(255),
    principal BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_prof_especialidade_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id)
);

-- Profissional - Vínculos Unidade
CREATE TABLE IF NOT EXISTS profissional_vinculos_unidade (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT NOT NULL,
    unidade_id BIGINT NOT NULL,
    data_inicio DATE,
    data_fim DATE,
    carga_horaria INTEGER,
    ativo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_prof_vinculo_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id),
    CONSTRAINT fk_prof_vinculo_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

-- Atendimentos
CREATE TABLE IF NOT EXISTS atendimentos (
    id SERIAL PRIMARY KEY,
    paciente_id BIGINT,
    profissional_id BIGINT,
    unidade_id BIGINT,
    data_atendimento TIMESTAMP,
    tipo_atendimento VARCHAR(50),
    observacoes TEXT,
    diagnostico TEXT,
    ciap_rfe VARCHAR(10),
    medicamentos_prescritos TEXT,
    orientacoes TEXT,
    observacoes_internas TEXT,
    status VARCHAR(30),
    data_criacao TIMESTAMP DEFAULT NOW(),
    criado_por VARCHAR(50),
    CONSTRAINT fk_atendimento_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_atendimento_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id),
    CONSTRAINT fk_atendimento_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

-- Atendimento CIAP Diagnósticos
CREATE TABLE IF NOT EXISTS atendimento_ciap_diag (
    atendimento_id BIGINT NOT NULL,
    ciap VARCHAR(10) NOT NULL,
    PRIMARY KEY (atendimento_id, ciap),
    CONSTRAINT fk_atend_ciap_diag FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id)
);

-- Atendimento CIAP Procedimentos
CREATE TABLE IF NOT EXISTS atendimento_ciap_proc (
    atendimento_id BIGINT NOT NULL,
    ciap VARCHAR(10) NOT NULL,
    PRIMARY KEY (atendimento_id, ciap),
    CONSTRAINT fk_atend_ciap_proc FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id)
);

-- Triagens
CREATE TABLE IF NOT EXISTS triagens (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT,
    profissional_id BIGINT,
    unidade_id BIGINT,
    data_triagem TIMESTAMP,
    queixa_principal TEXT,
    pressao_arterial VARCHAR(20),
    temperatura DECIMAL(4,2),
    peso DECIMAL(5,2),
    altura DECIMAL(5,2),
    frequencia_cardiaca INTEGER,
    frequencia_respiratoria INTEGER,
    saturacao_oxigenio DECIMAL(5,2),
    escala_dor INTEGER,
    classificacao_risco VARCHAR(20),
    classificacao_original VARCHAR(20),
    conduta_sugerida TEXT,
    diagnosticos_sugeridos TEXT,
    observacoes TEXT,
    alergias TEXT,
    protocolo_aplicado VARCHAR(50),
    motivo_consulta TEXT,
    dum_informada DATE,
    gestante_informado BOOLEAN,
    semanas_gestacao_informadas INTEGER,
    is_upa_triagem BOOLEAN DEFAULT FALSE,
    cancelada BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    data_referencia_atendimento TIMESTAMP,
    CONSTRAINT fk_triagem_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_triagem_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id),
    CONSTRAINT fk_triagem_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

CREATE INDEX IF NOT EXISTS idx_triagens_paciente_id ON triagens(paciente_id);
CREATE INDEX IF NOT EXISTS idx_triagens_profissional_id ON triagens(profissional_id);
CREATE INDEX IF NOT EXISTS idx_triagens_data_triagem ON triagens(data_triagem);
CREATE INDEX IF NOT EXISTS idx_triagens_classificacao_risco ON triagens(classificacao_risco);

-- Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT,
    profissional_id BIGINT,
    unidade_id BIGINT,
    data_agendamento TIMESTAMP,
    tipo_agendamento VARCHAR(50),
    status VARCHAR(30),
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT NOW(),
    criado_por VARCHAR(50),
    CONSTRAINT fk_agendamento_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_agendamento_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id),
    CONSTRAINT fk_agendamento_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

-- ===============================
-- MÓDULO: DOCUMENTOS E BIOMETRIA
-- ===============================

-- Documentos
CREATE TABLE IF NOT EXISTS documentos (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(50),
    descricao TEXT,
    arquivo BYTEA,
    data_criacao TIMESTAMP DEFAULT NOW(),
    criado_por VARCHAR(50)
);

-- Biometrias
CREATE TABLE IF NOT EXISTS biometrias (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT,
    template TEXT,
    data_cadastro TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_biometria_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);

-- Logs do Sistema
CREATE TABLE IF NOT EXISTS logs_sistema (
    id BIGSERIAL PRIMARY KEY,
    nivel VARCHAR(20),
    mensagem TEXT,
    detalhes TEXT,
    data_log TIMESTAMP DEFAULT NOW(),
    usuario VARCHAR(100)
);

-- Prontuário Documentos
CREATE TABLE IF NOT EXISTS prontuario_documentos (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    titulo VARCHAR(255),
    descricao TEXT,
    arquivo_nome VARCHAR(255),
    arquivo_tipo VARCHAR(100),
    arquivo_tamanho BIGINT,
    arquivo_dados BYTEA,
    data_documento DATE,
    profissional_id BIGINT,
    atendimento_id BIGINT,
    data_criacao TIMESTAMP DEFAULT NOW(),
    criado_por VARCHAR(100),
    CONSTRAINT fk_pront_doc_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_pront_doc_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id),
    CONSTRAINT fk_pront_doc_atendimento FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id)
);

CREATE INDEX IF NOT EXISTS idx_pront_doc_paciente ON prontuario_documentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pront_doc_tipo ON prontuario_documentos(tipo_documento);

-- ===============================
-- MÓDULO: SADT E PROCEDIMENTOS
-- ===============================

-- SADT (Serviços Auxiliares de Diagnóstico e Terapia)
CREATE TABLE IF NOT EXISTS sadt (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT,
    profissional_solicitante_id BIGINT,
    unidade_id BIGINT,
    agendamento_id BIGINT,
    data_solicitacao TIMESTAMP,
    data_realizacao TIMESTAMP,
    tipo_sadt VARCHAR(50),
    status VARCHAR(30),
    observacoes TEXT,
    resultado TEXT,
    pdf_base64 TEXT,
    data_criacao TIMESTAMP DEFAULT NOW(),
    criado_por VARCHAR(50),
    CONSTRAINT fk_sadt_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_sadt_profissional FOREIGN KEY (profissional_solicitante_id) REFERENCES profissionais(id),
    CONSTRAINT fk_sadt_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

-- Procedimentos SADT
CREATE TABLE IF NOT EXISTS procedimento_sadt (
    id BIGSERIAL PRIMARY KEY,
    sadt_id BIGINT,
    codigo_procedimento VARCHAR(20),
    nome_procedimento VARCHAR(255),
    quantidade INTEGER DEFAULT 1,
    valor DECIMAL(10,2),
    data_realizacao TIMESTAMP,
    profissional_executor_id BIGINT,
    observacoes TEXT,
    CONSTRAINT fk_proc_sadt FOREIGN KEY (sadt_id) REFERENCES sadt(id),
    CONSTRAINT fk_proc_sadt_profissional FOREIGN KEY (profissional_executor_id) REFERENCES profissionais(id)
);

-- ===============================
-- MÓDULO: UPA
-- ===============================

-- UPA Configuração
CREATE TABLE IF NOT EXISTS upa_config (
    id BIGSERIAL PRIMARY KEY,
    unidade_id BIGINT,
    classificacao_risco_obrigatoria BOOLEAN DEFAULT TRUE,
    tempo_reclassificacao_minutos INTEGER DEFAULT 120,
    CONSTRAINT fk_upa_config_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

-- UPA
CREATE TABLE IF NOT EXISTS upa (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255),
    codigo_cnes VARCHAR(7),
    endereco TEXT,
    telefone VARCHAR(20),
    ativa BOOLEAN DEFAULT TRUE
);

-- UPA Triagem
CREATE TABLE IF NOT EXISTS upa_triagem (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT,
    data_triagem TIMESTAMP,
    classificacao_risco VARCHAR(20),
    CONSTRAINT fk_upa_triagem_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);

-- UPA Atendimentos
CREATE TABLE IF NOT EXISTS upa_atendimentos (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT,
    triagem_id BIGINT,
    data_atendimento TIMESTAMP,
    tipo_atendimento VARCHAR(50),
    status VARCHAR(30),
    CONSTRAINT fk_upa_atend_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_upa_atend_triagem FOREIGN KEY (triagem_id) REFERENCES upa_triagem(id)
);

-- ===============================
-- MÓDULO: ASSISTÊNCIA SOCIAL
-- ===============================

-- Unidades Assistenciais
CREATE TABLE IF NOT EXISTS unidades_assistenciais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(100),
    responsavel VARCHAR(100),
    tipo VARCHAR(50),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50)
);

-- Famílias
CREATE TABLE IF NOT EXISTS familias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20),
    data_cadastro TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50)
);

-- Serviços Socioassistenciais
CREATE TABLE IF NOT EXISTS servicos_socioassistenciais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50)
);

-- Grupos de Serviços Socioassistenciais
CREATE TABLE IF NOT EXISTS grupos_servicos_socioassistenciais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    servico_id BIGINT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50),
    CONSTRAINT fk_grupo_servico FOREIGN KEY (servico_id) REFERENCES servicos_socioassistenciais (id)
);

-- Programas Assistenciais
CREATE TABLE IF NOT EXISTS programas_assistenciais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50)
);

-- Motivos de Atendimento
CREATE TABLE IF NOT EXISTS motivos_atendimento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50)
);

-- Atendimentos Assistenciais
CREATE TABLE IF NOT EXISTS atendimentos_assistenciais (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    tipo_atendimento VARCHAR(255),
    unidade_id BIGINT NOT NULL,
    data_hora TIMESTAMP NOT NULL,
    familia_id BIGINT,
    servico_id BIGINT,
    grupo_id BIGINT,
    programa_id BIGINT,
    anotacoes TEXT,
    sigiloso BOOLEAN,
    status VARCHAR(50),
    data_cadastro TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    usuario_cadastro VARCHAR(255),
    usuario_atualizacao VARCHAR(255),
    CONSTRAINT fk_unidade_assistencial FOREIGN KEY (unidade_id) REFERENCES unidades_assistenciais(id),
    CONSTRAINT fk_familia FOREIGN KEY (familia_id) REFERENCES familias(id),
    CONSTRAINT fk_servico FOREIGN KEY (servico_id) REFERENCES servicos_socioassistenciais(id),
    CONSTRAINT fk_grupo FOREIGN KEY (grupo_id) REFERENCES grupos_servicos_socioassistenciais(id),
    CONSTRAINT fk_programa FOREIGN KEY (programa_id) REFERENCES programas_assistenciais(id)
);

-- Atendimentos Assistenciais - Pacientes
CREATE TABLE IF NOT EXISTS atendimentos_assistenciais_pacientes (
    atendimento_id BIGINT NOT NULL,
    paciente_id BIGINT NOT NULL,
    PRIMARY KEY (atendimento_id, paciente_id),
    CONSTRAINT fk_atendimento_paciente FOREIGN KEY (atendimento_id) REFERENCES atendimentos_assistenciais(id),
    CONSTRAINT fk_paciente_atendimento FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);

-- Atendimentos Assistenciais - Profissionais
CREATE TABLE IF NOT EXISTS atendimentos_assistenciais_profissionais (
    atendimento_id BIGINT NOT NULL,
    profissional_id BIGINT NOT NULL,
    PRIMARY KEY (atendimento_id, profissional_id),
    CONSTRAINT fk_atendimento_profissional FOREIGN KEY (atendimento_id) REFERENCES atendimentos_assistenciais(id),
    CONSTRAINT fk_profissional_atendimento FOREIGN KEY (profissional_id) REFERENCES operador(id)
);

-- Atendimentos Assistenciais - Motivos
CREATE TABLE IF NOT EXISTS atendimentos_assistenciais_motivos (
    atendimento_id BIGINT NOT NULL,
    motivo_id BIGINT NOT NULL,
    PRIMARY KEY (atendimento_id, motivo_id),
    CONSTRAINT fk_atendimento_motivo FOREIGN KEY (atendimento_id) REFERENCES atendimentos_assistenciais(id),
    CONSTRAINT fk_motivo_atendimento FOREIGN KEY (motivo_id) REFERENCES motivos_atendimento(id)
);

-- ================================================================
-- DADOS INICIAIS CRÍTICOS
-- ================================================================

-- Garantir que a tabela perfis tenha todas as colunas necessárias
DO $$
BEGIN
    -- Adicionar coluna 'ativo' se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfis' AND column_name = 'ativo'
    ) THEN
        ALTER TABLE perfis ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Adicionar coluna 'tipo' se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfis' AND column_name = 'tipo'
    ) THEN
        ALTER TABLE perfis ADD COLUMN tipo VARCHAR(50);
    ELSE
        -- Se já existir, aumentar tamanho se necessário
        ALTER TABLE perfis ALTER COLUMN tipo TYPE VARCHAR(50);
    END IF;
END $$;

-- Inserir unidade de saúde padrão
INSERT INTO unidades_saude (nome, codigo_cnes, tipo, ativa, data_criacao, criado_por)
SELECT 'Unidade de Saúde Padrão', '0000001', 'UBS', TRUE, NOW(), 'sistema'
WHERE NOT EXISTS (SELECT 1 FROM unidades_saude WHERE codigo_cnes = '0000001');

-- Inserir perfis padrão do sistema
INSERT INTO perfis (nome, descricao, sistema_perfil, ativo, data_criacao, criado_por)
SELECT 'ADMINISTRADOR_SISTEMA', 'Administrador do Sistema com acesso total', TRUE, TRUE, NOW(), 'sistema'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'ADMINISTRADOR_SISTEMA');

INSERT INTO perfis (nome, descricao, sistema_perfil, ativo, data_criacao, criado_por)
SELECT 'RECEPCIONISTA', 'Recepcionista com acesso à agenda e cadastro de pacientes', TRUE, TRUE, NOW(), 'sistema'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'RECEPCIONISTA');

INSERT INTO perfis (nome, descricao, sistema_perfil, ativo, data_criacao, criado_por)
SELECT 'MEDICO', 'Médico com acesso a prontuários e atendimentos', TRUE, TRUE, NOW(), 'sistema'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'MEDICO');

INSERT INTO perfis (nome, descricao, sistema_perfil, ativo, data_criacao, criado_por)
SELECT 'ENFERMEIRO', 'Enfermeiro com acesso a triagem e procedimentos', TRUE, TRUE, NOW(), 'sistema'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'ENFERMEIRO');

INSERT INTO perfis (nome, descricao, sistema_perfil, ativo, data_criacao, criado_por)
SELECT 'FARMACEUTICO', 'Farmacêutico com acesso à dispensação de medicamentos', TRUE, TRUE, NOW(), 'sistema'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'FARMACEUTICO');

INSERT INTO perfis (nome, descricao, sistema_perfil, ativo, data_criacao, criado_por)
SELECT 'DENTISTA', 'Dentista com acesso a prontuários odontológicos', TRUE, TRUE, NOW(), 'sistema'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'DENTISTA');

INSERT INTO perfis (nome, descricao, sistema_perfil, ativo, data_criacao, criado_por)
SELECT 'TECNICO_ENFERMAGEM', 'Técnico de Enfermagem com acesso limitado a procedimentos', TRUE, TRUE, NOW(), 'sistema'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'TECNICO_ENFERMAGEM');

INSERT INTO perfis (nome, descricao, sistema_perfil, ativo, data_criacao, criado_por)
SELECT 'GESTOR', 'Gestor com acesso a relatórios e indicadores', TRUE, TRUE, NOW(), 'sistema'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'GESTOR');

-- Inserir permissões para ADMINISTRADOR_SISTEMA
INSERT INTO perfil_permissoes (perfil_id, permissao)
SELECT p.id, 'ADMIN_SISTEMA'
FROM perfis p
WHERE p.nome = 'ADMINISTRADOR_SISTEMA'
AND NOT EXISTS (
    SELECT 1 FROM perfil_permissoes pp
    WHERE pp.perfil_id = p.id AND pp.permissao = 'ADMIN_SISTEMA'
);

-- Inserir operador master (senha: Admin@123)
INSERT INTO operador (
    login,
    senha,
    nome,
    cargo,
    cpf,
    ativo,
    is_master,
    data_criacao,
    criado_por
)
SELECT
    'admin.master',
    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
    'Administrador Master',
    'Administrador do Sistema',
    '00000000000',
    TRUE,
    TRUE,
    NOW(),
    'sistema'
WHERE NOT EXISTS (SELECT 1 FROM operador WHERE login = 'admin.master');

-- Inserir perfis para o operador master
INSERT INTO operador_perfis (operador_id, perfil)
SELECT o.id, 'ADMINISTRADOR_SISTEMA'
FROM operador o
WHERE o.login = 'admin.master'
  AND NOT EXISTS (
    SELECT 1 FROM operador_perfis op
    WHERE op.operador_id = o.id AND op.perfil = 'ADMINISTRADOR_SISTEMA'
);

-- Inserir unidade padrão para o operador master
INSERT INTO operador_unidade (operador_id, unidade_id)
SELECT o.id, u.id
FROM operador o
CROSS JOIN unidades_saude u
WHERE o.login = 'admin.master'
  AND u.codigo_cnes = '0000001'
  AND NOT EXISTS (
    SELECT 1 FROM operador_unidade ou
    WHERE ou.operador_id = o.id AND ou.unidade_id = u.id
);

-- ================================================================
-- FIM DA BASELINE
-- ================================================================

-- Comentários finais
COMMENT ON TABLE unidades_saude IS 'Unidades de saúde do sistema (UBS, UPA, Hospitais, etc)';
COMMENT ON TABLE operador IS 'Usuários do sistema com permissões';
COMMENT ON TABLE perfis IS 'Perfis de acesso do sistema';
COMMENT ON TABLE pacientes IS 'Cadastro de pacientes';
COMMENT ON TABLE atendimentos IS 'Registro de atendimentos médicos';
COMMENT ON TABLE triagens IS 'Registro de triagens/classificação de risco';
