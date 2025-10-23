-- ACS: Metas

CREATE TABLE IF NOT EXISTS sf_meta (
    id BIGSERIAL PRIMARY KEY,
    competencia VARCHAR(6) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    area_id BIGINT REFERENCES sf_area(id),
    microarea_id BIGINT REFERENCES sf_microarea(id),
    valor_meta INT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sf_meta_competencia ON sf_meta(competencia);
CREATE INDEX IF NOT EXISTS idx_sf_meta_area_micro ON sf_meta(area_id, microarea_id);
