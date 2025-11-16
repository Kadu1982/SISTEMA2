-- Criação da tabela triagens
-- Nota: A tabela já existe na baseline, esta migration apenas adiciona índices faltantes
CREATE TABLE IF NOT EXISTS triagens (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT,
    profissional_id BIGINT,
    unidade_id BIGINT,
    data_triagem TIMESTAMP,
    queixa_principal TEXT,
    pressao_arterial VARCHAR(20),
    temperatura DECIMAL(4,2),
    peso DECIMAL(5,2),
    altura DECIMAL(5,2),
    frequencia_cardiaca INTEGER,
    frequencia_respiratoria INTEGER,
    saturacao_oxigenio DECIMAL(5,2),
    escala_dor INTEGER,
    classificacao_risco VARCHAR(20),
    classificacao_original VARCHAR(20),
    conduta_sugerida TEXT,
    diagnosticos_sugeridos TEXT,
    observacoes TEXT,
    alergias TEXT
);

-- Índices para otimização (apenas criar se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_triagens_paciente_id') THEN
        CREATE INDEX idx_triagens_paciente_id ON triagens(paciente_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_triagens_profissional_id') THEN
        CREATE INDEX idx_triagens_profissional_id ON triagens(profissional_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_triagens_classificacao_risco') THEN
        CREATE INDEX idx_triagens_classificacao_risco ON triagens(classificacao_risco);
    END IF;
    
    -- Índice em data_triagem (nome correto conforme baseline)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'triagens' AND column_name = 'data_triagem'
    ) THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_triagens_data_hora') THEN
            CREATE INDEX idx_triagens_data_hora ON triagens(data_triagem);
        END IF;
    END IF;
END $$;

-- Comentários
COMMENT ON TABLE triagens IS 'Tabela para armazenar dados das triagens e classificação de risco';
COMMENT ON COLUMN triagens.classificacao_risco IS 'Classificação de risco conforme protocolo de Manchester: VERMELHO, LARANJA, AMARELO, VERDE, AZUL';
COMMENT ON COLUMN triagens.escala_dor IS 'Escala de dor de 0 a 10, onde 0 = sem dor e 10 = dor máxima';
COMMENT ON COLUMN triagens.profissional_id IS 'ID do profissional que realizou a triagem';