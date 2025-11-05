-- Corrige os perfis existentes que não têm o campo 'tipo' preenchido
-- Este script é mais direto e garante que todos os perfis tenham o campo tipo preenchido

-- Primeiro, atualiza os perfis baseado no nome
UPDATE perfis 
SET tipo = 'ADMINISTRADOR_DO_SISTEMA' 
WHERE nome = 'ADMINISTRADOR_SISTEMA' AND (tipo IS NULL OR tipo = '');

UPDATE perfis 
SET tipo = 'RECEPCIONISTA' 
WHERE nome = 'RECEPCIONISTA' AND (tipo IS NULL OR tipo = '');

UPDATE perfis 
SET tipo = 'MEDICO' 
WHERE nome = 'MEDICO' AND (tipo IS NULL OR tipo = '');

UPDATE perfis 
SET tipo = 'ENFERMEIRO' 
WHERE nome = 'ENFERMEIRO' AND (tipo IS NULL OR tipo = '');

UPDATE perfis 
SET tipo = 'FARMACEUTICO' 
WHERE nome = 'FARMACEUTICO' AND (tipo IS NULL OR tipo = '');

UPDATE perfis 
SET tipo = 'DENTISTA' 
WHERE nome = 'DENTISTA' AND (tipo IS NULL OR tipo = '');

UPDATE perfis 
SET tipo = 'TECNICO_ENFERMAGEM' 
WHERE nome = 'TECNICO_ENFERMAGEM' AND (tipo IS NULL OR tipo = '');

UPDATE perfis 
SET tipo = 'TECNICO_HIGIENE_DENTAL' 
WHERE nome = 'TECNICO_HIGIENE_DENTAL' AND (tipo IS NULL OR tipo = '');

UPDATE perfis 
SET tipo = 'GESTOR' 
WHERE nome = 'GESTOR' AND (tipo IS NULL OR tipo = '');

UPDATE perfis 
SET tipo = 'USUARIO_SISTEMA' 
WHERE nome = 'USUARIO_SISTEMA' AND (tipo IS NULL OR tipo = '');

-- Para perfis que não foram mapeados, define um padrão (USUARIO_SISTEMA)
UPDATE perfis 
SET tipo = 'USUARIO_SISTEMA' 
WHERE tipo IS NULL OR tipo = '';

-- Garante que a coluna 'tipo' seja NOT NULL após a atualização
-- Primeiro remove o NOT NULL se existir
DO $$
BEGIN
    -- Tenta alterar a coluna para permitir NULL temporariamente
    ALTER TABLE perfis ALTER COLUMN tipo DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN 
        -- Se já não for NOT NULL, não faz nada
        NULL;
END $$;

-- Agora atualiza qualquer NULL restante
UPDATE perfis 
SET tipo = 'USUARIO_SISTEMA' 
WHERE tipo IS NULL OR tipo = '';

-- Adiciona NOT NULL novamente (agora que todos têm valor)
ALTER TABLE perfis ALTER COLUMN tipo SET NOT NULL;

