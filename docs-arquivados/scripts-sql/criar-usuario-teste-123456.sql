-- Criar usuário de teste com senha simples: 123456
-- Hash BCrypt para "123456"

DELETE FROM operador WHERE login = 'teste';

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
    'teste',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye1cLnqNJb/1t6JvZ8nXXjJLWzqv.jXGy',
    'Usuario Teste',
    'Teste',
    '11111111111',
    true,
    false,
    NOW(),
    'sistema'
);

-- Verificar
SELECT id, login, nome, ativo, LEFT(senha, 30) || '...' as senha_hash
FROM operador
WHERE login IN ('admin.master', 'teste')
ORDER BY login;
