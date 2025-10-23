-- V2: Metas mensais

CREATE TABLE IF NOT EXISTS sf_meta (
    id BIGSERIAL PRIMARY KEY,
    competencia VARCHAR(6) NOT NULL,
    tipo VARCHAR(30) NOT NULL, -- FAMILIAS|INTEGRANTES|ACOMPANHAMENTO
    area_id BIGINT REFERENCES sf_area(id) ON DELETE SET NULL,
    microarea_id BIGINT REFERENCES sf_microarea(id) ON DELETE SET NULL,
    valor_meta INTEGER NOT NULL
);

-- Índices opcionais úteis para filtros
CREATE INDEX IF NOT EXISTS idx_sf_meta_competencia ON sf_meta(competencia);
CREATE INDEX IF NOT EXISTS idx_sf_meta_area ON sf_meta(area_id);
CREATE INDEX IF NOT EXISTS idx_sf_meta_microarea ON sf_meta(microarea_id);
