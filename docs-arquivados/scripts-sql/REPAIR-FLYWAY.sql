-- =====================================================
-- SCRIPT PARA REPARAR FLYWAY APÓS FALHA
-- =====================================================

-- 1. Verificar migrations com falha
SELECT
    installed_rank,
    version,
    description,
    success,
    installed_on
FROM flyway_schema_history
WHERE success = false
ORDER BY installed_rank DESC;

-- 2. REMOVER a migration que falhou (V202510051900)
-- Isto permitirá que ela seja executada novamente após a correção
DELETE FROM flyway_schema_history
WHERE version = '202510051900'
AND success = false;

-- 3. Verificar que foi removida
SELECT
    installed_rank,
    version,
    description,
    success
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 5;

-- Agora você pode executar novamente: mvnw.cmd spring-boot:run
