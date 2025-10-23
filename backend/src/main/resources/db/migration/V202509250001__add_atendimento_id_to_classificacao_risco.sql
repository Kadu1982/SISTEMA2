-- Adicionar coluna atendimento_id à tabela classificacao_risco
-- Esta coluna foi identificada como faltante durante a inicialização do Hibernate

ALTER TABLE classificacao_risco
ADD COLUMN atendimento_id BIGINT;

-- Criar índice para performance
CREATE INDEX idx_classificacao_risco_atendimento ON classificacao_risco(atendimento_id);

-- Adicionar comentário explicativo
COMMENT ON COLUMN classificacao_risco.atendimento_id IS 'Referência ao atendimento relacionado com a classificação de risco';