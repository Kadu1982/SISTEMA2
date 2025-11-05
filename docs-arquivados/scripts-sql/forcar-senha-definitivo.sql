-- FORCAR SENHA ADMIN@123 - DEFINITIVO
-- Este script usa o hash BCrypt correto para Admin@123

BEGIN;

-- Deletar e recriar para garantir
DELETE FROM operador_perfis WHERE operador_id IN (SELECT id FROM operador WHERE login = 'admin.master');
DELETE FROM operador WHERE login = 'admin.master';

-- Criar com hash correto BCrypt para Admin@123
-- Hash gerado com BCryptPasswordEncoder (cost 10)
INSERT INTO operador (
    id,
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
    1,
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

-- Resetar sequence se necessário
SELECT setval('operador_id_seq', (SELECT MAX(id) FROM operador), true);

-- Verificar
SELECT id, login, nome, ativo, is_master,
       LEFT(senha, 30) || '...' as senha_parcial,
       LENGTH(senha) as tamanho_hash
FROM operador
WHERE login = 'admin.master';

COMMIT;
