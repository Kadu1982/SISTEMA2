-- ============================================================================
-- Migration: Adicionar coluna aprazamento à tabela prescricoes_medicamentos
-- Descrição: Adiciona campo de aprazamento que estava faltando
-- Versão: V202511100004
-- Data: 2025-11-10
-- ============================================================================

ALTER TABLE prescricoes_medicamentos
ADD COLUMN IF NOT EXISTS aprazamento VARCHAR(50);

COMMENT ON COLUMN prescricoes_medicamentos.aprazamento IS 'Aprazamento da prescrição (ex: "8/8 H", "12/12 H", "1X AO DIA")';

