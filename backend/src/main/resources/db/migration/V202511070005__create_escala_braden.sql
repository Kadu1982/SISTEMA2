-- =====================================================
-- Migration: Criar tabela escala_braden
-- Descrição: Escala de Braden para avaliação de risco de lesão por pressão
-- Data: 07/11/2025
-- =====================================================

CREATE TABLE IF NOT EXISTS escala_braden (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    
    -- Subescalas (1-4 pontos cada, exceto fricção 1-3)
    percepcao_sensorial INTEGER NOT NULL CHECK (percepcao_sensorial >= 1 AND percepcao_sensorial <= 4),
    umidade INTEGER NOT NULL CHECK (umidade >= 1 AND umidade <= 4),
    atividade INTEGER NOT NULL CHECK (atividade >= 1 AND atividade <= 4),
    mobilidade INTEGER NOT NULL CHECK (mobilidade >= 1 AND mobilidade <= 4),
    nutricao INTEGER NOT NULL CHECK (nutricao >= 1 AND nutricao <= 4),
    friccao_cisalhamento INTEGER NOT NULL CHECK (friccao_cisalhamento >= 1 AND friccao_cisalhamento <= 3),
    
    -- Resultado da avaliação
    pontuacao_total INTEGER NOT NULL CHECK (pontuacao_total >= 6 AND pontuacao_total <= 23),
    classificacao_risco VARCHAR(50) NOT NULL CHECK (classificacao_risco IN 
        ('Muito Alto Risco', 'Alto Risco', 'Risco Moderado', 'Baixo Risco', 'Sem Risco')),
    
    -- Auditoria
    avaliador_id BIGINT NOT NULL,
    data_avaliacao TIMESTAMP NOT NULL,
    observacoes TEXT,
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_braden_paciente
        FOREIGN KEY (paciente_id) 
        REFERENCES pacientes (id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_braden_avaliador
        FOREIGN KEY (avaliador_id) 
        REFERENCES operador (id) 
        ON DELETE RESTRICT
);

-- Índices para otimização de queries
CREATE INDEX IF NOT EXISTS idx_braden_paciente ON escala_braden(paciente_id);
CREATE INDEX IF NOT EXISTS idx_braden_data_avaliacao ON escala_braden(data_avaliacao DESC);
CREATE INDEX IF NOT EXISTS idx_braden_classificacao ON escala_braden(classificacao_risco);
CREATE INDEX IF NOT EXISTS idx_braden_avaliador ON escala_braden(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_braden_pontuacao ON escala_braden(pontuacao_total ASC);

-- Comentários
COMMENT ON TABLE escala_braden IS 'Escala de Braden para avaliação de risco de lesão por pressão';
COMMENT ON COLUMN escala_braden.percepcao_sensorial IS 'Percepção sensorial: 1=Totalmente limitado, 2=Muito limitado, 3=Levemente limitado, 4=Nenhuma limitação';
COMMENT ON COLUMN escala_braden.umidade IS 'Umidade: 1=Constantemente úmida, 2=Muito úmida, 3=Ocasionalmente úmida, 4=Raramente úmida';
COMMENT ON COLUMN escala_braden.atividade IS 'Atividade: 1=Acamado, 2=Confinado à cadeira, 3=Anda ocasionalmente, 4=Anda frequentemente';
COMMENT ON COLUMN escala_braden.mobilidade IS 'Mobilidade: 1=Totalmente imóvel, 2=Bastante limitado, 3=Levemente limitado, 4=Não apresenta limitações';
COMMENT ON COLUMN escala_braden.nutricao IS 'Nutrição: 1=Muito pobre, 2=Provavelmente inadequada, 3=Adequada, 4=Excelente';
COMMENT ON COLUMN escala_braden.friccao_cisalhamento IS 'Fricção e cisalhamento: 1=Problema, 2=Problema em potencial, 3=Nenhum problema';
COMMENT ON COLUMN escala_braden.pontuacao_total IS 'Pontuação total (6-23)';
COMMENT ON COLUMN escala_braden.classificacao_risco IS 'Classificação: ≤9=Muito Alto, 10-12=Alto, 13-14=Moderado, 15-18=Baixo, >18=Sem Risco';

