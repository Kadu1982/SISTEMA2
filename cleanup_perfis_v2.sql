-- ============================================================
-- LIMPEZA AGRESSIVA DE PERFIS DUPLICADOS
-- ============================================================

-- 1. VISUALIZAR TODOS OS PERFIS COM DUPLICATAS
SELECT id, nome, nome_customizado, tipo, sistema_perfil, ativo
FROM perfis 
WHERE tipo IS NOT NULL
ORDER BY tipo, id;

-- 2. CONTAR QUANTOS DE CADA TIPO EXISTEM
SELECT tipo, COUNT(*) as quantidade, STRING_AGG(id::text, ', ') as ids
FROM perfis 
WHERE tipo IS NOT NULL
GROUP BY tipo 
ORDER BY quantidade DESC, tipo;

-- ============================================================
-- OPÇÃO 1: DELETAR TODOS OS DUPLICADOS (MAIS SIMPLES)
-- Mantém apenas o perfil com MENOR ID de cada tipo
-- ============================================================
DELETE FROM perfil_acesso_permissoes 
WHERE perfil_id IN (
    SELECT id FROM perfis 
    WHERE id NOT IN (
        SELECT MIN(id) 
        FROM perfis 
        WHERE tipo IS NOT NULL
        GROUP BY tipo
    ) AND tipo IS NOT NULL
);

DELETE FROM perfil_acesso_modulos 
WHERE perfil_id IN (
    SELECT id FROM perfis 
    WHERE id NOT IN (
        SELECT MIN(id) 
        FROM perfis 
        WHERE tipo IS NOT NULL
        GROUP BY tipo
    ) AND tipo IS NOT NULL
);

DELETE FROM perfis 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM perfis 
    WHERE tipo IS NOT NULL
    GROUP BY tipo
) AND tipo IS NOT NULL;

-- 3. DELETAR PERFIS COM TIPO NULL
DELETE FROM perfil_acesso_permissoes 
WHERE perfil_id IN (SELECT id FROM perfis WHERE tipo IS NULL);

DELETE FROM perfil_acesso_modulos 
WHERE perfil_id IN (SELECT id FROM perfis WHERE tipo IS NULL);

DELETE FROM perfis WHERE tipo IS NULL;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

-- 4. CONTAR PERFIS POR TIPO (deve mostrar 1 ou 2 de cada)
SELECT tipo, COUNT(*) as quantidade, STRING_AGG(id::text, ', ') as ids
FROM perfis 
WHERE tipo IS NOT NULL
GROUP BY tipo 
HAVING COUNT(*) > 1;
-- Se não retornar nada = sucesso!

-- 5. VER TODOS OS PERFIS RESTANTES
SELECT id, nome, nome_customizado, tipo, sistema_perfil, ativo, 
       (SELECT COUNT(*) FROM perfil_acesso_permissoes pap WHERE pap.perfil_id = perfis.id) as num_permissoes
FROM perfis 
ORDER BY tipo, id;

