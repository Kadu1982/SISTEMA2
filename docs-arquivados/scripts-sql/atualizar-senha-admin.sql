-- Atualizar senha do admin.master para Admin@123
-- Hash BCrypt da senha Admin@123

UPDATE operador
SET senha = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'
WHERE login = 'admin.master';

-- Verificar
SELECT id, login, nome, ativo, is_master,
       LEFT(senha, 20) || '...' as senha_hash
FROM operador
WHERE login = 'admin.master';
