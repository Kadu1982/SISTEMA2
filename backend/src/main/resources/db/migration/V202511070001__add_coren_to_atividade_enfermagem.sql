-- ============================================================================
-- Migration: Adicionar campos obrigatórios em atividades_enfermagem
-- Descrição: FASE 1 - Correções Críticas
--            - COREN obrigatório
--            - Detalhes de medicação
--            - Reação adversa
--            - Motivo de recusa
--            - Hash de assinatura digital
-- Versão: V202511070001
-- Data: 2025-11-07
-- ============================================================================

-- Adicionar novos campos em atividades_enfermagem
ALTER TABLE atividades_enfermagem
ADD COLUMN IF NOT EXISTS coren_realizacao VARCHAR(20),
ADD COLUMN IF NOT EXISTS medicamento_id BIGINT,
ADD COLUMN IF NOT EXISTS medicamento_nome VARCHAR(200),
ADD COLUMN IF NOT EXISTS dose VARCHAR(100),
ADD COLUMN IF NOT EXISTS via_administracao VARCHAR(50),
ADD COLUMN IF NOT EXISTS diluicao VARCHAR(200),
ADD COLUMN IF NOT EXISTS reacao_adversa BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS descricao_reacao TEXT,
ADD COLUMN IF NOT EXISTS motivo_recusa TEXT,
ADD COLUMN IF NOT EXISTS hash_assinatura_digital VARCHAR(255);

-- Adicionar índice para busca por COREN
CREATE INDEX IF NOT EXISTS idx_atividade_coren ON atividades_enfermagem(coren_realizacao);

-- Adicionar índice para busca por medicamento
CREATE INDEX IF NOT EXISTS idx_atividade_medicamento ON atividades_enfermagem(medicamento_id);

-- Adicionar índice para busca por reação adversa
CREATE INDEX IF NOT EXISTS idx_atividade_reacao_adversa ON atividades_enfermagem(reacao_adversa) 
WHERE reacao_adversa = TRUE;

-- Comentários
COMMENT ON COLUMN atividades_enfermagem.coren_realizacao IS 'COREN do profissional que executou a atividade (obrigatório para atividades executadas)';
COMMENT ON COLUMN atividades_enfermagem.medicamento_id IS 'ID do medicamento (referência à tabela de medicamentos)';
COMMENT ON COLUMN atividades_enfermagem.medicamento_nome IS 'Nome do medicamento';
COMMENT ON COLUMN atividades_enfermagem.dose IS 'Dose do medicamento (ex: 500mg, 10ml)';
COMMENT ON COLUMN atividades_enfermagem.via_administracao IS 'Via de administração (VO, IV, IM, SC, etc.)';
COMMENT ON COLUMN atividades_enfermagem.diluicao IS 'Diluição do medicamento (se aplicável)';
COMMENT ON COLUMN atividades_enfermagem.reacao_adversa IS 'Indica se houve reação adversa após administração';
COMMENT ON COLUMN atividades_enfermagem.descricao_reacao IS 'Descrição detalhada da reação adversa';
COMMENT ON COLUMN atividades_enfermagem.motivo_recusa IS 'Motivo de recusa do paciente (se aplicável)';
COMMENT ON COLUMN atividades_enfermagem.hash_assinatura_digital IS 'Hash SHA-256 da assinatura digital';

-- ============================================================================
-- Fim da migration
-- ============================================================================

