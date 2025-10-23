@echo off
echo ================================================
echo REPARO FLYWAY E EXECUCAO DA APLICACAO - V2
echo ================================================
echo.

echo Instrucoes:
echo 1. Abra o PgAdmin
echo 2. Conecte ao banco saude_db
echo 3. Execute o seguinte SQL:
echo.
echo DELETE FROM flyway_schema_history
echo WHERE version IN ('202510052000')
echo AND success = false;
echo.
echo 4. Depois execute este batch novamente para iniciar a aplicacao
echo.

pause

echo.
echo Executando aplicacao Spring Boot...
echo.

call mvnw.cmd spring-boot:run

pause
