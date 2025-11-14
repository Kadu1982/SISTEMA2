-- ============================================================================
-- Migration: Criar tabela prescricoes_medicamentos
-- Descrição: Tabela para armazenar prescrições detalhadas de medicamentos
-- Versão: V202511100003
-- Data: 2025-11-10
-- ============================================================================

CREATE TABLE IF NOT EXISTS prescricoes_medicamentos (
    id BIGSERIAL PRIMARY KEY,
    atendimento_id BIGINT NOT NULL,
    
    -- Tipo e identificação
    tipo_prescricao VARCHAR(20) NOT NULL CHECK (tipo_prescricao IN ('INTERNO', 'EXTERNO')),
    medicamento_codigo VARCHAR(50),
    medicamento_nome VARCHAR(500) NOT NULL,
    principio_ativo_id BIGINT,
    principio_ativo VARCHAR(300) NOT NULL,
    numero_receita INTEGER,
    medicamento_controlado BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Posologia
    quantidade NUMERIC(10, 2),
    unidade VARCHAR(20),
    via_administracao VARCHAR(50),
    data_hora_inicial TIMESTAMP,
    data_hora_final TIMESTAMP,
    duracao_dias INTEGER,
    aprazamento VARCHAR(50),
    instrucao_dosagem TEXT,
    
    -- Outros
    observacoes TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Auditoria
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_prescricao_atendimento
        FOREIGN KEY (atendimento_id) 
        REFERENCES atendimentos (id) 
        ON DELETE CASCADE
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_prescricao_atendimento ON prescricoes_medicamentos(atendimento_id);
CREATE INDEX IF NOT EXISTS idx_prescricao_tipo ON prescricoes_medicamentos(tipo_prescricao);
CREATE INDEX IF NOT EXISTS idx_prescricao_controlado ON prescricoes_medicamentos(medicamento_controlado);
CREATE INDEX IF NOT EXISTS idx_prescricao_ativo ON prescricoes_medicamentos(ativo) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_prescricao_ordem ON prescricoes_medicamentos(atendimento_id, ordem);

-- Comentários
COMMENT ON TABLE prescricoes_medicamentos IS 'Prescrições detalhadas de medicamentos para atendimentos';
COMMENT ON COLUMN prescricoes_medicamentos.tipo_prescricao IS 'Tipo: INTERNO (uso na unidade) ou EXTERNO (uso em casa)';
COMMENT ON COLUMN prescricoes_medicamentos.medicamento_controlado IS 'Indica se é medicamento controlado (requer receita especial)';
COMMENT ON COLUMN prescricoes_medicamentos.instrucao_dosagem IS 'Instrução de dosagem gerada automaticamente (ex: "1 CP VO DE 8/8 H POR 7 DIAS")';

