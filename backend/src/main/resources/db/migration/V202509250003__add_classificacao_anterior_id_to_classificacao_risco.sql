-- Adicionar coluna classificacao_anterior_id à tabela classificacao_risco
-- Esta coluna foi identificada como faltante durante a inicialização do Hibernate

ALTER TABLE classificacao_risco
ADD COLUMN classificacao_anterior_id BIGINT;

-- Criar índice para performance
CREATE INDEX idx_classificacao_risco_anterior ON classificacao_risco(classificacao_anterior_id);

-- Adicionar comentário explicativo
COMMENT ON COLUMN classificacao_risco.classificacao_anterior_id IS 'Referência a classificação de risco anterior do paciente';