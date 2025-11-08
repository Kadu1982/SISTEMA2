-- =====================================================
-- Migration: Criar tabela escala_fugulin
-- Descrição: Escala de Fugulin para classificação de carga de trabalho
-- Data: 07/11/2025
-- =====================================================

CREATE TABLE IF NOT EXISTS escala_fugulin (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    
    -- Indicadores (1-4 pontos cada, exceto terapêutica 1-5)
    estado_mental INTEGER NOT NULL CHECK (estado_mental >= 1 AND estado_mental <= 4),
    oxigenacao INTEGER NOT NULL CHECK (oxigenacao >= 1 AND oxigenacao <= 4),
    sinais_vitais INTEGER NOT NULL CHECK (sinais_vitais >= 1 AND sinais_vitais <= 4),
    motilidade INTEGER NOT NULL CHECK (motilidade >= 1 AND motilidade <= 4),
    deambulacao INTEGER NOT NULL CHECK (deambulacao >= 1 AND deambulacao <= 4),
    alimentacao INTEGER NOT NULL CHECK (alimentacao >= 1 AND alimentacao <= 4),
    cuidado_corporal INTEGER NOT NULL CHECK (cuidado_corporal >= 1 AND cuidado_corporal <= 4),
    eliminacao INTEGER NOT NULL CHECK (eliminacao >= 1 AND eliminacao <= 4),
    terapeutica INTEGER NOT NULL CHECK (terapeutica >= 1 AND terapeutica <= 5),
    
    -- Resultado da avaliação
    pontuacao_total INTEGER NOT NULL CHECK (pontuacao_total >= 13 AND pontuacao_total <= 37),
    classificacao_cuidado VARCHAR(50) NOT NULL CHECK (classificacao_cuidado IN 
        ('Cuidado Mínimo', 'Cuidado Intermediário', 'Cuidado de Alta Dependência', 
         'Cuidado Semi-Intensivo', 'Cuidado Intensivo')),
    
    -- Auditoria
    avaliador_id BIGINT NOT NULL,
    data_avaliacao TIMESTAMP NOT NULL,
    observacoes TEXT,
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_fugulin_paciente
        FOREIGN KEY (paciente_id) 
        REFERENCES pacientes (id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_fugulin_avaliador
        FOREIGN KEY (avaliador_id) 
        REFERENCES operador (id) 
        ON DELETE RESTRICT
);

-- Índices para otimização de queries
CREATE INDEX IF NOT EXISTS idx_fugulin_paciente ON escala_fugulin(paciente_id);
CREATE INDEX IF NOT EXISTS idx_fugulin_data_avaliacao ON escala_fugulin(data_avaliacao DESC);
CREATE INDEX IF NOT EXISTS idx_fugulin_classificacao ON escala_fugulin(classificacao_cuidado);
CREATE INDEX IF NOT EXISTS idx_fugulin_avaliador ON escala_fugulin(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_fugulin_pontuacao ON escala_fugulin(pontuacao_total DESC);

-- Comentários
COMMENT ON TABLE escala_fugulin IS 'Escala de Fugulin para classificação de pacientes e carga de trabalho';
COMMENT ON COLUMN escala_fugulin.estado_mental IS 'Estado mental: 1=Orientado, 2=Confuso/Sonolento, 3=Torporoso/Agitado, 4=Inconsciente';
COMMENT ON COLUMN escala_fugulin.oxigenacao IS 'Oxigenação: 1=Ar ambiente, 2=Cateter/Máscara, 3=Máscara com reservatório, 4=Ventilação mecânica';
COMMENT ON COLUMN escala_fugulin.sinais_vitais IS 'Sinais vitais: 1=Rotina (4/4h), 2=2/2h ou 3/3h, 3=1/1h, 4=Constante';
COMMENT ON COLUMN escala_fugulin.motilidade IS 'Motilidade: 1=Movimenta todos segmentos, 2=Dificuldade, 3=Apenas extremidades, 4=Imóvel';
COMMENT ON COLUMN escala_fugulin.deambulacao IS 'Deambulação: 1=Deambula, 2=Com auxílio, 3=Restrito leito/cadeira, 4=Restrito ao leito';
COMMENT ON COLUMN escala_fugulin.alimentacao IS 'Alimentação: 1=Auto-suficiente, 2=Necessita auxílio, 3=Sonda, 4=Parenteral';
COMMENT ON COLUMN escala_fugulin.cuidado_corporal IS 'Cuidado corporal: 1=Auto-suficiente, 2=Necessita auxílio, 3=Banho no leito, 4=Dependente total';
COMMENT ON COLUMN escala_fugulin.eliminacao IS 'Eliminação: 1=Auto-suficiente, 2=Necessita auxílio, 3=Incontinente/Sonda, 4=Evacuação no leito';
COMMENT ON COLUMN escala_fugulin.terapeutica IS 'Terapêutica: 1=VO/IM/SC, 2=EV contínua, 3=EV múltipla, 4=Quimioterapia, 5=Drogas vasoativas';
COMMENT ON COLUMN escala_fugulin.pontuacao_total IS 'Pontuação total (13-37)';
COMMENT ON COLUMN escala_fugulin.classificacao_cuidado IS 'Classificação: 13-17=Mínimo, 18-22=Intermediário, 23-27=Alta Dependência, 28-32=Semi-Intensivo, 33-37=Intensivo';

