@echo off
:: ========================================================
:: Script para marcar a baseline como aplicada no banco
:: ========================================================

echo.
echo ========================================================
echo  MARCANDO BASELINE COMO APLICADA NO BANCO
echo ========================================================
echo.
echo Este script vai marcar a baseline V999999999999 como
echo ja aplicada no seu banco de dados atual.
echo.
echo Isso evita que ela tente executar novamente.
echo.
echo ========================================================
echo.

:: Configurar senha do PostgreSQL
set PGPASSWORD=123456

:: Executar script SQL
echo Executando script SQL...
echo.

"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d saude_db -f marcar_baseline_aplicada.sql

:: Verificar resultado
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  SUCESSO! Baseline marcada como aplicada.
    echo ========================================================
    echo.
    echo Proximos passos:
    echo   1. Feche esta janela
    echo   2. Execute: mvnw.cmd clean spring-boot:run
    echo.
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo  ERRO ao executar script!
    echo ========================================================
    echo.
    echo Verifique:
    echo   1. PostgreSQL esta rodando
    echo   2. Banco saude_db existe
    echo   3. Senha do postgres esta correta (123456)
    echo.
    echo ========================================================
)

echo.
pause
