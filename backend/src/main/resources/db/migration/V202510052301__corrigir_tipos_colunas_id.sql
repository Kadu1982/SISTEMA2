-- ============================================================================
-- Migration: Corrigir tipos de colunas ID de SERIAL para BIGSERIAL
-- ============================================================================
-- PROBLEMA: Algumas tabelas foram criadas com SERIAL (INTEGER) mas as entidades
-- JPA esperam BIGINT. Esta migration corrige esses tipos.
-- ============================================================================

-- Tabela: atendimentos - corrigir coluna id de SERIAL para BIGINT
ALTER TABLE atendimentos ALTER COLUMN id TYPE BIGINT;
