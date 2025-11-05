@echo off
echo ========================================
echo SCRIPT DE CORRECAO DO BANCO DE DADOS
echo ========================================
echo.

echo Configurando variaveis de ambiente...
set PGPASSWORD=123456
set SPRING_PROFILES_ACTIVE=dev

echo.
echo [1/3] Limpando o banco de dados...
psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS sistema_saude;"
if %ERRORLEVEL% NEQ 0 (
    echo ERRO ao dropar banco de dados!
    pause
    exit /b 1
)

echo.
echo [2/3] Criando banco de dados limpo...
psql -U postgres -d postgres -c "CREATE DATABASE sistema_saude WITH OWNER = postgres ENCODING = 'UTF8';"
if %ERRORLEVEL% NEQ 0 (
    echo ERRO ao criar banco de dados!
    pause
    exit /b 1
)

echo.
echo [3/3] Banco de dados recriado com sucesso!
echo.
echo Agora execute a aplicacao Spring Boot para aplicar as migrations.
echo Use o comando: mvnw.cmd spring-boot:run
echo.
pause
