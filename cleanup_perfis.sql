-- ============================================================
-- LIMPEZA DE PERFIS DUPLICADOS NO BANCO DE DADOS
-- ============================================================
-- Este script remove perfis duplicados mantendo apenas UM de cada tipo

-- 1. VISUALIZAR perfis duplicados
SELECT tipo, COUNT(*) as quantidade, STRING_AGG(id::text, ', ') as ids
FROM perfis 
WHERE tipo IS NOT NULL
GROUP BY tipo 
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- 2. REMOVER perfis duplicados (mantém o de MENOR id)
DELETE FROM perfis 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM perfis 
    WHERE tipo IS NOT NULL
    GROUP BY tipo
) AND tipo IS NOT NULL;

-- 3. REMOVER perfis com tipo NULL (se houver)
DELETE FROM perfis WHERE tipo IS NULL;

-- 4. VERIFICAR o resultado final
SELECT id, nome, nome_customizado, tipo, sistema_perfil, ativo
FROM perfis 
ORDER BY tipo, id;

-- 5. VERIFICAR que cada tipo é único agora
SELECT tipo, COUNT(*) as quantidade
FROM perfis 
WHERE tipo IS NOT NULL
GROUP BY tipo 
HAVING COUNT(*) > 1;
-- Se não retornar nada, significa que não há mais duplicatas!

