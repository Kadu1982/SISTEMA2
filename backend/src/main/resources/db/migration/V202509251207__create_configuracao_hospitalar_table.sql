-- Create configuracao_hospitalar table for hospital configuration

CREATE TABLE configuracao_hospitalar (
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

-- Create index for performance
CREATE INDEX idx_configuracao_hospitalar_parametro ON configuracao_hospitalar(parametro);
CREATE INDEX idx_configuracao_hospitalar_unidade_id ON configuracao_hospitalar(unidade_id);