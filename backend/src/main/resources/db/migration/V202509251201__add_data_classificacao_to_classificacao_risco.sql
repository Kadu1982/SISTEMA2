-- Adicionar coluna data_classificacao na tabela classificacao_risco
-- Nota: A tabela classificacao_risco não existe na baseline, então esta migration não precisa ser executada

DO $$
BEGIN
    -- Verificar se a tabela existe antes de adicionar a coluna
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'classificacao_risco'
    ) THEN
        -- Adicionar coluna apenas se a tabela existir
        ALTER TABLE classificacao_risco ADD COLUMN IF NOT EXISTS data_classificacao TIMESTAMP;
        
        -- Atualizar registros existentes com um valor padrão
        UPDATE classificacao_risco
        SET data_classificacao = CURRENT_TIMESTAMP
        WHERE data_classificacao IS NULL;
    END IF;
END $$;