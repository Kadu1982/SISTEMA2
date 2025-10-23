-- V1: Áreas, Vínculo Área-Profissional, Microáreas
-- Schema for saude-familia-acs module

CREATE TABLE IF NOT EXISTS sf_area (
    id BIGSERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    ine VARCHAR(15) NOT NULL UNIQUE,
    segmento VARCHAR(255),
    unidade_id BIGINT,
    tipo_equipe VARCHAR(255),
    atende_pop_geral BOOLEAN DEFAULT TRUE,
    atende_assentados BOOLEAN NOT NULL DEFAULT FALSE,
    atende_quilombolas BOOLEAN DEFAULT FALSE,
    situacao VARCHAR(20) NOT NULL DEFAULT 'ATIVA',
    importacao_cnes BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice recomendado pelo requisito
CREATE INDEX IF NOT EXISTS idx_sf_area_ine ON sf_area(ine);

CREATE TABLE IF NOT EXISTS sf_area_profissional (
    id BIGSERIAL PRIMARY KEY,
    area_id BIGINT NOT NULL REFERENCES sf_area(id) ON DELETE CASCADE,
    profissional_id BIGINT NOT NULL,
    especialidade VARCHAR(255),
    situacao VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    treinamento_introdutorio BOOLEAN DEFAULT FALSE,
    avaliacao_coletiva BOOLEAN DEFAULT FALSE,
    assistencia_mulher BOOLEAN DEFAULT FALSE,
    assistencia_crianca BOOLEAN DEFAULT FALSE,
    capacitacao_pedagogica BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS sf_microarea (
    id BIGSERIAL PRIMARY KEY,
    area_id BIGINT NOT NULL REFERENCES sf_area(id) ON DELETE CASCADE,
    codigo INTEGER NOT NULL,
    profissional_responsavel_id BIGINT,
    manequim VARCHAR(50),
    calcado VARCHAR(50),
    situacao VARCHAR(20) NOT NULL DEFAULT 'ATIVA',
    importacao_cnes BOOLEAN DEFAULT FALSE
);

-- Índice composto recomendado (areaId, codigo)
CREATE UNIQUE INDEX IF NOT EXISTS ux_sf_microarea_area_codigo ON sf_microarea(area_id, codigo);
