-- Adicionar coluna encaminhamento_social na tabela classificacao_risco
ALTER TABLE classificacao_risco
ADD COLUMN encaminhamento_social BOOLEAN;

-- Atualizar registros existentes com valor padrão false
UPDATE classificacao_risco
SET encaminhamento_social = false
WHERE encaminhamento_social IS NULL;