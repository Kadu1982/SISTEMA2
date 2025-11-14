-- ============================================================================
-- Migration: Adicionar campo alergias à tabela pacientes
-- Descrição: Adiciona o campo alergias para armazenar informações sobre alergias conhecidas do paciente
-- Versão: V202511100001
-- Data: 2025-11-10
-- ============================================================================

-- Adicionar coluna alergias à tabela pacientes
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS alergias VARCHAR(1000);

-- Comentário na coluna
COMMENT ON COLUMN pacientes.alergias IS 'Alergias conhecidas do paciente (separadas por vírgula, ponto e vírgula ou espaço)';

