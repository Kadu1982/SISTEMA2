-- =====================================================
-- Migration: Criar tabela escala_eva
-- Descrição: Escala EVA (Escala Visual Analógica) para avaliação de dor
-- Data: 07/11/2025
-- =====================================================

CREATE TABLE IF NOT EXISTS escala_eva (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    
    -- Pontuação da dor
    pontuacao_dor INTEGER NOT NULL CHECK (pontuacao_dor >= 0 AND pontuacao_dor <= 10),
    classificacao_dor VARCHAR(50) NOT NULL CHECK (classificacao_dor IN 
        ('Sem dor', 'Dor leve', 'Dor moderada', 'Dor intensa', 'Dor insuportável')),
    
    -- Detalhes da dor
    localizacao_dor VARCHAR(200),
    caracteristicas_dor TEXT,
    fatores_piora TEXT,
    fatores_melhora TEXT,
    
    -- Auditoria
    avaliador_id BIGINT NOT NULL,
    data_avaliacao TIMESTAMP NOT NULL,
    observacoes TEXT,
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_eva_paciente
        FOREIGN KEY (paciente_id) 
        REFERENCES pacientes (id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_eva_avaliador
        FOREIGN KEY (avaliador_id) 
        REFERENCES operador (id) 
        ON DELETE RESTRICT
);

-- Índices para otimização de queries
CREATE INDEX IF NOT EXISTS idx_eva_paciente ON escala_eva(paciente_id);
CREATE INDEX IF NOT EXISTS idx_eva_data_avaliacao ON escala_eva(data_avaliacao DESC);
CREATE INDEX IF NOT EXISTS idx_eva_classificacao ON escala_eva(classificacao_dor);
CREATE INDEX IF NOT EXISTS idx_eva_avaliador ON escala_eva(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_eva_pontuacao ON escala_eva(pontuacao_dor DESC);
CREATE INDEX IF NOT EXISTS idx_eva_localizacao ON escala_eva(localizacao_dor);

-- Comentários
COMMENT ON TABLE escala_eva IS 'Escala EVA (Visual Analog Scale) para avaliação de dor';
COMMENT ON COLUMN escala_eva.pontuacao_dor IS 'Pontuação da dor (0-10): 0=Sem dor, 10=Pior dor imaginável';
COMMENT ON COLUMN escala_eva.classificacao_dor IS 'Classificação: 0=Sem dor, 1-3=Leve, 4-6=Moderada, 7-9=Intensa, 10=Insuportável';
COMMENT ON COLUMN escala_eva.localizacao_dor IS 'Localização anatômica da dor';
COMMENT ON COLUMN escala_eva.caracteristicas_dor IS 'Características: pulsátil, latejante, queimação, pontada, etc.';
COMMENT ON COLUMN escala_eva.fatores_piora IS 'Fatores que pioram a dor';
COMMENT ON COLUMN escala_eva.fatores_melhora IS 'Fatores que melhoram a dor';

