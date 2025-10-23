-- Vamos tentar com uma senha simples: 123456
-- Hash BCrypt para "123456" com cost 10

UPDATE operador
SET senha = '$2a$10$N9qo8uLOickgx2ZMRZoMye1cLnqNJb/1t6JvZ8nXXjJLWzqv.jXGy'
WHERE login = 'admin.master';

-- Verificar
SELECT id, login, nome,
       LEFT(senha, 30) || '...' as senha_hash
FROM operador
WHERE login = 'admin.master';
