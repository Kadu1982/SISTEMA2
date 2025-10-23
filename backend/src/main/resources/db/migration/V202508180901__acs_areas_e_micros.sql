-- ACS: Áreas e Microáreas

CREATE TABLE IF NOT EXISTS sf_area (
    id BIGSERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    ine VARCHAR(15) NOT NULL UNIQUE,
    segmento VARCHAR(255),
    unidade_id BIGINT,
    tipo_equipe VARCHAR(255),
    atende_pop_geral BOOLEAN NOT NULL DEFAULT TRUE,
    atende_assentados BOOLEAN NOT NULL DEFAULT FALSE,
    atende_quilombolas BOOLEAN NOT NULL DEFAULT FALSE,
    situacao VARCHAR(20) NOT NULL,
    importacao_cnes BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sf_area_ine ON sf_area(ine);

CREATE TABLE IF NOT EXISTS sf_microarea (
    id BIGSERIAL PRIMARY KEY,
    area_id BIGINT NOT NULL REFERENCES sf_area(id),
    codigo INT NOT NULL,
    profissional_responsavel_id BIGINT,
    manequim VARCHAR(100),
    calcado VARCHAR(50),
    situacao VARCHAR(20) NOT NULL,
    importacao_cnes BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sf_microarea_area_codigo ON sf_microarea(area_id, codigo);

-- Vínculo Área-Profissional
CREATE TABLE IF NOT EXISTS sf_area_profissional (
    id BIGSERIAL PRIMARY KEY,
    area_id BIGINT NOT NULL REFERENCES sf_area(id),
    profissional_id BIGINT NOT NULL,
    especialidade VARCHAR(255),
    situacao VARCHAR(20) NOT NULL,
    treinamento_introdutorio BOOLEAN NOT NULL DEFAULT FALSE,
    avaliacao_coletiva BOOLEAN NOT NULL DEFAULT FALSE,
    assistencia_mulher BOOLEAN NOT NULL DEFAULT FALSE,
    assistencia_crianca BOOLEAN NOT NULL DEFAULT FALSE,
    capacitacao_pedagogica BOOLEAN NOT NULL DEFAULT FALSE
);

-- Índices auxiliares
CREATE INDEX IF NOT EXISTS idx_sf_area_prof_area ON sf_area_profissional(area_id);
