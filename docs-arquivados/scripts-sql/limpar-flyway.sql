-- Remover migration falhada V202510052300
DELETE FROM flyway_schema_history
WHERE version = '202510052300'
AND success = false;

-- Verificar últimas 5 migrations
SELECT version, description, success, installed_on
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 5;
