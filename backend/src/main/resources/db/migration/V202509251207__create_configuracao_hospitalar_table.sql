-- Create configuracao_hospitalar table for hospital configuration

CREATE TABLE IF NOT EXISTS configuracao_hospitalar (
    id BIGSERIAL PRIMARY KEY,
    parametro VARCHAR(255) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) CHECK (tipo IN ('PROCEDIMENTO', 'IMPRESSAO', 'SISTEMA', 'CONTROLE_ACESSO', 'CERTIFICADO_DIGITAL', 'MULTI_ESTABELECIMENTO')),
    ativo BOOLEAN DEFAULT true,
    unidade_id BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create index for performance (apenas se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_configuracao_hospitalar_parametro') THEN
        CREATE INDEX idx_configuracao_hospitalar_parametro ON configuracao_hospitalar(parametro);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_configuracao_hospitalar_unidade_id') THEN
        CREATE INDEX idx_configuracao_hospitalar_unidade_id ON configuracao_hospitalar(unidade_id);
    END IF;
END $$;