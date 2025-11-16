-- Adicionar coluna avaliacao_glasgow à tabela classificacao_risco
-- Esta coluna foi identificada como faltante durante a inicialização do Hibernate
-- Nota: A tabela classificacao_risco não existe na baseline, então esta migration não precisa ser executada

DO $$
BEGIN
    -- Verificar se a tabela existe antes de adicionar a coluna
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'classificacao_risco'
    ) THEN
        -- Adicionar coluna apenas se a tabela existir
        ALTER TABLE classificacao_risco ADD COLUMN IF NOT EXISTS avaliacao_glasgow INTEGER;
        
        -- Adicionar comentário explicativo
        COMMENT ON COLUMN classificacao_risco.avaliacao_glasgow IS 'Avaliação da Escala de Coma de Glasgow do paciente';
    END IF;
END $$;