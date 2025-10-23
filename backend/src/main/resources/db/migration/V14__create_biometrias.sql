CREATE TABLE IF NOT EXISTS biometrias (
                                          id             BIGSERIAL PRIMARY KEY,
                                          operador_id    BIGINT NOT NULL,
                                          data_captura   TIMESTAMP NOT NULL DEFAULT NOW(),
    template       BYTEA,
    formato        VARCHAR(20),
    observacoes    TEXT
    );

CREATE INDEX IF NOT EXISTS idx_biometrias_operador ON biometrias (operador_id);
CREATE INDEX IF NOT EXISTS idx_biometrias_data     ON biometrias (data_captura DESC);
