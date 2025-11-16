-- Corrige os perfis existentes que não têm o campo 'tipo' preenchido
-- Mapeia o nome do perfil para o enum correto

-- Adiciona a coluna 'tipo' se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfis' AND column_name = 'tipo'
    ) THEN
        ALTER TABLE perfis ADD COLUMN tipo VARCHAR(20);
    END IF;
END $$;

UPDATE perfis SET tipo = 'ADMINISTRADOR_DO_SISTEMA' WHERE nome = 'ADMINISTRADOR_SISTEMA' AND (tipo IS NULL OR tipo = '');
UPDATE perfis SET tipo = 'RECEPCIONISTA' WHERE nome = 'RECEPCIONISTA' AND (tipo IS NULL OR tipo = '');
UPDATE perfis SET tipo = 'MEDICO' WHERE nome = 'MEDICO' AND (tipo IS NULL OR tipo = '');
UPDATE perfis SET tipo = 'ENFERMEIRO' WHERE nome = 'ENFERMEIRO' AND (tipo IS NULL OR tipo = '');
UPDATE perfis SET tipo = 'FARMACEUTICO' WHERE nome = 'FARMACEUTICO' AND (tipo IS NULL OR tipo = '');
UPDATE perfis SET tipo = 'DENTISTA' WHERE nome = 'DENTISTA' AND (tipo IS NULL OR tipo = '');
UPDATE perfis SET tipo = 'TECNICO_ENFERMAGEM' WHERE nome = 'TECNICO_ENFERMAGEM' AND (tipo IS NULL OR tipo = '');
UPDATE perfis SET tipo = 'TECNICO_HIGIENE_DENTAL' WHERE nome = 'TECNICO_HIGIENE_DENTAL' AND (tipo IS NULL OR tipo = '');
UPDATE perfis SET tipo = 'GESTOR' WHERE nome = 'GESTOR' AND (tipo IS NULL OR tipo = '');
UPDATE perfis SET tipo = 'USUARIO_SISTEMA' WHERE nome = 'USUARIO_SISTEMA' AND (tipo IS NULL OR tipo = '');

-- Para perfis que não foram mapeados, define um padrão (USUARIO_SISTEMA)
UPDATE perfis SET tipo = 'USUARIO_SISTEMA' WHERE tipo IS NULL OR tipo = '';

-- Garante que a coluna 'tipo' seja NOT NULL após a atualização
-- (Remove o NOT NULL temporariamente se necessário, depois adiciona novamente)
DO $$
BEGIN
    -- Remove NOT NULL se existir
    ALTER TABLE perfis ALTER COLUMN tipo DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL; -- Ignora erro se NOT NULL não existir
END $$;

-- Adiciona NOT NULL novamente (agora que todos têm valor)
ALTER TABLE perfis ALTER COLUMN tipo SET NOT NULL;

