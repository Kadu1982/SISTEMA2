-- =====================================================
-- CORREÇÃO DE TIPOS DE COLUNAS BLOB
-- Data: 05/10/2025 20:00
-- Descrição: Corrige colunas BYTEA para OID para compatibilidade com @Lob do Hibernate
-- =====================================================

-- O Hibernate com @Lob em byte[] espera OID, não BYTEA no PostgreSQL
-- Referência: https://hibernate.atlassian.net/browse/HHH-9835

-- =====================================================
-- TABELA: agendamentos
-- =====================================================

DO $$
BEGIN
    -- Verifica se a coluna existe e está como BYTEA
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agendamentos'
        AND column_name = 'codigo_barras_imagem'
        AND data_type = 'bytea'
    ) THEN
        -- Remove a coluna antiga
        ALTER TABLE agendamentos DROP COLUMN codigo_barras_imagem;
        -- Cria novamente como OID
        ALTER TABLE agendamentos ADD COLUMN codigo_barras_imagem OID;
        RAISE NOTICE 'Coluna agendamentos.codigo_barras_imagem recriada como OID';
    ELSE
        RAISE NOTICE 'Coluna agendamentos.codigo_barras_imagem já está no tipo correto ou não existe';
    END IF;
END $$;

-- =====================================================
-- TABELA: sadt
-- =====================================================

DO $$
BEGIN
    -- Verifica se a coluna existe e está como BYTEA
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'sadt'
        AND column_name = 'codigo_barras_imagem'
        AND data_type = 'bytea'
    ) THEN
        -- Remove a coluna antiga
        ALTER TABLE sadt DROP COLUMN codigo_barras_imagem;
        -- Cria novamente como OID
        ALTER TABLE sadt ADD COLUMN codigo_barras_imagem OID;
        RAISE NOTICE 'Coluna sadt.codigo_barras_imagem recriada como OID';
    ELSE
        RAISE NOTICE 'Coluna sadt.codigo_barras_imagem já está no tipo correto ou não existe';
    END IF;
END $$;

-- =====================================================
-- OUTRAS COLUNAS @Lob QUE PODEM PRECISAR DE CORREÇÃO
-- =====================================================

-- Verificar e corrigir outras colunas BLOB se necessário
DO $$
DECLARE
    v_column RECORD;
BEGIN
    -- Lista todas as colunas BYTEA que podem precisar ser OID
    FOR v_column IN
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND data_type = 'bytea'
        AND column_name IN ('imagem', 'foto', 'arquivo', 'conteudo', 'pdf_data', 'anexo')
    LOOP
        RAISE NOTICE 'ATENÇÃO: Coluna %.% está como BYTEA. Verifique se deve ser OID.', v_column.table_name, v_column.column_name;
    END LOOP;
END $$;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON COLUMN agendamentos.codigo_barras_imagem IS 'Imagem PNG do código de barras (OID para compatibilidade com @Lob)';
COMMENT ON COLUMN sadt.codigo_barras_imagem IS 'Imagem PNG do código de barras (OID para compatibilidade com @Lob)';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
