-- Tabela de anexos no prontuário
-- Nota: A tabela já existe na baseline com a coluna 'tipo_documento' (não 'tipo')
CREATE TABLE IF NOT EXISTS prontuario_documentos (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    titulo VARCHAR(255),
    descricao TEXT,
    arquivo_nome VARCHAR(255),
    arquivo_tipo VARCHAR(100),
    arquivo_tamanho BIGINT,
    arquivo_dados BYTEA,
    data_documento DATE,
    profissional_id BIGINT,
    atendimento_id BIGINT,
    data_criacao TIMESTAMP DEFAULT NOW(),
    criado_por VARCHAR(100)
);

-- Índices (apenas criar se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pront_doc_paciente') THEN
        CREATE INDEX idx_pront_doc_paciente ON prontuario_documentos(paciente_id);
    END IF;
    
    -- Índice em tipo_documento (nome correto conforme baseline)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pront_doc_tipo') THEN
        CREATE INDEX idx_pront_doc_tipo ON prontuario_documentos(tipo_documento);
    END IF;
END $$;
