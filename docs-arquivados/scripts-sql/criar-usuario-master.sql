-- Criar usuario admin.master se nao existir
-- Senha: Admin@123 (hash bcrypt)

DO $$
BEGIN
    -- Primeiro, verificar se existe
    IF NOT EXISTS (SELECT 1 FROM operador WHERE login = 'admin.master') THEN
        -- Criar usuario
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

        RAISE NOTICE 'Usuario admin.master criado com sucesso!';
    ELSE
        -- Atualizar senha se ja existir
        UPDATE operador
        SET senha = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
            ativo = true,
            is_master = true
        WHERE login = 'admin.master';

        RAISE NOTICE 'Usuario admin.master atualizado!';
    END IF;
END $$;

-- Verificar resultado
SELECT id, login, nome, ativo, is_master
FROM operador
WHERE login = 'admin.master';
