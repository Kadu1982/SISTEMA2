@echo off
echo ========================================
echo CONFIGURANDO REDIS PARA SISTEMA SAUDE
echo ========================================

REM Verificar se Redis está instalado
redis-cli --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Redis nao encontrado. Instalando via Chocolatey...
    choco install redis-64 -y
    if %errorlevel% neq 0 (
        echo [ERRO] Falha na instalacao do Redis. Instale manualmente.
        echo Download: https://github.com/tporadowski/redis/releases
        pause
        exit /b 1
    )
)

echo [OK] Redis encontrado

REM Iniciar Redis Server
echo Iniciando Redis Server...
start "Redis Server" redis-server --daemonize yes

REM Aguardar Redis inicializar
timeout /t 3 >nul

REM Testar conexão
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Redis nao conseguiu inicializar
    pause
    exit /b 1
)

echo [OK] Redis iniciado com sucesso!

REM Configurar Redis para desenvolvimento
echo Configurando Redis para desenvolvimento...
redis-cli config set maxmemory 512mb
redis-cli config set maxmemory-policy allkeys-lru
redis-cli config set timeout 300

echo.
echo ========================================
echo REDIS CONFIGURADO COM SUCESSO!
echo ========================================
echo.
echo URLs de teste:
echo - Redis CLI: redis-cli
echo - Ping test: redis-cli ping
echo.
echo Configuracoes aplicadas:
echo - Max Memory: 512MB
echo - Policy: allkeys-lru
echo - Timeout: 300s
echo.
echo Pressione qualquer tecla para continuar...
pause >nul