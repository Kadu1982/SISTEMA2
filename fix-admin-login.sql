-- ============================================================================
-- Script para corrigir login do admin.master
-- Execute este script no PgAdmin conectado ao banco saude_db
-- ============================================================================

-- 1. Limpar migration falhada do histórico do Flyway
DELETE FROM flyway_schema_history
WHERE version = '202510052302' AND success = false;

-- 2. Verificar se o usuário admin.master existe
SELECT id, login, nome, ativo, is_master
FROM operador
WHERE login = 'admin.master';

-- 3. Atualizar senha do admin.master para Admin@123
-- Hash bcrypt: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
UPDATE operador
SET senha = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
    ativo = TRUE,
    is_master = TRUE
WHERE login = 'admin.master';

-- 4. Verificar se o perfil ADMINISTRADOR_SISTEMA está associado
SELECT op.operador_id, op.perfil_id, o.login
FROM operador_perfis op
JOIN operador o ON o.id = op.operador_id
WHERE o.login = 'admin.master';

-- 5. Adicionar perfil ADMINISTRADOR_SISTEMA se não existir
INSERT INTO operador_perfis (operador_id, perfil_id)
SELECT o.id, 'ADMINISTRADOR_SISTEMA'
FROM operador o
WHERE o.login = 'admin.master'
AND NOT EXISTS (
    SELECT 1 FROM operador_perfis op
    WHERE op.operador_id = o.id
    AND op.perfil_id = 'ADMINISTRADOR_SISTEMA'
);

-- 6. Verificar resultado final
SELECT
    o.id,
    o.login,
    o.nome,
    o.ativo,
    o.is_master,
    string_agg(op.perfil_id, ', ') as perfis
FROM operador o
LEFT JOIN operador_perfis op ON o.id = op.operador_id
WHERE o.login = 'admin.master'
GROUP BY o.id, o.login, o.nome, o.ativo, o.is_master;

-- ============================================================================
-- Resultado esperado:
-- - Migration falhada removida do histórico
-- - Usuário admin.master com senha atualizada
-- - Perfil ADMINISTRADOR_SISTEMA associado
-- - Login: admin.master
-- - Senha: Admin@123
-- ============================================================================
