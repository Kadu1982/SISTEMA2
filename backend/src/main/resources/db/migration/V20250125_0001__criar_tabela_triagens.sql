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
CREATE TABLE IF NOT EXISTS triagens (
    id BIGSERIAL PRIMARY KEY,
    agendamento_id BIGINT NOT NULL,
    paciente_id BIGINT NOT NULL,
    data_hora_triagem TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Sinais Vitais
    pressao_arterial VARCHAR(20),
    temperatura DECIMAL(4,1),
    peso DECIMAL(5,2),
    altura DECIMAL(3,2),
    frequencia_cardiaca INTEGER,
    saturacao_oxigenio INTEGER,
    escala_dor INTEGER CHECK (escala_dor >= 0 AND escala_dor <= 10),

    -- Dados da Triagem
    queixa_principal TEXT NOT NULL,
    observacoes TEXT,
    classificacao_risco VARCHAR(20) NOT NULL CHECK (classificacao_risco IN ('VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL')),
    profissional_id BIGINT NOT NULL,

    -- Constraints
    CONSTRAINT fk_triagem_agendamento FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id),
    CONSTRAINT fk_triagem_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT uk_triagem_agendamento UNIQUE (agendamento_id)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_triagens_paciente_id ON triagens(paciente_id);
CREATE INDEX IF NOT EXISTS idx_triagens_profissional_id ON triagens(profissional_id);
CREATE INDEX IF NOT EXISTS idx_triagens_classificacao_risco ON triagens(classificacao_risco);
CREATE INDEX IF NOT EXISTS idx_triagens_data_hora ON triagens(data_hora_triagem);

-- Comentários
COMMENT ON TABLE triagens IS 'Tabela para armazenar dados das triagens e classificação de risco';
COMMENT ON COLUMN triagens.classificacao_risco IS 'Classificação de risco conforme protocolo de Manchester: VERMELHO, LARANJA, AMARELO, VERDE, AZUL';
COMMENT ON COLUMN triagens.escala_dor IS 'Escala de dor de 0 a 10, onde 0 = sem dor e 10 = dor máxima';
COMMENT ON COLUMN triagens.profissional_id IS 'ID do profissional que realizou a triagem';
