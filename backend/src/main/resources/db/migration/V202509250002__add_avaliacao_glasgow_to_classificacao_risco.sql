-- Adicionar coluna avaliacao_glasgow à tabela classificacao_risco
-- Esta coluna foi identificada como faltante durante a inicialização do Hibernate

ALTER TABLE classificacao_risco
ADD COLUMN avaliacao_glasgow INTEGER;

-- Criar índice para performance (opcional, se necessário)
-- CREATE INDEX idx_classificacao_risco_glasgow ON classificacao_risco(avaliacao_glasgow);

-- Adicionar comentário explicativo
COMMENT ON COLUMN classificacao_risco.avaliacao_glasgow IS 'Avaliação da Escala de Coma de Glasgow do paciente';