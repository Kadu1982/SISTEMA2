-- Atualizar admin.master com dados corretos do banco local
UPDATE operador
SET
    senha = '$2a$10$kMmDQ5VqzD5STYl19Mw83uYwstaNnc0soRuQz9JXfXjcz.XDMPu9q',
    nome = 'Administrador Master',
    cargo = 'Administrador do Sistema',
    cpf = '00000000000',
    email = NULL,
    ativo = true,
    is_master = true
WHERE login = 'admin.master';

-- Verificar se o update funcionou
SELECT id, login, nome, cargo, cpf, ativo, is_master,
       substring(senha, 1, 20) || '...' as senha_inicio
FROM operador
WHERE login = 'admin.master';
