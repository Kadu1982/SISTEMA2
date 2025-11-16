-- Adicionar coluna encaminhamento_social na tabela classificacao_risco
-- Nota: A tabela classificacao_risco não existe na baseline, então esta migration não precisa ser executada

DO $$
BEGIN
    -- Verificar se a tabela existe antes de adicionar a coluna
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'classificacao_risco'
    ) THEN
        -- Adicionar coluna apenas se a tabela existir
        ALTER TABLE classificacao_risco ADD COLUMN IF NOT EXISTS encaminhamento_social BOOLEAN;
        
        -- Atualizar registros existentes com valor padrão false
        UPDATE classificacao_risco
        SET encaminhamento_social = false
        WHERE encaminhamento_social IS NULL;
    END IF;
END $$;