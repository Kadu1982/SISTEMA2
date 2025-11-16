-- Adicionar coluna atendimento_id à tabela classificacao_risco
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
        ALTER TABLE classificacao_risco ADD COLUMN IF NOT EXISTS atendimento_id BIGINT;
    END IF;
END $$;;

-- Criar índice para performance
CREATE INDEX idx_classificacao_risco_atendimento ON classificacao_risco(atendimento_id);

-- Adicionar comentário explicativo
COMMENT ON COLUMN classificacao_risco.atendimento_id IS 'Referência ao atendimento relacionado com a classificação de risco';