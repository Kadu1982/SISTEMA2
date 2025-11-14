-- ============================================================================
-- Migration: Criar tabela de setores de atendimento
-- Descrição: Cria a tabela setores_atendimento e insere setores padrão
-- Versão: V202511100005
-- Data: 2025-11-10
-- ============================================================================

-- Criar tabela de setores de atendimento
CREATE TABLE IF NOT EXISTS setores_atendimento (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_por VARCHAR(50),
    atualizado_por VARCHAR(50),
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir setores padrão (apenas se não existirem)
INSERT INTO setores_atendimento (nome, ativo, criado_por, data_criacao, data_atualizacao)
SELECT 'Farmácia', TRUE, 'sistema', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM setores_atendimento WHERE nome = 'Farmácia');

INSERT INTO setores_atendimento (nome, ativo, criado_por, data_criacao, data_atualizacao)
SELECT 'Enfermagem', TRUE, 'sistema', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM setores_atendimento WHERE nome = 'Enfermagem');

INSERT INTO setores_atendimento (nome, ativo, criado_por, data_criacao, data_atualizacao)
SELECT 'Sala de Curativos', TRUE, 'sistema', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM setores_atendimento WHERE nome = 'Sala de Curativos');

INSERT INTO setores_atendimento (nome, ativo, criado_por, data_criacao, data_atualizacao)
SELECT 'Vacinação', TRUE, 'sistema', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM setores_atendimento WHERE nome = 'Vacinação');

INSERT INTO setores_atendimento (nome, ativo, criado_por, data_criacao, data_atualizacao)
SELECT 'Sala de Procedimentos', TRUE, 'sistema', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM setores_atendimento WHERE nome = 'Sala de Procedimentos');

INSERT INTO setores_atendimento (nome, ativo, criado_por, data_criacao, data_atualizacao)
SELECT 'Sala de Inalação', TRUE, 'sistema', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM setores_atendimento WHERE nome = 'Sala de Inalação');

-- Comentários
COMMENT ON TABLE setores_atendimento IS 'Setores de atendimento da unidade de saúde (Farmácia, Enfermagem, etc.)';
COMMENT ON COLUMN setores_atendimento.nome IS 'Nome do setor (ex: Farmácia, Enfermagem, Sala de Curativos)';
COMMENT ON COLUMN setores_atendimento.ativo IS 'Indica se o setor está ativo e disponível para uso';


