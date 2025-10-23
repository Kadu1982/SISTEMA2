-- ACS: Visitas domiciliares e TrackPoints

-- Tabela de Visitas Domiciliares
CREATE TABLE IF NOT EXISTS sf_visita_domiciliar (
    id BIGSERIAL PRIMARY KEY,
    data_hora TIMESTAMP NOT NULL,
    area_id BIGINT NOT NULL REFERENCES sf_area(id),
    microarea_id BIGINT REFERENCES sf_microarea(id),
    profissional_id BIGINT NOT NULL,
    domicilio_id BIGINT,
    familia_id BIGINT,
    motivo VARCHAR(50) NOT NULL,
    desfecho VARCHAR(30) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    fonte VARCHAR(20) NOT NULL
);

-- Índices para desempenho
CREATE INDEX IF NOT EXISTS idx_sf_visita_data_hora ON sf_visita_domiciliar(data_hora);
-- Índice simples para latitude/longitude; considerar PostGIS no futuro
CREATE INDEX IF NOT EXISTS idx_sf_visita_geo ON sf_visita_domiciliar(latitude, longitude);
-- TODO(PostGIS): CREATE INDEX sf_visita_geom_idx ON sf_visita_domiciliar USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

-- Tabela de TrackPoints (rastreabilidade)
CREATE TABLE IF NOT EXISTS sf_track_point (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT NOT NULL,
    data_hora TIMESTAMP NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    origem VARCHAR(20) NOT NULL DEFAULT 'MOBILE',
    visita_id BIGINT REFERENCES sf_visita_domiciliar(id)
);

CREATE INDEX IF NOT EXISTS idx_sf_track_prof_data ON sf_track_point(profissional_id, data_hora);
-- TODO(PostGIS): CREATE INDEX sf_track_geom_idx ON sf_track_point USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
