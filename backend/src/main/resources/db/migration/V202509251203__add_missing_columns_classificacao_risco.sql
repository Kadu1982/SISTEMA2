-- Adicionar todas as colunas que podem estar faltando na tabela classificacao_risco
-- Nota: A tabela classificacao_risco não existe na baseline, então esta migration não precisa ser executada

DO $$
BEGIN
    -- Verificar se a tabela existe antes de adicionar colunas
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'classificacao_risco'
    ) THEN
        -- Verificar e adicionar coluna protocolo_utilizado se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='protocolo_utilizado') THEN
            ALTER TABLE classificacao_risco ADD COLUMN protocolo_utilizado VARCHAR(50);
        END IF;

        -- Verificar e adicionar coluna queixa_principal se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='queixa_principal') THEN
            ALTER TABLE classificacao_risco ADD COLUMN queixa_principal TEXT;
        END IF;
        
        -- Verificar e adicionar coluna observacoes_abordagem se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='observacoes_abordagem') THEN
            ALTER TABLE classificacao_risco ADD COLUMN observacoes_abordagem TEXT;
        END IF;
        
        -- Verificar e adicionar coluna medicamentos_uso se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='medicamentos_uso') THEN
            ALTER TABLE classificacao_risco ADD COLUMN medicamentos_uso TEXT;
        END IF;
        
        -- Verificar e adicionar coluna reacoes_alergicas se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='reacoes_alergicas') THEN
            ALTER TABLE classificacao_risco ADD COLUMN reacoes_alergicas TEXT;
        END IF;
        
        -- Verificar e adicionar coluna sinais_vitais se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='sinais_vitais') THEN
            ALTER TABLE classificacao_risco ADD COLUMN sinais_vitais TEXT;
        END IF;
        
        -- Verificar e adicionar coluna sintoma_principal se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='sintoma_principal') THEN
            ALTER TABLE classificacao_risco ADD COLUMN sintoma_principal TEXT;
        END IF;
        
        -- Verificar e adicionar coluna escala_dor se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='escala_dor') THEN
            ALTER TABLE classificacao_risco ADD COLUMN escala_dor INTEGER;
        END IF;
        
        -- Verificar e adicionar coluna tempo_max_espera se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='tempo_max_espera') THEN
            ALTER TABLE classificacao_risco ADD COLUMN tempo_max_espera INTEGER;
        END IF;
        
        -- Verificar e adicionar coluna especialidade_sugerida se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='especialidade_sugerida') THEN
            ALTER TABLE classificacao_risco ADD COLUMN especialidade_sugerida VARCHAR(255);
        END IF;
        
        -- Verificar e adicionar coluna risco_sepse se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='risco_sepse') THEN
            ALTER TABLE classificacao_risco ADD COLUMN risco_sepse BOOLEAN DEFAULT false;
        END IF;
        
        -- Verificar e adicionar coluna reavaliacao se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='reavaliacao') THEN
            ALTER TABLE classificacao_risco ADD COLUMN reavaliacao BOOLEAN DEFAULT false;
        END IF;
        
        -- Verificar e adicionar coluna observacoes_gerais se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classificacao_risco' AND column_name='observacoes_gerais') THEN
            ALTER TABLE classificacao_risco ADD COLUMN observacoes_gerais TEXT;
        END IF;
    END IF;
END $$;