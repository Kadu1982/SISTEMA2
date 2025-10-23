-- Flyway Migration: Create UPA core tables
-- This migration creates minimal schema for UPA module used by the new services.

-- ========== Table: upa (occurrence without scheduling) ==========
CREATE TABLE IF NOT EXISTS upa (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    data_hora_registro TIMESTAMP NOT NULL,
    observacoes TEXT,
    CONSTRAINT fk_upa_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
);

-- ========== Table: upa_triagem ==========
CREATE TABLE IF NOT EXISTS upa_triagem (
    id BIGSERIAL PRIMARY KEY,
    upa_id BIGINT NOT NULL,
    paciente_id BIGINT NOT NULL,

    motivo_consulta VARCHAR(255),
    queixa_principal TEXT,
    observacoes TEXT,
    alergias TEXT,

    pressao_arterial VARCHAR(50),
    temperatura DOUBLE PRECISION,
    peso DOUBLE PRECISION,
    altura DOUBLE PRECISION,
    frequencia_cardiaca INTEGER,
    frequencia_respiratoria INTEGER,
    saturacao_oxigenio INTEGER,
    escala_dor INTEGER,

    dum_informada DATE,
    gestante_informado BOOLEAN,
    semanas_gestacao_informadas INTEGER,

    classificacao_risco VARCHAR(30),
    criado_em TIMESTAMP DEFAULT now(),

    CONSTRAINT fk_triagem_upa FOREIGN KEY (upa_id) REFERENCES upa (id),
    CONSTRAINT fk_triagem_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
);

-- Helpful index for queue ordering
CREATE INDEX IF NOT EXISTS idx_upa_triagem_criado_em ON upa_triagem (criado_em);

-- ========== Table: upa_atendimentos ==========
CREATE TABLE IF NOT EXISTS upa_atendimentos (
    id BIGSERIAL PRIMARY KEY,
    upa_id BIGINT NOT NULL,
    triagem_id BIGINT NOT NULL,
    paciente_id BIGINT NOT NULL,

    cid10 VARCHAR(10) NOT NULL,
    anamnese TEXT,
    exame_fisico TEXT,
    hipotese_diagnostica TEXT,
    conduta TEXT,
    prescricao TEXT,
    observacoes TEXT,

    retorno VARCHAR(255),
    status_atendimento VARCHAR(40) NOT NULL,
    criado_em TIMESTAMP DEFAULT now(),

    CONSTRAINT fk_atend_upa FOREIGN KEY (upa_id) REFERENCES upa (id),
    CONSTRAINT fk_atend_triagem FOREIGN KEY (triagem_id) REFERENCES upa_triagem (id),
    CONSTRAINT fk_atend_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_upa_atendimentos_triagem ON upa_atendimentos (triagem_id);
CREATE INDEX IF NOT EXISTS idx_upa_atendimentos_upa ON upa_atendimentos (upa_id);

-- ========== Table: upa_config ==========
CREATE TABLE IF NOT EXISTS upa_config (
    id BIGSERIAL PRIMARY KEY,
    exibir_cid_completa BOOLEAN NOT NULL DEFAULT FALSE,
    sugerir_endereco_upa BOOLEAN NOT NULL DEFAULT TRUE,
    usar_classif_risco BOOLEAN NOT NULL DEFAULT TRUE,
    protocolo_risco_padrao TEXT
);
