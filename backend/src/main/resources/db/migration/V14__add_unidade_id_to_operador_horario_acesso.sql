ALTER TABLE operador_horarios_acesso
    ADD COLUMN IF NOT EXISTS unidade_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_operador_horario_unidade
    ON operador_horarios_acesso (operador_id, unidade_id);
