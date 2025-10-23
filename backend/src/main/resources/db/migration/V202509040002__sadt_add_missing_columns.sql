-- V202509040002__sadt_add_missing_columns.sql
-- Objetivo: completar a tabela SADT com as colunas que o código (Entity/Repository)
-- seleciona; adicionar índices úteis; garantir updated_at automático via trigger.

-- 0) Garante que a tabela 'sadt' existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'sadt'
  ) THEN
    RAISE EXCEPTION 'Tabela "sadt" não existe. Rode primeiro as migrations que criam a SADT.';
END IF;
END$$;

-- 1) Colunas de auditoria/temporalidade
ALTER TABLE sadt
    ADD COLUMN IF NOT EXISTS created_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- 2) Colunas de vínculo e metadados do documento
ALTER TABLE sadt
    ADD COLUMN IF NOT EXISTS paciente_id                 BIGINT,
    ADD COLUMN IF NOT EXISTS operador                    VARCHAR(120),
    ADD COLUMN IF NOT EXISTS tipo_sadt                   VARCHAR(40),
    ADD COLUMN IF NOT EXISTS status                      VARCHAR(30),
    ADD COLUMN IF NOT EXISTS urgente                     BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS observacoes                 TEXT,
    ADD COLUMN IF NOT EXISTS pdf_base64                  TEXT;

-- 3) Colunas do estabelecimento (onde será executado)
ALTER TABLE sadt
    ADD COLUMN IF NOT EXISTS estabelecimento_cnes        VARCHAR(7),
    ADD COLUMN IF NOT EXISTS estabelecimento_nome        VARCHAR(255),
    ADD COLUMN IF NOT EXISTS estabelecimento_endereco    VARCHAR(255),
    ADD COLUMN IF NOT EXISTS estabelecimento_municipio   VARCHAR(120),
    ADD COLUMN IF NOT EXISTS estabelecimento_uf          CHAR(2),
    ADD COLUMN IF NOT EXISTS estabelecimento_telefone    VARCHAR(20);

-- 4) Colunas do solicitante
ALTER TABLE sadt
    ADD COLUMN IF NOT EXISTS solicitante_nome            VARCHAR(255),
    ADD COLUMN IF NOT EXISTS solicitante_cbo             VARCHAR(10),
    ADD COLUMN IF NOT EXISTS solicitante_conselho        VARCHAR(20),
    ADD COLUMN IF NOT EXISTS solicitante_numero_conselho VARCHAR(30);

-- 5) Índices úteis (idempotentes)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sadt' AND column_name='agendamento_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_sadt_agendamento_id ON sadt(agendamento_id)';
END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sadt' AND column_name='data_emissao') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_sadt_data_emissao ON sadt(data_emissao)';
END IF;
END$$;

-- 6) Função de trigger para manter updated_at
-- (fora de DO $$ para evitar colisão de delimitadores; idempotente via OR REPLACE)
CREATE OR REPLACE FUNCTION public.trg_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $trg$
BEGIN
  NEW.updated_at := NOW();
RETURN NEW;
END;
$trg$;

-- 7) Recria a trigger (idempotente)
DROP TRIGGER IF EXISTS trg_sadt_set_timestamp ON sadt;

CREATE TRIGGER trg_sadt_set_timestamp
    BEFORE UPDATE ON sadt
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_set_timestamp();
