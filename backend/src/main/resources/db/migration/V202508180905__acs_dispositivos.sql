-- ACS: Dispositivos e Logs

CREATE TABLE IF NOT EXISTS sf_dispositivo (
    id BIGSERIAL PRIMARY KEY,
    operador_id BIGINT NOT NULL,
    imei VARCHAR(100),
    app VARCHAR(100),
    versao VARCHAR(50),
    ultima_importacao TIMESTAMP,
    ultima_exportacao TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sf_dispositivo_log (
    id BIGSERIAL PRIMARY KEY,
    dispositivo_id BIGINT NOT NULL REFERENCES sf_dispositivo(id) ON DELETE CASCADE,
    data_hora TIMESTAMP NOT NULL DEFAULT NOW(),
    tipo VARCHAR(20) NOT NULL,
    resumo TEXT
);

CREATE INDEX IF NOT EXISTS idx_sf_disp_log_disp ON sf_dispositivo_log(dispositivo_id);
