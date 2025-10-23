CREATE TABLE IF NOT EXISTS est_insumo (
                                          id BIGSERIAL PRIMARY KEY,
                                          descricao               VARCHAR(200) NOT NULL,
    apresentacao            VARCHAR(120),
    dosagem                 VARCHAR(60),
    descricao_completa      TEXT,
    unidade_medida          VARCHAR(20),
    controle_estoque        VARCHAR(30) NOT NULL DEFAULT 'QUANTIDADE',
    dias_alerta_vencimento  INTEGER DEFAULT 0,
    codigo_barras_padrao    VARCHAR(64),
    ativo                   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE INDEX IF NOT EXISTS idx_est_insumo_descricao ON est_insumo (descricao);
