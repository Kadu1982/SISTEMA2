-- Flyway Migration: Alter UPA table to add missing columns expected by JPA entity
-- This migration is safe to run multiple times thanks to IF NOT EXISTS clauses

-- data_entrada: date stored as varchar (align with entity using String)
ALTER TABLE IF EXISTS upa
    ADD COLUMN IF NOT EXISTS data_entrada VARCHAR(10);

-- hora_entrada: HH:mm stored as varchar
ALTER TABLE IF EXISTS upa
    ADD COLUMN IF NOT EXISTS hora_entrada VARCHAR(5);

-- prioridade: enum-like text up to 20
ALTER TABLE IF EXISTS upa
    ADD COLUMN IF NOT EXISTS prioridade VARCHAR(20);

-- status: enum-like text up to 30 (default 'ABERTO')
ALTER TABLE IF EXISTS upa
    ADD COLUMN IF NOT EXISTS status VARCHAR(30);

-- ensure status is not null with default 'ABERTO'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='upa' AND column_name='status') THEN
        EXECUTE 'UPDATE upa SET status = COALESCE(status, ''ABERTO'')';
        BEGIN
            EXECUTE 'ALTER TABLE upa ALTER COLUMN status SET DEFAULT ''ABERTO''' ;
        EXCEPTION WHEN others THEN
            -- ignore
        END;
        BEGIN
            EXECUTE 'ALTER TABLE upa ALTER COLUMN status SET NOT NULL';
        EXCEPTION WHEN others THEN
            -- ignore
        END;
    END IF;
END $$;

-- unidade_id: multi-tenant support
ALTER TABLE IF EXISTS upa
    ADD COLUMN IF NOT EXISTS unidade_id BIGINT;

-- atualizado_em: timestamp for updates
ALTER TABLE IF EXISTS upa
    ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP;

-- ativo: logical active flag (default true, not null)
ALTER TABLE IF EXISTS upa
    ADD COLUMN IF NOT EXISTS ativo BOOLEAN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='upa' AND column_name='ativo') THEN
        EXECUTE 'UPDATE upa SET ativo = COALESCE(ativo, TRUE)';
        BEGIN
            EXECUTE 'ALTER TABLE upa ALTER COLUMN ativo SET DEFAULT TRUE';
        EXCEPTION WHEN others THEN
        END;
        BEGIN
            EXECUTE 'ALTER TABLE upa ALTER COLUMN ativo SET NOT NULL';
        EXCEPTION WHEN others THEN
        END;
    END IF;
END $$;

-- motivo: text column
ALTER TABLE IF EXISTS upa
    ADD COLUMN IF NOT EXISTS motivo TEXT;

-- ========== ADICIONAR COLUNAS FALTANTES EM UPA_ATENDIMENTOS ==========
-- Conforme especificado na issue (item 1.2), garantir TODAS as colunas ausentes
-- também em upa_atendimentos (não só em upa).

-- unidade_id: multi-tenant support para upa_atendimentos
ALTER TABLE IF EXISTS upa_atendimentos
    ADD COLUMN IF NOT EXISTS unidade_id BIGINT;

-- data_atendimento: timestamp para controle temporal (já existe criado_em, mas adicionando data_atendimento como alias)
ALTER TABLE IF EXISTS upa_atendimentos
    ADD COLUMN IF NOT EXISTS data_atendimento TIMESTAMP;

-- updated_at: timestamp para controle de atualizações
ALTER TABLE IF EXISTS upa_atendimentos
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- status: renomear status_atendimento para status para padronizar (se não existir)
-- Primeiro adicionar coluna status
ALTER TABLE IF EXISTS upa_atendimentos
    ADD COLUMN IF NOT EXISTS status VARCHAR(40);

-- Sincronizar dados de status_atendimento para status (se ambas existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='upa_atendimentos' AND column_name='status') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='upa_atendimentos' AND column_name='status_atendimento') THEN
        EXECUTE 'UPDATE upa_atendimentos SET status = COALESCE(status, status_atendimento)';
    END IF;
END $$;

-- Garantir que data_atendimento seja preenchida com criado_em se vazia
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='upa_atendimentos' AND column_name='data_atendimento') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='upa_atendimentos' AND column_name='criado_em') THEN
        EXECUTE 'UPDATE upa_atendimentos SET data_atendimento = COALESCE(data_atendimento, criado_em)';
    END IF;
END $$;
