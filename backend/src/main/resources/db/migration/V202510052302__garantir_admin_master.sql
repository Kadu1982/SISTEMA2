-- ============================================================================
-- Migration: Garantir que admin.master existe com senha Admin@123
-- ============================================================================
-- PROBLEMA: O usuário admin.master pode não existir ou ter senha incorreta
-- Esta migration garante que o usuário existe e tem a senha correta
-- ============================================================================

-- Atualizar senha do usuário admin.master se já existir, caso contrário criar
-- Hash bcrypt para Admin@123: $2a$10$kMmDQ5VqzD5STYI19Mw83uYwstaNnc0soRuQz9JXfXjcz.XDMPu9q

DO $$
DECLARE
    admin_perfil_id BIGINT;
BEGIN
    -- Buscar o ID do perfil ADMINISTRADOR_SISTEMA
    SELECT id INTO admin_perfil_id FROM perfis WHERE nome = 'ADMINISTRADOR_SISTEMA';

    IF admin_perfil_id IS NULL THEN
        RAISE NOTICE 'Perfil ADMINISTRADOR_SISTEMA não encontrado.';
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM operador WHERE login = 'admin.master') THEN
        -- Atualizar senha do usuário existente
        UPDATE operador
        SET senha = '$2a$10$kMmDQ5VqzD5STYI19Mw83uYwstaNnc0soRuQz9JXfXjcz.XDMPu9q',
            ativo = TRUE,
            is_master = TRUE
        WHERE login = 'admin.master';

        -- Garantir que tem o perfil ADMINISTRADOR_SISTEMA
        INSERT INTO operador_perfis (operador_id, perfil_id)
        SELECT o.id, admin_perfil_id
        FROM operador o
        WHERE o.login = 'admin.master'
        AND NOT EXISTS (
            SELECT 1 FROM operador_perfis op
            WHERE op.operador_id = o.id
            AND op.perfil_id = admin_perfil_id
        );
    ELSE
        -- Criar novo usuário admin.master
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
            'admin.master',
            '$2a$10$kMmDQ5VqzD5STYI19Mw83uYwstaNnc0soRuQz9JXfXjcz.XDMPu9q',
            'Administrador Master',
            'Administrador do Sistema',
            '00000000000',
            TRUE,
            TRUE,
            NOW(),
            'sistema'
        );

        -- Adicionar perfil ADMINISTRADOR_SISTEMA
        INSERT INTO operador_perfis (operador_id, perfil_id)
        SELECT id, admin_perfil_id
        FROM operador
        WHERE login = 'admin.master';
    END IF;
END $$;
