-- Create fila_atendimento table for queue management

CREATE TABLE IF NOT EXISTS fila_atendimento (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    prefixo_senha VARCHAR(255) NOT NULL,
    sequencia_atual INTEGER DEFAULT 0,
    periodo_sequencia VARCHAR(50) CHECK (periodo_sequencia IN ('DIARIO', 'SEMANAL', 'MENSAL', 'ANUAL')),
    ativo BOOLEAN DEFAULT true,
    unidade_id BIGINT,
    setor_id BIGINT,
    horario_inicio TIME,
    horario_fim TIME,
    permite_prioritario BOOLEAN DEFAULT true,
    tempo_espera_alvo INTEGER,
    tempo_espera_tolerancia INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create indexes for performance (apenas se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fila_atendimento_nome') THEN
        CREATE INDEX idx_fila_atendimento_nome ON fila_atendimento(nome);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fila_atendimento_prefixo_senha') THEN
        CREATE INDEX idx_fila_atendimento_prefixo_senha ON fila_atendimento(prefixo_senha);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fila_atendimento_unidade_id') THEN
        CREATE INDEX idx_fila_atendimento_unidade_id ON fila_atendimento(unidade_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fila_atendimento_setor_id') THEN
        CREATE INDEX idx_fila_atendimento_setor_id ON fila_atendimento(setor_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fila_atendimento_ativo') THEN
        CREATE INDEX idx_fila_atendimento_ativo ON fila_atendimento(ativo);
    END IF;
END $$;