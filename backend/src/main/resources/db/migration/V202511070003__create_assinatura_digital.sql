-- ============================================================================
-- Migration: Criar tabela assinaturas_digitais
-- Descrição: FASE 1 - Sistema de assinatura digital com dupla senha
--            Garante autenticidade e rastreabilidade
-- Versão: V202511070003
-- Data: 2025-11-07
-- ============================================================================

-- Criar tabela de assinaturas digitais
CREATE TABLE IF NOT EXISTS assinaturas_digitais (
    id BIGSERIAL PRIMARY KEY,
    
    -- Operador
    operador_id BIGINT NOT NULL,
    
    -- Senha de assinatura (BCrypt hash)
    senha_assinatura_hash VARCHAR(255) NOT NULL,
    
    -- Assinatura de atividade
    data_hora_assinatura TIMESTAMP,
    ip_address VARCHAR(50),
    atividade_enfermagem_id BIGINT,
    coren_operador VARCHAR(20),
    
    -- Auditoria
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT fk_assinatura_operador
        FOREIGN KEY (operador_id) 
        REFERENCES operador (id) 
        ON DELETE RESTRICT,
        
    CONSTRAINT fk_assinatura_atividade
        FOREIGN KEY (atividade_enfermagem_id) 
        REFERENCES atividades_enfermagem (id) 
        ON DELETE SET NULL
);

-- Índice para busca por operador
CREATE INDEX IF NOT EXISTS idx_assinatura_operador ON assinaturas_digitais(operador_id);

-- Índice para busca por atividade
CREATE INDEX IF NOT EXISTS idx_assinatura_atividade ON assinaturas_digitais(atividade_enfermagem_id);

-- Índice para busca por COREN
CREATE INDEX IF NOT EXISTS idx_assinatura_coren ON assinaturas_digitais(coren_operador);

-- Índice para busca por data de assinatura
CREATE INDEX IF NOT EXISTS idx_assinatura_data ON assinaturas_digitais(data_hora_assinatura DESC);

-- Comentários
COMMENT ON TABLE assinaturas_digitais IS 'Assinaturas digitais com dupla senha para atividades de enfermagem';
COMMENT ON COLUMN assinaturas_digitais.operador_id IS 'ID do operador que criou/assinou';
COMMENT ON COLUMN assinaturas_digitais.senha_assinatura_hash IS 'Hash BCrypt da senha de assinatura (diferente da senha de login)';
COMMENT ON COLUMN assinaturas_digitais.data_hora_assinatura IS 'Timestamp da assinatura (null se apenas cadastro de senha)';
COMMENT ON COLUMN assinaturas_digitais.ip_address IS 'IP do operador no momento da assinatura';
COMMENT ON COLUMN assinaturas_digitais.atividade_enfermagem_id IS 'ID da atividade assinada (null se apenas cadastro de senha)';
COMMENT ON COLUMN assinaturas_digitais.coren_operador IS 'COREN do operador que assinou';
COMMENT ON COLUMN assinaturas_digitais.data_criacao IS 'Data de criação do registro (imutável)';

-- ============================================================================
-- Fim da migration
-- ============================================================================

