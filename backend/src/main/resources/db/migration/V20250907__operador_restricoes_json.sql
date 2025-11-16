-- V20250907__operador_restricoes_json.sql
-- Tabela simples para guardar um JSON de restrições por operador (fase 1).
-- Nota: A tabela já existe na baseline com a coluna 'restricoes_json' (TEXT), não 'conteudo_json' (JSONB) e 'updated_at'

CREATE TABLE IF NOT EXISTS operador_restricoes_json (
    operador_id BIGINT PRIMARY KEY,
    restricoes_json TEXT,
    CONSTRAINT fk_operador_restricoes FOREIGN KEY (operador_id) REFERENCES operador(id) ON DELETE CASCADE
);

-- Índice apenas se a coluna updated_at existir (não existe na baseline)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'operador_restricoes_json' AND column_name = 'updated_at'
    ) THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orj_updated_at') THEN
            CREATE INDEX idx_orj_updated_at ON operador_restricoes_json(updated_at);
        END IF;
    END IF;
END $$;
