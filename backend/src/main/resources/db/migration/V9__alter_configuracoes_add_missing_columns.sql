-- Ensure configuracoes table has all columns expected by the JPA entity
-- Adds missing columns: grupo, tipo, editavel, valores_possiveis
-- Safe for repeated runs using IF NOT EXISTS

ALTER TABLE configuracoes
    ADD COLUMN IF NOT EXISTS grupo VARCHAR(50);

ALTER TABLE configuracoes
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(20);

ALTER TABLE configuracoes
    ADD COLUMN IF NOT EXISTS editavel BOOLEAN DEFAULT TRUE;

ALTER TABLE configuracoes
    ADD COLUMN IF NOT EXISTS valores_possiveis TEXT;

-- Initialize editavel to TRUE where it is NULL (for existing rows)
UPDATE configuracoes SET editavel = TRUE WHERE editavel IS NULL;