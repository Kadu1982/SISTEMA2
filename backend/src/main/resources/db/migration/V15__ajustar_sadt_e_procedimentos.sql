
-- V15__ajustar_sadt_e_procedimentos.sql
-- Objetivo: alinhar a tabela 'sadt' com a entidade com.sistemadesaude.backend.exames.entity.Sadt
-- e garantir a existência da tabela 'procedimento_sadt' usada pelo relacionamento @OneToMany.

-- =========================
-- 1) TABELA 'sadt'
-- =========================

-- Garante existência da tabela base (para ambientes onde só havia id/pdf_base64):
CREATE TABLE IF NOT EXISTS sadt (
                                    id BIGSERIAL PRIMARY KEY
);

-- Alinha colunas com a entidade Sadt.java
-- Primeiro, adiciona colunas sem constraint NOT NULL para evitar erros em tabelas com dados existentes
ALTER TABLE sadt
    ADD COLUMN IF NOT EXISTS numero_sadt                  VARCHAR(20),
    ADD COLUMN IF NOT EXISTS agendamento_id               BIGINT,
    ADD COLUMN IF NOT EXISTS paciente_id                  BIGINT,
    ADD COLUMN IF NOT EXISTS data_emissao                 TIMESTAMP,
    ADD COLUMN IF NOT EXISTS tipo_sadt                    VARCHAR(20),
    ADD COLUMN IF NOT EXISTS status                       VARCHAR(20) DEFAULT 'GERADA',
    ADD COLUMN IF NOT EXISTS operador                     VARCHAR(100),
    ADD COLUMN IF NOT EXISTS observacoes                  TEXT,
    ADD COLUMN IF NOT EXISTS urgente                      BOOLEAN DEFAULT FALSE,

    -- Dados do estabelecimento
    ADD COLUMN IF NOT EXISTS estabelecimento_nome         VARCHAR(200),
    ADD COLUMN IF NOT EXISTS estabelecimento_cnes         VARCHAR(10),
    ADD COLUMN IF NOT EXISTS estabelecimento_endereco     VARCHAR(300),
    ADD COLUMN IF NOT EXISTS estabelecimento_telefone     VARCHAR(20),
    ADD COLUMN IF NOT EXISTS estabelecimento_municipio    VARCHAR(100),
    ADD COLUMN IF NOT EXISTS estabelecimento_uf           VARCHAR(2),

    -- Dados do solicitante
    ADD COLUMN IF NOT EXISTS solicitante_nome             VARCHAR(200),
    ADD COLUMN IF NOT EXISTS solicitante_cbo              VARCHAR(10),
    ADD COLUMN IF NOT EXISTS solicitante_conselho         VARCHAR(10),
    ADD COLUMN IF NOT EXISTS solicitante_numero_conselho  VARCHAR(20),

    -- PDF base64 (já existia em alguns ambientes)
    ADD COLUMN IF NOT EXISTS pdf_base64                   TEXT,

    -- Auditoria
    ADD COLUMN IF NOT EXISTS created_at                   TIMESTAMP DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at                   TIMESTAMP;

-- Atualiza registros existentes que podem ter valores nulos nas novas colunas obrigatórias
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

-- Agora adiciona as constraints NOT NULL e UNIQUE após garantir que não há valores nulos
ALTER TABLE sadt 
    ALTER COLUMN numero_sadt SET NOT NULL,
    ALTER COLUMN paciente_id SET NOT NULL,
    ALTER COLUMN data_emissao SET NOT NULL,
    ALTER COLUMN tipo_sadt SET NOT NULL,
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN operador SET NOT NULL,
    ALTER COLUMN urgente SET NOT NULL,
    ALTER COLUMN estabelecimento_nome SET NOT NULL,
    ALTER COLUMN estabelecimento_cnes SET NOT NULL,
    ALTER COLUMN solicitante_nome SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL;

-- Adiciona constraint UNIQUE para numero_sadt
ALTER TABLE sadt ADD CONSTRAINT uk_sadt_numero_sadt UNIQUE (numero_sadt);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_sadt_paciente        ON sadt (paciente_id);
CREATE INDEX IF NOT EXISTS idx_sadt_data_emissao    ON sadt (data_emissao);
-- numero_sadt já possui UNIQUE acima

-- =========================
-- 2) TABELA 'procedimento_sadt'
-- =========================

CREATE TABLE IF NOT EXISTS procedimento_sadt (
                                                 id BIGSERIAL PRIMARY KEY,

                                                 codigo_sigtap         VARCHAR(20)  NOT NULL,
    nome_procedimento     VARCHAR(500) NOT NULL,
    quantidade            INTEGER      NOT NULL,
    cid10                 VARCHAR(10),

    justificativa         TEXT,          -- @Lob
    preparo               TEXT,          -- @Lob

    valor_sus             NUMERIC(10,2),
    data_execucao         TIMESTAMP,
    observacoes_execucao  TEXT,          -- @Lob

    criado_em             TIMESTAMP      NOT NULL DEFAULT NOW(),
    criado_por            VARCHAR(100),

    autorizado            BOOLEAN        NOT NULL DEFAULT FALSE,
    executado             BOOLEAN        NOT NULL DEFAULT FALSE,

    sadt_id               BIGINT         NOT NULL
    );

-- FK + índice para relacionamento
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_procedimento_sadt__sadt'
    ) THEN
ALTER TABLE procedimento_sadt
    ADD CONSTRAINT fk_procedimento_sadt__sadt
        FOREIGN KEY (sadt_id) REFERENCES sadt(id) ON DELETE CASCADE;
END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_procedimento_sadt__sadt_id ON procedimento_sadt (sadt_id);