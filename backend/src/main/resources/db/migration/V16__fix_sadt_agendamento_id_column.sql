-- V16__fix_sadt_agendamento_id_column.sql
-- Objetivo: Corrigir a coluna agendamento_id ausente na tabela sadt
-- que está causando o erro JDBC "coluna s1_0.agendamento_id não existe"

-- =========================
-- 1) VERIFICAÇÃO E CORREÇÃO DA TABELA 'sadt'
-- =========================

-- Garante que a tabela sadt existe
CREATE TABLE IF NOT EXISTS sadt (
    id BIGSERIAL PRIMARY KEY
);

-- Adiciona a coluna agendamento_id se não existir
ALTER TABLE sadt 
    ADD COLUMN IF NOT EXISTS agendamento_id BIGINT;

-- Adiciona outras colunas essenciais se não existirem (baseado na entidade Sadt.java)
ALTER TABLE sadt
    ADD COLUMN IF NOT EXISTS numero_sadt VARCHAR(20),
    ADD COLUMN IF NOT EXISTS paciente_id BIGINT,
    ADD COLUMN IF NOT EXISTS data_emissao TIMESTAMP,
    ADD COLUMN IF NOT EXISTS tipo_sadt VARCHAR(20),
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'GERADA',
    ADD COLUMN IF NOT EXISTS operador VARCHAR(100),
    ADD COLUMN IF NOT EXISTS observacoes TEXT,
    ADD COLUMN IF NOT EXISTS urgente BOOLEAN DEFAULT FALSE,
    
    -- Dados do estabelecimento
    ADD COLUMN IF NOT EXISTS estabelecimento_nome VARCHAR(200),
    ADD COLUMN IF NOT EXISTS estabelecimento_cnes VARCHAR(10),
    ADD COLUMN IF NOT EXISTS estabelecimento_endereco VARCHAR(300),
    ADD COLUMN IF NOT EXISTS estabelecimento_telefone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS estabelecimento_municipio VARCHAR(100),
    ADD COLUMN IF NOT EXISTS estabelecimento_uf VARCHAR(2),
    
    -- Dados do solicitante
    ADD COLUMN IF NOT EXISTS solicitante_nome VARCHAR(200),
    ADD COLUMN IF NOT EXISTS solicitante_cbo VARCHAR(10),
    ADD COLUMN IF NOT EXISTS solicitante_conselho VARCHAR(10),
    ADD COLUMN IF NOT EXISTS solicitante_numero_conselho VARCHAR(20),
    
    -- PDF base64
    ADD COLUMN IF NOT EXISTS pdf_base64 TEXT,
    
    -- Auditoria
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Atualiza registros existentes com valores padrão para colunas obrigatórias
UPDATE sadt SET 
    numero_sadt = 'SADT-' || id::TEXT
WHERE numero_sadt IS NULL;

UPDATE sadt SET 
    paciente_id = 1
WHERE paciente_id IS NULL;

UPDATE sadt SET 
    data_emissao = NOW()
WHERE data_emissao IS NULL;

UPDATE sadt SET 
    tipo_sadt = 'LABORATORIAL'
WHERE tipo_sadt IS NULL;

UPDATE sadt SET 
    operador = 'sistema'
WHERE operador IS NULL;

UPDATE sadt SET 
    estabelecimento_nome = 'Estabelecimento Padrão'
WHERE estabelecimento_nome IS NULL;

UPDATE sadt SET 
    estabelecimento_cnes = '0000000'
WHERE estabelecimento_cnes IS NULL;

UPDATE sadt SET 
    solicitante_nome = 'Sistema'
WHERE solicitante_nome IS NULL;

UPDATE sadt SET 
    created_at = NOW()
WHERE created_at IS NULL;

-- Adiciona constraints NOT NULL apenas após garantir que não há valores nulos
DO $$
BEGIN
    -- Verifica se a constraint já existe antes de tentar adicioná-la
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'uk_sadt_numero_sadt' 
        AND table_name = 'sadt'
    ) THEN
        -- Primeiro garante que numero_sadt não é nulo
        ALTER TABLE sadt ALTER COLUMN numero_sadt SET NOT NULL;
        -- Depois adiciona a constraint UNIQUE
        ALTER TABLE sadt ADD CONSTRAINT uk_sadt_numero_sadt UNIQUE (numero_sadt);
    END IF;
    
    -- Adiciona outras constraints NOT NULL se as colunas existirem
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sadt' AND column_name = 'paciente_id') THEN
        ALTER TABLE sadt ALTER COLUMN paciente_id SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sadt' AND column_name = 'data_emissao') THEN
        ALTER TABLE sadt ALTER COLUMN data_emissao SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sadt' AND column_name = 'tipo_sadt') THEN
        ALTER TABLE sadt ALTER COLUMN tipo_sadt SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sadt' AND column_name = 'status') THEN
        ALTER TABLE sadt ALTER COLUMN status SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sadt' AND column_name = 'operador') THEN
        ALTER TABLE sadt ALTER COLUMN operador SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sadt' AND column_name = 'urgente') THEN
        ALTER TABLE sadt ALTER COLUMN urgente SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sadt' AND column_name = 'estabelecimento_nome') THEN
        ALTER TABLE sadt ALTER COLUMN estabelecimento_nome SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sadt' AND column_name = 'estabelecimento_cnes') THEN
        ALTER TABLE sadt ALTER COLUMN estabelecimento_cnes SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sadt' AND column_name = 'solicitante_nome') THEN
        ALTER TABLE sadt ALTER COLUMN solicitante_nome SET NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sadt' AND column_name = 'created_at') THEN
        ALTER TABLE sadt ALTER COLUMN created_at SET NOT NULL;
    END IF;
END$$;

-- Cria índices úteis se não existirem
CREATE INDEX IF NOT EXISTS idx_sadt_paciente ON sadt (paciente_id);
CREATE INDEX IF NOT EXISTS idx_sadt_agendamento ON sadt (agendamento_id);
CREATE INDEX IF NOT EXISTS idx_sadt_data_emissao ON sadt (data_emissao);

-- =========================
-- 2) GARANTIR TABELA 'procedimento_sadt'
-- =========================

CREATE TABLE IF NOT EXISTS procedimento_sadt (
    id BIGSERIAL PRIMARY KEY,
    codigo_sigtap VARCHAR(20) NOT NULL,
    nome_procedimento VARCHAR(500) NOT NULL,
    quantidade INTEGER NOT NULL,
    cid10 VARCHAR(10),
    justificativa TEXT,
    preparo TEXT,
    valor_sus NUMERIC(10,2),
    data_execucao TIMESTAMP,
    observacoes_execucao TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    criado_por VARCHAR(100),
    autorizado BOOLEAN NOT NULL DEFAULT FALSE,
    executado BOOLEAN NOT NULL DEFAULT FALSE,
    sadt_id BIGINT NOT NULL
);

-- Adiciona FK se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_procedimento_sadt__sadt'
        AND table_name = 'procedimento_sadt'
    ) THEN
        ALTER TABLE procedimento_sadt
            ADD CONSTRAINT fk_procedimento_sadt__sadt
                FOREIGN KEY (sadt_id) REFERENCES sadt(id) ON DELETE CASCADE;
    END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_procedimento_sadt__sadt_id ON procedimento_sadt (sadt_id);