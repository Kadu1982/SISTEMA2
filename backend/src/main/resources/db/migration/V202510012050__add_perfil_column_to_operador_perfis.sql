-- ===========================================================
-- ADICIONAR COLUNA PERFIL À TABELA OPERADOR_PERFIS
-- ===========================================================
-- Esta migration corrige a estrutura da tabela operador_perfis
-- para incluir a coluna 'perfil' VARCHAR(50) necessária para
-- compatibilidade com o sistema de permissões baseado em string.

-- Adicionar a coluna 'perfil' se ela não existir
DO $$
DECLARE
    v_table_exists boolean;
    v_perfis_table_exists boolean;
    v_column_exists boolean;
    v_has_data boolean;
BEGIN
    -- Verificar se a tabela operador_perfis existe
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'operador_perfis'
    ) INTO v_table_exists;

    IF NOT v_table_exists THEN
        RAISE NOTICE 'Tabela operador_perfis não existe. Pulando migration.';
        RETURN;
    END IF;

    -- Verificar se a coluna perfil já existe
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'operador_perfis'
        AND column_name = 'perfil'
    ) INTO v_column_exists;

    IF v_column_exists THEN
        RAISE NOTICE 'Coluna perfil já existe na tabela operador_perfis';
        RETURN;
    END IF;

    -- Adicionar a coluna perfil
    ALTER TABLE operador_perfis
    ADD COLUMN perfil VARCHAR(50);

    RAISE NOTICE 'Coluna perfil adicionada à tabela operador_perfis';

    -- Verificar se a tabela perfis existe
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'perfis'
    ) INTO v_perfis_table_exists;

    -- Verificar se há dados na tabela operador_perfis
    SELECT EXISTS (
        SELECT 1
        FROM operador_perfis
        LIMIT 1
    ) INTO v_has_data;

    -- Se a tabela perfis existe e há dados, preencher a coluna perfil
    IF v_perfis_table_exists AND v_has_data THEN
        UPDATE operador_perfis op
        SET perfil = p.nome
        FROM perfis p
        WHERE op.perfil_id = p.id
        AND op.perfil IS NULL;

        RAISE NOTICE 'Coluna perfil preenchida com base na tabela perfis';

        -- Tornar a coluna NOT NULL apenas se todos os registros foram preenchidos
        DECLARE
            v_null_count integer;
        BEGIN
            SELECT COUNT(*)
            INTO v_null_count
            FROM operador_perfis
            WHERE perfil IS NULL;

            IF v_null_count = 0 THEN
                ALTER TABLE operador_perfis
                ALTER COLUMN perfil SET NOT NULL;
                RAISE NOTICE 'Coluna perfil definida como NOT NULL';
            ELSE
                RAISE WARNING 'Existem % registros sem perfil preenchido. Coluna permanece NULL-able.', v_null_count;
            END IF;
        END;
    ELSE
        RAISE NOTICE 'Tabela perfis não existe ou não há dados. Coluna perfil permanece vazia.';
    END IF;

    -- Criar índice para melhorar performance de consultas por perfil
    CREATE INDEX IF NOT EXISTS idx_operador_perfis_perfil
    ON operador_perfis(perfil);

    RAISE NOTICE 'Migration concluída com sucesso';
END $$;
