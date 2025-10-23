@echo off
echo ================================================
echo REPARO FLYWAY E EXECUCAO DA APLICACAO
echo ================================================
echo.

echo [1/3] Removendo migration falhada do historico Flyway...
echo.

REM Configurar senha do PostgreSQL
set PGPASSWORD=123456

REM Executar comando SQL para remover migration falhada
psql -U postgres -d saude_db -c "DELETE FROM flyway_schema_history WHERE version = '202510051900' AND success = false;"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Nao foi possivel conectar ao PostgreSQL.
    echo.
    echo Por favor, execute manualmente no PgAdmin:
    echo DELETE FROM flyway_schema_history WHERE version = '202510051900' AND success = false;
    echo.
    echo Depois execute: mvnw.cmd spring-boot:run
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Verificando historico...
psql -U postgres -d saude_db -c "SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 3;"

echo.
echo [3/3] Executando aplicacao Spring Boot...
echo.

call mvnw.cmd spring-boot:run

pause
