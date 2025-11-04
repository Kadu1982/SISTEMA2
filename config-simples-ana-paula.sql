-- ============================================================================
-- SCRIPT SIMPLES: Configurar operador.teste com acesso UPA
-- ============================================================================
-- Execute este script no pgAdmin ou psql
-- ============================================================================

-- PASSO 1: Criar/atualizar operador
INSERT INTO operador (
    login,
    senha,
    nome,
    cargo,
    cpf,
    ativo,
    is_master,
    data_criacao,
    criado_por
) VALUES (
    'operador.teste',
    '$2b$10$6bDU05OeQ1rwYlMKJ7BufOuRXuQgxGJSSSWscn9UF6fVhPF/GSesG',
    'Ana Paula Branco',
    'Enfermeira UPA',
    '11111111111',
    TRUE,
    FALSE,
    NOW(),
    'sistema'
)
ON CONFLICT (login) DO UPDATE
SET senha = '$2b$10$6bDU05OeQ1rwYlMKJ7BufOuRXuQgxGJSSSWscn9UF6fVhPF/GSesG',
    ativo = TRUE;

-- PASSO 2: Criar perfil ENFERMEIRO (se não existir)
INSERT INTO perfis (tipo, nome, ativo, sistema_perfil, nome_customizado)
VALUES ('ENFERMEIRO', 'ENFERMEIRO', TRUE, FALSE, 'Enfermeiro(a)')
ON CONFLICT DO NOTHING;

-- PASSO 3: Associar operador ao perfil
INSERT INTO operador_perfis (operador_id, perfil_id)
SELECT o.id, p.id
FROM operador o, perfis p
WHERE o.login = 'operador.teste'
AND p.tipo = 'ENFERMEIRO'
ON CONFLICT DO NOTHING;

-- PASSO 4: Adicionar módulo UPA ao perfil ENFERMEIRO
INSERT INTO perfil_acesso_modulos (perfil_id, modulo)
SELECT p.id, 'UPA'
FROM perfis p
WHERE p.tipo = 'ENFERMEIRO'
ON CONFLICT DO NOTHING;

-- PASSO 5: Adicionar permissões
INSERT INTO perfil_acesso_permissoes (perfil_id, permissao)
SELECT p.id, perm
FROM perfis p, unnest(ARRAY[
    'ENFERMAGEM_ATENDER',
    'MEDICO_ATENDER',
    'VISUALIZAR_RELATORIOS',
    'GERENCIAR_PACIENTES',
    'GERENCIAR_ATENDIMENTOS',
    'UPA_ACESSAR',
    'UPA_ATENDER',
    'UPA_VISUALIZAR',
    'TRIAGEM_REALIZAR',
    'CLASSIFICACAO_RISCO'
]) AS perm
WHERE p.tipo = 'ENFERMEIRO'
ON CONFLICT DO NOTHING;

-- VERIFICAÇÃO
SELECT
    o.login,
    o.nome,
    o.ativo,
    p.tipo AS perfil,
    STRING_AGG(DISTINCT pam.modulo, ', ') AS modulos
FROM operador o
JOIN operador_perfis op ON o.id = op.operador_id
JOIN perfis p ON op.perfil_id = p.id
LEFT JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
WHERE o.login = 'operador.teste'
GROUP BY o.login, o.nome, o.ativo, p.tipo;
