-- =====================================================
-- Migration: Criar tabela escala_morse
-- Descrição: Escala de Morse para avaliação de risco de quedas
-- Data: 07/11/2025
-- =====================================================

CREATE TABLE IF NOT EXISTS escala_morse (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    
    -- Itens da escala (pontuações específicas)
    historico_quedas INTEGER NOT NULL CHECK (historico_quedas IN (0, 25)),
    diagnostico_secundario INTEGER NOT NULL CHECK (diagnostico_secundario IN (0, 15)),
    auxilio_marcha INTEGER NOT NULL CHECK (auxilio_marcha IN (0, 15, 30)),
    terapia_endovenosa INTEGER NOT NULL CHECK (terapia_endovenosa IN (0, 20)),
    marcha INTEGER NOT NULL CHECK (marcha IN (0, 10, 20)),
    estado_mental INTEGER NOT NULL CHECK (estado_mental IN (0, 15)),
    
    -- Resultado da avaliação
    pontuacao_total INTEGER NOT NULL CHECK (pontuacao_total >= 0 AND pontuacao_total <= 125),
    classificacao_risco VARCHAR(50) NOT NULL CHECK (classificacao_risco IN ('Sem Risco', 'Baixo Risco', 'Alto Risco')),
    
    -- Auditoria
    avaliador_id BIGINT NOT NULL,
    data_avaliacao TIMESTAMP NOT NULL,
    observacoes TEXT,
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_morse_paciente
        FOREIGN KEY (paciente_id) 
        REFERENCES pacientes (id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_morse_avaliador
        FOREIGN KEY (avaliador_id) 
        REFERENCES operador (id) 
        ON DELETE RESTRICT
);

-- Índices para otimização de queries
CREATE INDEX IF NOT EXISTS idx_morse_paciente ON escala_morse(paciente_id);
CREATE INDEX IF NOT EXISTS idx_morse_data_avaliacao ON escala_morse(data_avaliacao DESC);
CREATE INDEX IF NOT EXISTS idx_morse_classificacao ON escala_morse(classificacao_risco);
CREATE INDEX IF NOT EXISTS idx_morse_avaliador ON escala_morse(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_morse_pontuacao ON escala_morse(pontuacao_total DESC);

-- Comentários
COMMENT ON TABLE escala_morse IS 'Escala de Morse para avaliação de risco de quedas';
COMMENT ON COLUMN escala_morse.historico_quedas IS 'Histórico de quedas: 0=Não, 25=Sim';
COMMENT ON COLUMN escala_morse.diagnostico_secundario IS 'Diagnóstico secundário: 0=Não, 15=Sim';
COMMENT ON COLUMN escala_morse.auxilio_marcha IS 'Auxílio de marcha: 0=Nenhum, 15=Muletas/Bengala, 30=Mobiliário';
COMMENT ON COLUMN escala_morse.terapia_endovenosa IS 'Terapia endovenosa: 0=Não, 20=Sim';
COMMENT ON COLUMN escala_morse.marcha IS 'Marcha: 0=Normal, 10=Fraca, 20=Comprometida';
COMMENT ON COLUMN escala_morse.estado_mental IS 'Estado mental: 0=Orientado, 15=Esquece limitações';
COMMENT ON COLUMN escala_morse.pontuacao_total IS 'Pontuação total (0-125)';
COMMENT ON COLUMN escala_morse.classificacao_risco IS 'Classificação: Sem Risco (0-24), Baixo Risco (25-50), Alto Risco (>51)';

