-- ============================================================================
-- Migration: Corrigir tipos de colunas TEXT na tabela lab_exame
-- Descrição: Converte colunas OID para TEXT antes de inserir dados na V31
-- Versão: V30_9
-- Data: 2025-11-15
-- ============================================================================

-- Corrigir tipo das colunas TEXT que podem estar como OID
DO $$
BEGIN
    -- Corrigir orientacoes_paciente se for OID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lab_exame' 
        AND column_name = 'orientacoes_paciente'
        AND data_type = 'oid'
    ) THEN
        -- Remover a coluna e recriar como TEXT
        ALTER TABLE lab_exame DROP COLUMN IF EXISTS orientacoes_paciente CASCADE;
        ALTER TABLE lab_exame ADD COLUMN orientacoes_paciente TEXT;
    END IF;

    -- Corrigir preparo se for OID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lab_exame' 
        AND column_name = 'preparo'
        AND data_type = 'oid'
    ) THEN
        ALTER TABLE lab_exame DROP COLUMN IF EXISTS preparo CASCADE;
        ALTER TABLE lab_exame ADD COLUMN preparo TEXT;
    END IF;

    -- Corrigir modelo_laudo se for OID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lab_exame' 
        AND column_name = 'modelo_laudo'
        AND data_type = 'oid'
    ) THEN
        ALTER TABLE lab_exame DROP COLUMN IF EXISTS modelo_laudo CASCADE;
        ALTER TABLE lab_exame ADD COLUMN modelo_laudo TEXT;
    END IF;
END $$;

-- Garantir que as colunas existam com o tipo correto (caso não existam)
DO $$
BEGIN
    -- Se orientacoes_paciente não existe, criar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lab_exame' AND column_name = 'orientacoes_paciente'
    ) THEN
        ALTER TABLE lab_exame ADD COLUMN orientacoes_paciente TEXT;
    END IF;

    -- Se preparo não existe, criar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lab_exame' AND column_name = 'preparo'
    ) THEN
        ALTER TABLE lab_exame ADD COLUMN preparo TEXT;
    END IF;

    -- Se modelo_laudo não existe, criar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lab_exame' AND column_name = 'modelo_laudo'
    ) THEN
        ALTER TABLE lab_exame ADD COLUMN modelo_laudo TEXT;
    END IF;
END $$;

