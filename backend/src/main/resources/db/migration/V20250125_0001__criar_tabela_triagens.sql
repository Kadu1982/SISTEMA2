-- Garantir a existência da tabela de agendamentos (necessária para a FK de triagens)
CREATE TABLE IF NOT EXISTS agendamentos (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    profissional_id BIGINT,
    unidade_id BIGINT,
    data_agendamento DATE NOT NULL,
    hora_agendamento TIME NOT NULL,
    tipo_consulta VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'AGENDADO',
    motivo VARCHAR(500),
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100),
    CONSTRAINT fk_agendamento_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_agendamento_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- Criação da tabela triagens
-- Nota: A tabela já existe na baseline, esta migration apenas adiciona índices faltantes
CREATE TABLE IF NOT EXISTS triagens (
    id BIGSERIAL PRIMARY KEY,
    agendamento_id BIGINT,
    paciente_id BIGINT,
    data_triagem TIMESTAMP,
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
    alergias TEXT,
    profissional_id BIGINT,
    unidade_id BIGINT,
    queixa_principal TEXT
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
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_triagens_data_triagem') THEN
        CREATE INDEX idx_triagens_data_triagem ON triagens(data_triagem);
    END IF;
END $$;

-- Comentários
COMMENT ON TABLE triagens IS 'Tabela para armazenar dados das triagens e classificação de risco';
COMMENT ON COLUMN triagens.classificacao_risco IS 'Classificação de risco conforme protocolo de Manchester: VERMELHO, LARANJA, AMARELO, VERDE, AZUL';
COMMENT ON COLUMN triagens.escala_dor IS 'Escala de dor de 0 a 10, onde 0 = sem dor e 10 = dor máxima';
COMMENT ON COLUMN triagens.profissional_id IS 'ID do profissional que realizou a triagem';
