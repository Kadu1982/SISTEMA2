-- ==================================================================
-- SCRIPT PARA MARCAR BASELINE COMO APLICADA (SEM EXECUTAR)
-- ==================================================================
-- Execute este script no seu banco de dados saude_db
-- Comando: psql -U postgres -d saude_db -f marcar_baseline_aplicada.sql
-- ==================================================================

-- Verificar versão atual ANTES
SELECT '=== VERSÕES ANTES ===' AS info;
SELECT version, description, installed_on, success
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 10;

-- Marcar baseline como aplicada
INSERT INTO flyway_schema_history (
    installed_rank,
    version,
    description,
    type,
    script,
    checksum,
    installed_by,
    installed_on,
    execution_time,
    success
) VALUES (
    (SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history),
    '999999999999',
    'baseline sistema saude',
    'SQL',
    'V999999999999__baseline_sistema_saude.sql',
    NULL,
    CURRENT_USER,
    NOW(),
    0,
    TRUE
) ON CONFLICT DO NOTHING;

-- Verificar se foi inserida
SELECT '=== BASELINE MARCADA ===' AS info;
SELECT version, description, installed_on, success
FROM flyway_schema_history
WHERE version = '999999999999';

-- Verificar versão atual DEPOIS
SELECT '=== VERSÕES DEPOIS ===' AS info;
SELECT version, description, installed_on, success
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 10;
