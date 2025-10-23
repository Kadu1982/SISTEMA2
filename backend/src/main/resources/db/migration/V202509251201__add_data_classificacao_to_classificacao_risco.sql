-- Adicionar coluna data_classificacao na tabela classificacao_risco
ALTER TABLE classificacao_risco
ADD COLUMN data_classificacao TIMESTAMP;

-- Atualizar registros existentes com um valor padrão
UPDATE classificacao_risco
SET data_classificacao = CURRENT_TIMESTAMP
WHERE data_classificacao IS NULL;