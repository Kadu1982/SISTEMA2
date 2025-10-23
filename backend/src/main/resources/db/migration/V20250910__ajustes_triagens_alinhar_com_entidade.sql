-- V20250910__ajustes_triagens_alinhar_com_entidade.sql
-- Objetivo: alinhar a tabela triagens com a entidade Triagem do Java
-- Estratégia:
-- 1) Renomear data_hora_triagem -> data_triagem (se necessário)
-- 2) Criar/ajustar as colunas que a entidade usa e que não existem no banco
-- 3) Criar índices úteis (IF NOT EXISTS)
-- Observação: todos os ADD COLUMN usam IF NOT EXISTS para serem idempotentes.

-- 1) Garantir coluna data_triagem
DO $$
BEGIN
  -- Se existir a coluna antiga e ainda não existir a nova, renomeia
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'triagens' AND column_name = 'data_hora_triagem'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'triagens' AND column_name = 'data_triagem'
  ) THEN
    EXECUTE 'ALTER TABLE triagens RENAME COLUMN data_hora_triagem TO data_triagem';
END IF;

  -- Se por algum motivo não existir nenhuma das duas, cria data_triagem
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'triagens' AND column_name = 'data_triagem'
  ) THEN
    EXECUTE 'ALTER TABLE triagens ADD COLUMN data_triagem TIMESTAMP DEFAULT now()';
END IF;

  -- Caso ambas existam (incomum), consolida e remove a antiga
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'triagens' AND column_name = 'data_hora_triagem'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'triagens' AND column_name = 'data_triagem'
  ) THEN
    -- Preenche data_triagem com data_hora_triagem quando estiver nulo
    EXECUTE 'UPDATE triagens SET data_triagem = COALESCE(data_triagem, data_hora_triagem)';
    -- Remove a antiga
EXECUTE 'ALTER TABLE triagens DROP COLUMN data_hora_triagem';
END IF;
END$$;

-- 2) Campos da entidade que podem estar faltando

-- Identificadores externos e profissionais
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS profissional_id BIGINT;

-- Campos clínicos/textuais
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS queixa_principal TEXT;
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS conduta_sugerida TEXT;
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS diagnosticos_sugeridos TEXT;
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS alergias TEXT;
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS protocolo_aplicado VARCHAR(255);

-- Enums gravados como String
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS motivo_consulta VARCHAR(50);
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS classificacao_risco VARCHAR(20);
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS classificacao_original VARCHAR(20);

-- Obstetrícia
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS dum_informada DATE;
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS gestante_informado BOOLEAN DEFAULT FALSE;
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS semanas_gestacao_informadas INTEGER;

-- Sinais vitais já existentes na criação inicial (mas garantimos)
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS pressao_arterial VARCHAR(20);
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS temperatura DOUBLE PRECISION;
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS peso DOUBLE PRECISION;
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS altura DOUBLE PRECISION;
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS frequencia_cardiaca INTEGER;
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS saturacao_oxigenio INTEGER;
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS escala_dor INTEGER;

-- 🚑 O QUE ESTÁ FALTANDO E CAUSANDO O ERRO:
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS frequencia_respiratoria INTEGER;

-- UPA e flags
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS is_upa_triagem BOOLEAN DEFAULT FALSE;

-- Datas de auditoria e referência
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMP DEFAULT now();
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMP;
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS data_referencia_atendimento DATE;

-- Cancelamento
ALTER TABLE triagens ADD COLUMN IF NOT EXISTS cancelada BOOLEAN DEFAULT FALSE;

-- 3) Índices úteis (se ainda não existirem)
CREATE INDEX IF NOT EXISTS idx_triagens_classificacao_risco ON triagens(classificacao_risco);
CREATE INDEX IF NOT EXISTS idx_triagens_data_triagem ON triagens(data_triagem);
CREATE INDEX IF NOT EXISTS idx_triagens_paciente_id ON triagens(paciente_id);
CREATE INDEX IF NOT EXISTS idx_triagens_profissional_id ON triagens(profissional_id);

-- (Opcional) Preencher data_referencia_atendimento com a data de data_triagem quando nulo
UPDATE triagens
SET data_referencia_atendimento = COALESCE(data_referencia_atendimento, CAST(data_triagem AS DATE))
WHERE data_referencia_atendimento IS NULL AND data_triagem IS NOT NULL;
