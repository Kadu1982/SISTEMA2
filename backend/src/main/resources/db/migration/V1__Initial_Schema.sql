-- Initial Schema Migration
-- Schema corrigido para compatibilidade total com as entidades

-- ===============================
-- UNIDADES DE SAÚDE
-- ===============================
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

-- ===============================
-- OPERADORES
-- ===============================
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

-- ===============================
-- PERFIS DO OPERADOR
-- ===============================
CREATE TABLE IF NOT EXISTS operador_perfis (
                                               operador_id BIGINT NOT NULL,
                                               perfil VARCHAR(50) NOT NULL,
    PRIMARY KEY (operador_id, perfil),
    CONSTRAINT fk_operador_perfis_operador FOREIGN KEY (operador_id) REFERENCES operador (id) ON DELETE CASCADE
    );

-- ===============================
-- PERFIS DO SISTEMA
-- ===============================
CREATE TABLE IF NOT EXISTS perfis (
                                      id SERIAL PRIMARY KEY,
                                      nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    sistema_perfil BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50)
    );

-- ===============================
-- PERMISSÕES DOS PERFIS
-- ===============================
CREATE TABLE IF NOT EXISTS perfil_permissoes (
                                                 perfil_id BIGINT NOT NULL,
                                                 permissao VARCHAR(255) NOT NULL,
    PRIMARY KEY (perfil_id, permissao),
    CONSTRAINT fk_perfil_permissoes_perfil FOREIGN KEY (perfil_id) REFERENCES perfis (id) ON DELETE CASCADE
    );

-- ===============================
-- DADOS INICIAIS
-- ===============================

-- Inserir unidade de saúde padrão
INSERT INTO unidades_saude (nome, codigo_cnes, tipo, ativa, data_criacao, criado_por)
VALUES ('Unidade de Saúde Padrão', '0000001', 'UBS', TRUE, NOW(), 'sistema')
    ON CONFLICT (codigo_cnes) DO NOTHING;

-- Inserir perfis padrão
INSERT INTO perfis (nome, descricao, sistema_perfil, data_criacao, criado_por)
VALUES
    ('ADMINISTRADOR_SISTEMA', 'Administrador do Sistema com acesso total', TRUE, NOW(), 'sistema'),
    ('RECEPCIONISTA', 'Recepcionista com acesso à agenda e cadastro de pacientes', TRUE, NOW(), 'sistema'),
    ('MEDICO', 'Médico com acesso a prontuários e atendimentos', TRUE, NOW(), 'sistema'),
    ('ENFERMEIRO', 'Enfermeiro com acesso a triagem e procedimentos', TRUE, NOW(), 'sistema'),
    ('FARMACEUTICO', 'Farmacêutico com acesso à dispensação de medicamentos', TRUE, NOW(), 'sistema'),
    ('DENTISTA', 'Dentista com acesso a prontuários odontológicos', TRUE, NOW(), 'sistema'),
    ('TECNICO_ENFERMAGEM', 'Técnico de Enfermagem com acesso limitado a procedimentos', TRUE, NOW(), 'sistema'),
    ('TECNICO_HIGIENE_DENTAL', 'Técnico de Higiene Dental com acesso limitado a procedimentos', TRUE, NOW(), 'sistema'),
    ('GESTOR', 'Gestor com acesso a relatórios e indicadores', TRUE, NOW(), 'sistema'),
    ('USUARIO_SISTEMA', 'Usuário básico do sistema', TRUE, NOW(), 'sistema')
    ON CONFLICT (nome) DO NOTHING;

-- Inserir permissões para ADMINISTRADOR_SISTEMA
INSERT INTO perfil_permissoes (perfil_id, permissao)
SELECT id, 'ADMIN_SISTEMA' FROM perfis WHERE nome = 'ADMINISTRADOR_SISTEMA'
    ON CONFLICT DO NOTHING;

-- ===============================
-- OUTRAS TABELAS DO SISTEMA
-- ===============================

-- Create configuracoes table
CREATE TABLE IF NOT EXISTS configuracoes (
                                             id SERIAL PRIMARY KEY,
                                             chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descricao TEXT,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50)
    );

-- Create paciente table
CREATE TABLE IF NOT EXISTS pacientes (
                                         id SERIAL PRIMARY KEY,
                                         nome VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    cpf VARCHAR(20),
    rg VARCHAR(20),
    sexo VARCHAR(10),
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(100),
    data_cadastro TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50)
    );

-- Create sadt table
CREATE TABLE IF NOT EXISTS sadt (
                                    id SERIAL PRIMARY KEY,
                                    pdf_base64 TEXT
);

-- Create atendimentos table
CREATE TABLE IF NOT EXISTS atendimentos (
                                            id SERIAL PRIMARY KEY,
                                            observacoes TEXT
);

-- ===============================
-- ASSISTÊNCIA SOCIAL (mantendo compatibilidade)
-- ===============================

-- Create unidades_assistenciais table
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

-- Create familias table
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

-- Create servicos_socioassistenciais table
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

-- Create grupos_servicos_socioassistenciais table
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

-- Create programas_assistenciais table
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

-- Create motivos_atendimento table
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

-- Create atendimentos_assistenciais table
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

-- Create operador_unidade table
CREATE TABLE IF NOT EXISTS operador_unidade (
                                               operador_id BIGINT NOT NULL,
                                               unidade_id BIGINT NOT NULL,
                                               PRIMARY KEY (operador_id, unidade_id),
    CONSTRAINT fk_operador_unidade_operador FOREIGN KEY (operador_id) REFERENCES operador(id),
    CONSTRAINT fk_operador_unidade_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
    );

-- Create junction tables
CREATE TABLE IF NOT EXISTS atendimentos_assistenciais_pacientes (
                                                                    atendimento_id BIGINT NOT NULL,
                                                                    paciente_id BIGINT NOT NULL,
                                                                    PRIMARY KEY (atendimento_id, paciente_id),
    CONSTRAINT fk_atendimento_paciente FOREIGN KEY (atendimento_id) REFERENCES atendimentos_assistenciais(id),
    CONSTRAINT fk_paciente_atendimento FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
    );

CREATE TABLE IF NOT EXISTS atendimentos_assistenciais_profissionais (
                                                                        atendimento_id BIGINT NOT NULL,
                                                                        profissional_id BIGINT NOT NULL,
                                                                        PRIMARY KEY (atendimento_id, profissional_id),
    CONSTRAINT fk_atendimento_profissional FOREIGN KEY (atendimento_id) REFERENCES atendimentos_assistenciais(id),
    CONSTRAINT fk_profissional_atendimento FOREIGN KEY (profissional_id) REFERENCES operador(id)
    );

CREATE TABLE IF NOT EXISTS atendimentos_assistenciais_motivos (
                                                                  atendimento_id BIGINT NOT NULL,
                                                                  motivo_id BIGINT NOT NULL,
                                                                  PRIMARY KEY (atendimento_id, motivo_id),
    CONSTRAINT fk_atendimento_motivo FOREIGN KEY (atendimento_id) REFERENCES atendimentos_assistenciais(id),
    CONSTRAINT fk_motivo_atendimento FOREIGN KEY (motivo_id) REFERENCES motivos_atendimento(id)
    );
