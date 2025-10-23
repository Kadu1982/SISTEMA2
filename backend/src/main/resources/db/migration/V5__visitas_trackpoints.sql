-- V3: Visitas Domiciliares e TrackPoints

CREATE TABLE IF NOT EXISTS sf_visita_domiciliar (
    id BIGSERIAL PRIMARY KEY,
    data_hora TIMESTAMP NOT NULL,
    area_id BIGINT NOT NULL REFERENCES sf_area(id) ON DELETE CASCADE,
    microarea_id BIGINT REFERENCES sf_microarea(id) ON DELETE SET NULL,
    profissional_id BIGINT NOT NULL,
    domicilio_id BIGINT,
    familia_id BIGINT,
    motivo VARCHAR(50) NOT NULL,
    desfecho VARCHAR(30) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    fonte VARCHAR(20) NOT NULL
);

-- Índices conforme requisitos
CREATE INDEX IF NOT EXISTS idx_sf_visita_datahora ON sf_visita_domiciliar(data_hora);
-- Índice geográfico simples (numérico) em latitude/longitude
CREATE INDEX IF NOT EXISTS idx_sf_visita_latitude ON sf_visita_domiciliar(latitude);
CREATE INDEX IF NOT EXISTS idx_sf_visita_longitude ON sf_visita_domiciliar(longitude);
-- TODO(PostGIS): considerar criar coluna geometry(Point, 4326) e índice GIST futuramente
-- ALTER TABLE sf_visita_domiciliar ADD COLUMN geom geometry(Point,4326);
-- CREATE INDEX idx_sf_visita_geom ON sf_visita_domiciliar USING GIST (geom);

CREATE TABLE IF NOT EXISTS sf_track_point (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT NOT NULL,
    data_hora TIMESTAMP NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    origem VARCHAR(20) NOT NULL DEFAULT 'MOBILE',
    visita_id BIGINT REFERENCES sf_visita_domiciliar(id) ON DELETE SET NULL
);

-- Índice composto (profissionalId, dataHora)
CREATE INDEX IF NOT EXISTS idx_sf_track_prof_data ON sf_track_point(profissional_id, data_hora);
