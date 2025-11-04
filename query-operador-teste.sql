-- ============================================================================
-- QUERY COMPLETA: Análise do Operador operador.teste (Ana Paula Branco)
-- ============================================================================

\echo '============================================================================'
\echo 'ANÁLISE COMPLETA DO OPERADOR: operador.teste'
\echo '============================================================================'

\echo ''
\echo '1. DADOS BÁSICOS DO OPERADOR'
\echo '----------------------------'
SELECT
    id,
    login,
    nome,
    cargo,
    cpf,
    ativo,
    is_master,
    unidade_saude_id,
    data_criacao,
    criado_por
FROM operador
WHERE login = 'operador.teste' OR nome ILIKE '%Ana Paula%';

\echo ''
\echo '2. PERFIS ASSOCIADOS'
\echo '----------------------------'
SELECT
    o.id AS operador_id,
    o.login,
    o.nome AS operador_nome,
    p.id AS perfil_id,
    p.tipo AS perfil_tipo,
    p.nome AS perfil_nome,
    p.ativo AS perfil_ativo
FROM operador o
LEFT JOIN operador_perfis op ON o.id = op.operador_id
LEFT JOIN perfis p ON op.perfil_id = p.id
WHERE o.login = 'operador.teste' OR o.nome ILIKE '%Ana Paula%';

\echo ''
\echo '3. MÓDULOS DISPONÍVEIS (via perfis)'
\echo '----------------------------'
SELECT
    o.login,
    p.tipo AS perfil_tipo,
    pam.modulo
FROM operador o
JOIN operador_perfis op ON o.id = op.operador_id
JOIN perfis p ON op.perfil_id = p.id
JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
WHERE o.login = 'operador.teste' OR o.nome ILIKE '%Ana Paula%';

\echo ''
\echo '4. PERMISSÕES (via perfis)'
\echo '----------------------------'
SELECT
    o.login,
    p.tipo AS perfil_tipo,
    pap.permissao
FROM operador o
JOIN operador_perfis op ON o.id = op.operador_id
JOIN perfis p ON op.perfil_id = p.id
LEFT JOIN perfil_acesso_permissoes pap ON p.id = pap.perfil_id
WHERE o.login = 'operador.teste' OR o.nome ILIKE '%Ana Paula%'
ORDER BY p.tipo, pap.permissao;

\echo ''
\echo '5. UNIDADE DE SAÚDE'
\echo '----------------------------'
SELECT
    o.login,
    o.unidade_saude_id,
    us.nome AS unidade_nome,
    us.tipo AS unidade_tipo,
    us.ativo AS unidade_ativa
FROM operador o
LEFT JOIN unidade_saude us ON o.unidade_saude_id = us.id
WHERE o.login = 'operador.teste' OR o.nome ILIKE '%Ana Paula%';

\echo ''
\echo '6. VERIFICAÇÃO: Perfil ENFERMEIRO tem módulo UPA?'
\echo '----------------------------'
SELECT
    p.id AS perfil_id,
    p.tipo,
    p.nome,
    pam.modulo
FROM perfis p
LEFT JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
WHERE p.tipo = 'ENFERMEIRO';

\echo ''
\echo '7. TODOS OS MÓDULOS DISPONÍVEIS NO SISTEMA'
\echo '----------------------------'
SELECT DISTINCT
    p.tipo AS perfil_tipo,
    pam.modulo
FROM perfis p
JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
ORDER BY pam.modulo;

\echo ''
\echo '============================================================================'
\echo 'FIM DA ANÁLISE'
\echo '============================================================================'
