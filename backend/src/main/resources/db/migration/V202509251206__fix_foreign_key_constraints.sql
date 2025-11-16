-- Fix foreign key constraints for classificacao_risco table
-- Nota: A tabela classificacao_risco não existe na baseline, então esta migration não precisa ser executada

-- First, add the missing columns if they don't exist
DO $$
BEGIN
    -- Verificar se a tabela existe antes de adicionar colunas
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'classificacao_risco'
    ) THEN
        -- Add operador_id if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='operador_id') THEN
            ALTER TABLE classificacao_risco ADD COLUMN operador_id BIGINT;
        END IF;

        -- Add paciente_id if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='paciente_id') THEN
            ALTER TABLE classificacao_risco ADD COLUMN paciente_id BIGINT;
        END IF;
    END IF;
END $$;

-- Now add foreign key constraints only if they don't exist
DO $$
BEGIN
    -- Verificar se a tabela existe antes de adicionar constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'classificacao_risco'
    ) THEN
        -- Add foreign key for operador_id if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_classificacao_risco_operador'
            AND table_name = 'classificacao_risco'
        ) THEN
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'operador') THEN
                ALTER TABLE classificacao_risco
                ADD CONSTRAINT fk_classificacao_risco_operador
                FOREIGN KEY (operador_id) REFERENCES operador(id);
            END IF;
        END IF;

        -- Add foreign key for paciente_id if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_classificacao_risco_paciente'
            AND table_name = 'classificacao_risco'
        ) THEN
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'paciente') THEN
                ALTER TABLE classificacao_risco
                ADD CONSTRAINT fk_classificacao_risco_paciente
                FOREIGN KEY (paciente_id) REFERENCES paciente(id);
            END IF;
        END IF;
    END IF;
END $$;