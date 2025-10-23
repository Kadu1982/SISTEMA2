-- Adiciona CIAP-2 no módulo de atendimentos (tabela simples)
-- Ajuste o nome da tabela principal caso seja diferente de "atendimentos".

-- 1) Coluna única para RFE (01–29)
ALTER TABLE atendimentos
    ADD COLUMN IF NOT EXISTS ciap_rfe VARCHAR(3);

-- 2) Tabela para Diagnósticos (70–99)
CREATE TABLE IF NOT EXISTS atendimento_ciap_diag (
                                                     atendimento_id BIGINT NOT NULL,
                                                     codigo VARCHAR(3) NOT NULL,
    CONSTRAINT pk_atend_ciap_diag PRIMARY KEY (atendimento_id, codigo),
    CONSTRAINT fk_atend_ciap_diag_atend FOREIGN KEY (atendimento_id)
    REFERENCES atendimentos (id) ON DELETE CASCADE
    );

-- 3) Tabela para Processos/Procedimentos (30–69)
CREATE TABLE IF NOT EXISTS atendimento_ciap_proc (
                                                     atendimento_id BIGINT NOT NULL,
                                                     codigo VARCHAR(3) NOT NULL,
    CONSTRAINT pk_atend_ciap_proc PRIMARY KEY (atendimento_id, codigo),
    CONSTRAINT fk_atend_ciap_proc_atend FOREIGN KEY (atendimento_id)
    REFERENCES atendimentos (id) ON DELETE CASCADE
    );

-- Índices auxiliares (opcional)
CREATE INDEX IF NOT EXISTS idx_atend_ciap_diag_cod ON atendimento_ciap_diag (codigo);
CREATE INDEX IF NOT EXISTS idx_atend_ciap_proc_cod ON atendimento_ciap_proc (codigo);
