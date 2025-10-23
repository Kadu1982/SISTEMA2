-- Adicionar coluna cor_prioridade na tabela classificacao_risco
ALTER TABLE classificacao_risco
ADD COLUMN cor_prioridade VARCHAR(20);

-- Atualizar registros existentes com um valor padrão
UPDATE classificacao_risco
SET cor_prioridade = 'VERDE'
WHERE cor_prioridade IS NULL;