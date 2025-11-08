-- =====================================================
-- Migration: Criar tabela escala_glasgow
-- Descrição: Escala de Glasgow para avaliação do nível de consciência
-- Data: 07/11/2025
-- =====================================================

CREATE TABLE IF NOT EXISTS escala_glasgow (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    
    -- Componentes da escala
    abertura_ocular INTEGER NOT NULL CHECK (abertura_ocular >= 1 AND abertura_ocular <= 4),
    resposta_verbal INTEGER NOT NULL CHECK (resposta_verbal >= 1 AND resposta_verbal <= 5),
    resposta_motora INTEGER NOT NULL CHECK (resposta_motora >= 1 AND resposta_motora <= 6),
    
    -- Resultado da avaliação
    pontuacao_total INTEGER NOT NULL CHECK (pontuacao_total >= 3 AND pontuacao_total <= 15),
    classificacao_nivel_consciencia VARCHAR(50) NOT NULL CHECK (classificacao_nivel_consciencia IN 
        ('Grave', 'Moderado', 'Leve')),
    
    -- Auditoria
    avaliador_id BIGINT NOT NULL,
    data_avaliacao TIMESTAMP NOT NULL,
    observacoes TEXT,
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_glasgow_paciente
        FOREIGN KEY (paciente_id) 
        REFERENCES pacientes (id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_glasgow_avaliador
        FOREIGN KEY (avaliador_id) 
        REFERENCES operador (id) 
        ON DELETE RESTRICT
);

-- Índices para otimização de queries
CREATE INDEX IF NOT EXISTS idx_glasgow_paciente ON escala_glasgow(paciente_id);
CREATE INDEX IF NOT EXISTS idx_glasgow_data_avaliacao ON escala_glasgow(data_avaliacao DESC);
CREATE INDEX IF NOT EXISTS idx_glasgow_classificacao ON escala_glasgow(classificacao_nivel_consciencia);
CREATE INDEX IF NOT EXISTS idx_glasgow_avaliador ON escala_glasgow(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_glasgow_pontuacao ON escala_glasgow(pontuacao_total ASC);

-- Comentários
COMMENT ON TABLE escala_glasgow IS 'Escala de Glasgow (GCS) para avaliação do nível de consciência';
COMMENT ON COLUMN escala_glasgow.abertura_ocular IS 'Abertura ocular: 1=Nenhuma, 2=À dor, 3=Ao comando verbal, 4=Espontânea';
COMMENT ON COLUMN escala_glasgow.resposta_verbal IS 'Resposta verbal: 1=Nenhuma, 2=Sons incompreensíveis, 3=Palavras inapropriadas, 4=Confuso, 5=Orientado';
COMMENT ON COLUMN escala_glasgow.resposta_motora IS 'Resposta motora: 1=Nenhuma, 2=Extensão anormal, 3=Flexão anormal, 4=Retirada à dor, 5=Localiza dor, 6=Obedece comandos';
COMMENT ON COLUMN escala_glasgow.pontuacao_total IS 'Pontuação total (3-15)';
COMMENT ON COLUMN escala_glasgow.classificacao_nivel_consciencia IS 'Classificação: 3-8=Grave, 9-12=Moderado, 13-15=Leve';

