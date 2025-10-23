-- ===========================================================
-- CRIAÇÃO DA TABELA TIPOS_ENCAMINHAMENTO_SAMU
-- Data: 02/10/2025
-- Descrição: Tabela para armazenar os tipos de encaminhamento do módulo SAMU
-- ===========================================================

CREATE TABLE IF NOT EXISTS tipos_encaminhamento_samu (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    encerramento BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP,
    usuario_cadastro VARCHAR(100),
    usuario_atualizacao VARCHAR(100)
);

-- ===========================================================
-- COMENTÁRIOS NAS COLUNAS
-- ===========================================================
COMMENT ON TABLE tipos_encaminhamento_samu IS 'Tipos de encaminhamento específicos do módulo SAMU';
COMMENT ON COLUMN tipos_encaminhamento_samu.nome IS 'Nome do tipo de encaminhamento (único)';
COMMENT ON COLUMN tipos_encaminhamento_samu.descricao IS 'Descrição detalhada do tipo de encaminhamento';
COMMENT ON COLUMN tipos_encaminhamento_samu.encerramento IS 'Indica se este tipo de encaminhamento encerra a ocorrência';
COMMENT ON COLUMN tipos_encaminhamento_samu.ativo IS 'Indica se o tipo está ativo no sistema';
COMMENT ON COLUMN tipos_encaminhamento_samu.data_cadastro IS 'Data e hora de criação do registro';
COMMENT ON COLUMN tipos_encaminhamento_samu.data_atualizacao IS 'Data e hora da última atualização';
COMMENT ON COLUMN tipos_encaminhamento_samu.usuario_cadastro IS 'Usuário que cadastrou o registro';
COMMENT ON COLUMN tipos_encaminhamento_samu.usuario_atualizacao IS 'Usuário que fez a última atualização';

-- ===========================================================
-- ÍNDICES PARA PERFORMANCE
-- ===========================================================
CREATE INDEX IF NOT EXISTS idx_tipos_encaminhamento_samu_ativo 
    ON tipos_encaminhamento_samu(ativo);

CREATE INDEX IF NOT EXISTS idx_tipos_encaminhamento_samu_encerramento 
    ON tipos_encaminhamento_samu(encerramento);

CREATE INDEX IF NOT EXISTS idx_tipos_encaminhamento_samu_nome 
    ON tipos_encaminhamento_samu(nome);

-- ===========================================================
-- DADOS INICIAIS
-- ===========================================================
INSERT INTO tipos_encaminhamento_samu (nome, descricao, encerramento, ativo) VALUES 
    ('Hospital', 'Encaminhamento para hospital', TRUE, TRUE),
    ('UPA', 'Encaminhamento para Unidade de Pronto Atendimento', TRUE, TRUE),
    ('UBS', 'Encaminhamento para Unidade Básica de Saúde', TRUE, TRUE),
    ('Recusa de Atendimento', 'Paciente recusou atendimento', TRUE, TRUE),
    ('Óbito no Local', 'Paciente foi a óbito no local', TRUE, TRUE),
    ('Transferência Inter-Hospitalar', 'Transferência entre hospitais', FALSE, TRUE),
    ('Retorno à Base', 'Viatura retorna à base sem encaminhamento', TRUE, TRUE),
    ('Cancelamento', 'Ocorrência cancelada', TRUE, TRUE)
ON CONFLICT (nome) DO NOTHING;