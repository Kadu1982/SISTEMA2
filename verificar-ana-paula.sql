-- ============================================================================
-- Script: Verificar e Corrigir Operador Ana Paula Branco
-- ============================================================================

-- 1. VERIFICAR OPERADOR
SELECT
    id,
    login,
    nome,
    ativo,
    is_master,
    data_criacao
FROM operador
WHERE nome ILIKE '%Ana Paula%' OR login ILIKE '%ana%paula%';

-- 2. VERIFICAR PERFIS DO OPERADOR
SELECT
    o.nome AS operador_nome,
    p.nome AS perfil_nome,
    p.tipo AS perfil_tipo
FROM operador o
LEFT JOIN operador_perfis op ON o.id = op.operador_id
LEFT JOIN perfis p ON op.perfil_id = p.id
WHERE o.nome ILIKE '%Ana Paula%';

-- 3. VERIFICAR MÓDULOS ASSOCIADOS AOS PERFIS DO OPERADOR
SELECT
    o.nome AS operador_nome,
    p.nome AS perfil_nome,
    pam.modulo
FROM operador o
LEFT JOIN operador_perfis op ON o.id = op.operador_id
LEFT JOIN perfis p ON op.perfil_id = p.id
LEFT JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
WHERE o.nome ILIKE '%Ana Paula%';

-- 4. VERIFICAR TODOS OS MÓDULOS DISPONÍVEIS
SELECT DISTINCT modulo
FROM perfil_acesso_modulos
ORDER BY modulo;

-- 5. VERIFICAR TODOS OS PERFIS DISPONÍVEIS
SELECT
    id,
    nome,
    tipo,
    ativo,
    sistema_perfil
FROM perfis
WHERE ativo = TRUE
ORDER BY id;
