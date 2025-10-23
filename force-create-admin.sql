-- FORCAR CRIACAO DO USUARIO ADMIN.MASTER
-- Execute este SQL diretamente no pgAdmin ou DBeaver

-- Deletar se existir
DELETE FROM operador_perfis WHERE operador_id IN (SELECT id FROM operador WHERE login = 'admin.master');
DELETE FROM operador WHERE login = 'admin.master';

-- Criar novamente
INSERT INTO operador (
    login, senha, nome, cargo, cpf,
    ativo, is_master, data_criacao, criado_por
) VALUES (
    'admin.master',
    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
    'Administrador Master',
    'Administrador do Sistema',
    '00000000000',
    true,
    true,
    NOW(),
    'sistema'
);

-- Adicionar perfil se a tabela existir
INSERT INTO operador_perfis (operador_id, perfil_id)
SELECT o.id, p.id
FROM operador o
CROSS JOIN perfis p
WHERE o.login = 'admin.master'
  AND p.nome = 'ADMINISTRADOR_SISTEMA'
ON CONFLICT DO NOTHING;

-- Verificar
SELECT id, login, nome, ativo, is_master FROM operador WHERE login = 'admin.master';
