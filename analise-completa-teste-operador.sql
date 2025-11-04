-- ============================================================================
-- ANÁLISE COMPLETA: teste.operador (Ana Paula Branco)
-- ============================================================================

\echo '============================================================================'
\echo '1. DADOS BÁSICOS DO OPERADOR'
\echo '============================================================================'
SELECT
    id,
    login,
    nome,
    cargo,
    cpf,
    ativo,
    is_master,
    unidade_saude_id,
    data_criacao
FROM operador
WHERE login = 'teste.operador';

\echo ''
\echo '============================================================================'
\echo '2. UNIDADE DE SAÚDE ASSOCIADA'
\echo '============================================================================'
SELECT
    o.login,
    o.unidade_saude_id,
    us.id AS unidade_id,
    us.nome AS unidade_nome,
    us.tipo AS unidade_tipo,
    us.ativo AS unidade_ativa
FROM operador o
LEFT JOIN unidade_saude us ON o.unidade_saude_id = us.id
WHERE o.login = 'teste.operador';

\echo ''
\echo '============================================================================'
\echo '3. PERFIS ASSOCIADOS (operador_perfis)'
\echo '============================================================================'
SELECT
    o.login,
    op.perfil AS perfil_varchar
FROM operador o
JOIN operador_perfis op ON o.id = op.operador_id
WHERE o.login = 'teste.operador'
ORDER BY op.perfil;

\echo ''
\echo '============================================================================'
\echo '4. PERFIS NA TABELA perfis (com módulos)'
\echo '============================================================================'
SELECT
    p.id,
    p.tipo,
    p.nome,
    p.ativo,
    STRING_AGG(DISTINCT pam.modulo, ', ') AS modulos
FROM perfis p
LEFT JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
WHERE p.tipo IN (
    SELECT perfil FROM operador_perfis WHERE operador_id = (
        SELECT id FROM operador WHERE login = 'teste.operador'
    )
)
GROUP BY p.id, p.tipo, p.nome, p.ativo
ORDER BY p.tipo;

\echo ''
\echo '============================================================================'
\echo '5. MÓDULOS DISPONÍVEIS PARA CADA PERFIL'
\echo '============================================================================'
SELECT
    op.perfil,
    p.id AS perfil_id,
    pam.modulo
FROM operador o
JOIN operador_perfis op ON o.id = op.operador_id
LEFT JOIN perfis p ON op.perfil = p.tipo
LEFT JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
WHERE o.login = 'teste.operador'
ORDER BY op.perfil, pam.modulo;

\echo ''
\echo '============================================================================'
\echo '6. PERMISSÕES DE CADA PERFIL'
\echo '============================================================================'
SELECT
    op.perfil,
    p.id AS perfil_id,
    COUNT(pap.permissao) AS total_permissoes,
    STRING_AGG(pap.permissao, ', ' ORDER BY pap.permissao) AS permissoes
FROM operador o
JOIN operador_perfis op ON o.id = op.operador_id
LEFT JOIN perfis p ON op.perfil = p.tipo
LEFT JOIN perfil_acesso_permissoes pap ON p.id = pap.perfil_id
WHERE o.login = 'teste.operador'
GROUP BY op.perfil, p.id
ORDER BY op.perfil;

\echo ''
\echo '============================================================================'
\echo '7. VERIFICAR SE PERFIL "UPA" EXISTE NA TABELA perfis'
\echo '============================================================================'
SELECT
    id,
    tipo,
    nome,
    ativo
FROM perfis
WHERE tipo = 'UPA';

\echo ''
\echo '============================================================================'
\echo '8. COMPARAÇÃO: Perfis em operador_perfis vs perfis'
\echo '============================================================================'
SELECT
    op.perfil AS perfil_varchar,
    CASE
        WHEN p.id IS NOT NULL THEN 'Existe na tabela perfis (ID=' || p.id || ')'
        ELSE '❌ NÃO EXISTE na tabela perfis'
    END AS status
FROM (
    SELECT DISTINCT perfil
    FROM operador_perfis
    WHERE operador_id = (SELECT id FROM operador WHERE login = 'teste.operador')
) op
LEFT JOIN perfis p ON op.perfil = p.tipo
ORDER BY op.perfil;

\echo ''
\echo '============================================================================'
\echo '9. RESUMO FINAL'
\echo '============================================================================'
SELECT
    'Operador' AS item,
    o.login AS valor
FROM operador o
WHERE o.login = 'teste.operador'
UNION ALL
SELECT
    'Total de Perfis',
    COUNT(*)::TEXT
FROM operador_perfis
WHERE operador_id = (SELECT id FROM operador WHERE login = 'teste.operador')
UNION ALL
SELECT
    'Perfis com Módulos',
    COUNT(DISTINCT op.perfil)::TEXT
FROM operador_perfis op
JOIN perfis p ON op.perfil = p.tipo
JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
WHERE op.operador_id = (SELECT id FROM operador WHERE login = 'teste.operador')
UNION ALL
SELECT
    'Perfis SEM Módulos',
    COUNT(DISTINCT op.perfil)::TEXT
FROM operador_perfis op
LEFT JOIN perfis p ON op.perfil = p.tipo
WHERE op.operador_id = (SELECT id FROM operador WHERE login = 'teste.operador')
AND NOT EXISTS (
    SELECT 1 FROM perfil_acesso_modulos pam WHERE pam.perfil_id = p.id
);
