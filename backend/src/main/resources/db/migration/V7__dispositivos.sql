-- V5: Dispositivos e Logs Simplificados

CREATE TABLE IF NOT EXISTS sf_dispositivo (
    id BIGSERIAL PRIMARY KEY,
    operador_id BIGINT NOT NULL,
    imei VARCHAR(100),
    app VARCHAR(100),
    versao VARCHAR(50),
    ultima_importacao TIMESTAMP,
    ultima_exportacao TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sf_dispositivo_operador ON sf_dispositivo(operador_id);

CREATE TABLE IF NOT EXISTS sf_dispositivo_log (
    id BIGSERIAL PRIMARY KEY,
    dispositivo_id BIGINT NOT NULL REFERENCES sf_dispositivo(id) ON DELETE CASCADE,
    data_hora TIMESTAMP NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    resumo TEXT
);

CREATE INDEX IF NOT EXISTS idx_sf_dispositivo_log_dispositivo ON sf_dispositivo_log(dispositivo_id);
CREATE INDEX IF NOT EXISTS idx_sf_dispositivo_log_data ON sf_dispositivo_log(data_hora);
