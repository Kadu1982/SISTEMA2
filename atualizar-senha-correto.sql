-- ============================================================================
-- ATUALIZAR SENHA COM HASH CORRETO
-- ============================================================================
-- Este script atualiza a senha do admin.master com o hash CORRETO
-- Hash gerado e validado: $2a$10$kMmDQ5VqzD5STYI19Mw83uYwstaNnc0soRuQz9JXfXjcz.XDMPu9q
-- Senha: Admin@123
-- ============================================================================

BEGIN;

-- Atualizar senha com hash correto
UPDATE operador
SET senha = '$2a$10$kMmDQ5VqzD5STYI19Mw83uYwstaNnc0soRuQz9JXfXjcz.XDMPu9q',
    ativo = TRUE,
    is_master = TRUE
WHERE login = 'admin.master';

-- Verificar atualização
SELECT
    id,
    login,
    nome,
    ativo,
    is_master,
    LEFT(senha, 30) || '...' as senha_parcial,
    LENGTH(senha) as tamanho_hash,
    CASE
        WHEN senha = '$2a$10$kMmDQ5VqzD5STYI19Mw83uYwstaNnc0soRuQz9JXfXjcz.XDMPu9q'
        THEN 'HASH CORRETO ✓'
        ELSE 'HASH ERRADO ✗'
    END as status
FROM operador
WHERE login = 'admin.master';

COMMIT;
