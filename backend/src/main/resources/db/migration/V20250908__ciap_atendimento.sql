-- Adiciona CIAP-2 no módulo de atendimentos (tabela simples)
-- Ajuste o nome da tabela principal caso seja diferente de "atendimentos".

-- 1) Coluna única para RFE (01–29)
ALTER TABLE atendimentos
    ADD COLUMN IF NOT EXISTS ciap_rfe VARCHAR(3);

-- 2) Tabela para Diagnósticos (70–99)
-- Nota: A tabela já existe na baseline com a coluna 'ciap' (não 'codigo')
CREATE TABLE IF NOT EXISTS atendimento_ciap_diag (
    atendimento_id BIGINT NOT NULL,
    ciap VARCHAR(10) NOT NULL,
    PRIMARY KEY (atendimento_id, ciap),
    CONSTRAINT fk_atend_ciap_diag FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id)
);

-- 3) Tabela para Processos/Procedimentos (30–69)
-- Nota: A tabela já existe na baseline com a coluna 'ciap' (não 'codigo')
CREATE TABLE IF NOT EXISTS atendimento_ciap_proc (
    atendimento_id BIGINT NOT NULL,
    ciap VARCHAR(10) NOT NULL,
    PRIMARY KEY (atendimento_id, ciap),
    CONSTRAINT fk_atend_ciap_proc FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id)
);

-- Índices auxiliares (opcional)
-- Nota: A tabela já existe na baseline com a coluna 'ciap' (não 'codigo')
DO $$
BEGIN
    -- Índice em ciap (nome correto conforme baseline)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_atend_ciap_diag_cod') THEN
        CREATE INDEX idx_atend_ciap_diag_cod ON atendimento_ciap_diag (ciap);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_atend_ciap_proc_cod') THEN
        CREATE INDEX idx_atend_ciap_proc_cod ON atendimento_ciap_proc (ciap);
    END IF;
END $$;
