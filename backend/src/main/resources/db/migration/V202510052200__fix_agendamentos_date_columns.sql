-- =====================================================
-- CORRIGIR TIPOS DE COLUNAS DATE PARA TIMESTAMP
-- Data: 05/10/2025 22:00
-- Descrição: Converte colunas DATE para TIMESTAMP conforme entidade
-- =====================================================

-- A entidade Agendamento usa LocalDateTime para data_agendamento e data_criacao
-- que mapeia para TIMESTAMP no PostgreSQL, não DATE

-- Alterar data_agendamento de DATE para TIMESTAMP
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agendamentos'
        AND column_name = 'data_agendamento'
        AND data_type = 'date'
    ) THEN
        ALTER TABLE agendamentos
        ALTER COLUMN data_agendamento TYPE TIMESTAMP USING data_agendamento::TIMESTAMP;
        RAISE NOTICE 'Coluna data_agendamento alterada de DATE para TIMESTAMP';
    END IF;
END $$;

-- Alterar data_criacao de DATE para TIMESTAMP se necessário
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agendamentos'
        AND column_name = 'data_criacao'
        AND data_type = 'date'
    ) THEN
        ALTER TABLE agendamentos
        ALTER COLUMN data_criacao TYPE TIMESTAMP USING data_criacao::TIMESTAMP;
        RAISE NOTICE 'Coluna data_criacao alterada de DATE para TIMESTAMP';
    END IF;
END $$;

-- Verificar e corrigir outras colunas DATE que deveriam ser TIMESTAMP
DO $$
BEGIN
    -- hora_agendamento pode estar como TIME, deve permanecer TIME
    -- Outras colunas de data que podem precisar ser TIMESTAMP

    -- data_atualizacao
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agendamentos'
        AND column_name = 'data_atualizacao'
        AND data_type = 'date'
    ) THEN
        ALTER TABLE agendamentos
        ALTER COLUMN data_atualizacao TYPE TIMESTAMP USING data_atualizacao::TIMESTAMP;
    END IF;

    -- data_cancelamento
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agendamentos'
        AND column_name = 'data_cancelamento'
        AND data_type = 'date'
    ) THEN
        ALTER TABLE agendamentos
        ALTER COLUMN data_cancelamento TYPE TIMESTAMP USING data_cancelamento::TIMESTAMP;
    END IF;
END $$;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
