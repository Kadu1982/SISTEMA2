-- Migration para inserir operador master
-- Senha: Admin@123 (bcrypt hash correto)

-- Inserir operador master se não existir - SEM unidade obrigatória
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
)
SELECT
    'admin.master',
    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
    'Administrador Master',
    'Administrador do Sistema',
    '00000000000',
    TRUE,
    TRUE,
    NOW(),
    'sistema'
WHERE NOT EXISTS (SELECT 1 FROM operador WHERE login = 'admin.master');

-- Inserir perfis para o operador master
INSERT INTO operador_perfis (operador_id, perfil)
SELECT o.id, 'ADMINISTRADOR_SISTEMA'
FROM operador o
WHERE o.login = 'admin.master'
  AND NOT EXISTS (
    SELECT 1 FROM operador_perfis op
    WHERE op.operador_id = o.id AND op.perfil = 'ADMINISTRADOR_SISTEMA'
);

-- Inserir unidade padrão para o operador master
INSERT INTO operador_unidade (operador_id, unidade_id)
SELECT o.id, u.id
FROM operador o
CROSS JOIN unidades_saude u
WHERE o.login = 'admin.master'
  AND u.id = 1 -- ID da unidade padrão
  AND NOT EXISTS (
    SELECT 1 FROM operador_unidade ou
    WHERE ou.operador_id = o.id AND ou.unidade_id = u.id
);
