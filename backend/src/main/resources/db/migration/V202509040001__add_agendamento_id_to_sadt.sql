-- V202509040001__add_agendamento_id_to_sadt.sql
-- Objetivo: adicionar colunas e índices usados pelo domínio SADT sem quebrar ambiente existente.
-- Motivo: erros de "coluna não existe" (agendamento_id / data_emissao) durante inicialização.

-- 0) Garante que a tabela 'sadt' existe antes de alterar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'sadt'
  ) THEN
    RAISE EXCEPTION 'Tabela "sadt" não existe. Rode primeiro as migrations que criam a SADT.';
END IF;
END$$;

-- 1) Adiciona colunas que o código espera (somente se não existirem)
ALTER TABLE sadt
    ADD COLUMN IF NOT EXISTS agendamento_id BIGINT;

ALTER TABLE sadt
    ADD COLUMN IF NOT EXISTS data_emissao TIMESTAMP WITHOUT TIME ZONE;

-- (Opcional, mas útil): se existir created_at e data_emissao estiver nula, preenche uma base
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sadt' AND column_name = 'created_at'
  ) THEN
    EXECUTE 'UPDATE sadt SET data_emissao = COALESCE(data_emissao, created_at) WHERE data_emissao IS NULL';
ELSE
    EXECUTE 'UPDATE sadt SET data_emissao = COALESCE(data_emissao, NOW()) WHERE data_emissao IS NULL';
END IF;
END$$;

-- 2) Índices (somente se as colunas existirem)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sadt' AND column_name = 'agendamento_id'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_sadt_agendamento_id ON sadt(agendamento_id)';
END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sadt' AND column_name = 'data_emissao'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_sadt_data_emissao ON sadt(data_emissao)';
END IF;
END$$;

-- 3) FK condicional para tabela de agendamentos (nome pode ser 'agendamentos' ou 'agendamento')
DO $$
BEGIN
  -- evita duplicidade de constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'sadt' AND constraint_name = 'fk_sadt_agendamento'
  ) THEN

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamentos') THEN
      EXECUTE 'ALTER TABLE sadt
                 ADD CONSTRAINT fk_sadt_agendamento
                 FOREIGN KEY (agendamento_id)
                 REFERENCES agendamentos(id)';
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamento') THEN
      EXECUTE 'ALTER TABLE sadt
                 ADD CONSTRAINT fk_sadt_agendamento
                 FOREIGN KEY (agendamento_id)
                 REFERENCES agendamento(id)';
ELSE
      RAISE NOTICE 'Tabela de agendamento não encontrada; coluna criada sem FK.';
END IF;

END IF;
END$$;

-- Observações:
-- - As colunas são adicionadas como NULLABLE para não quebrar dados legados.
-- - Índices e FK são criados somente se fizer sentido no schema atual.
