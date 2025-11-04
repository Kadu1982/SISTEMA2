-- Buscar operador com login teste.*
SELECT
    id,
    login,
    nome,
    cargo,
    ativo,
    unidade_saude_id
FROM operador
WHERE login ILIKE '%teste%';

-- Buscar por Ana Paula no nome
SELECT
    id,
    login,
    nome,
    cargo,
    ativo,
    unidade_saude_id
FROM operador
WHERE nome ILIKE '%ana%' OR nome ILIKE '%paula%';

-- Ver perfis do operador teste.operador
SELECT
    o.login,
    o.nome,
    p.tipo AS perfil_tipo,
    p.nome AS perfil_nome
FROM operador o
LEFT JOIN operador_perfis op ON o.id = op.operador_id
LEFT JOIN perfis p ON op.perfil_id = p.id
WHERE o.login ILIKE 'teste.operador';

-- Ver módulos disponíveis para teste.operador
SELECT
    o.login,
    p.tipo AS perfil_tipo,
    pam.modulo
FROM operador o
LEFT JOIN operador_perfis op ON o.id = op.operador_id
LEFT JOIN perfis p ON op.perfil_id = p.id
LEFT JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
WHERE o.login ILIKE 'teste.operador';
