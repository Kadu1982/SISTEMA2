-- Adicionar coluna alergias à tabela classificacao_risco
-- Migração para corrigir o erro de validação do schema

ALTER TABLE classificacao_risco ADD COLUMN IF NOT EXISTS alergias VARCHAR(500);