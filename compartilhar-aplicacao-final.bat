@echo off
cd /d "%~dp0"
color 0A
echo ============================================
echo   COMPARTILHAR APLICACAO VIA CLOUDFLARE
echo   (Script DEFINITIVO - 100%% Funcional)
echo ============================================
echo.

REM Verificar cloudflared
where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Cloudflared nao encontrado!
    echo.
    echo Instale com: winget install --id Cloudflare.cloudflared
    pause
    exit /b 1
)

echo [!] IMPORTANTE: Certifique-se que:
echo     1. Backend rodando na porta 8080
echo     2. Banco de dados PostgreSQL conectado
echo     3. Usuario admin.master existe (senha: Admin@123)
echo     4. Docker Compose iniciado (docker-compose up -d)
echo.
echo Verificando aplicacao local...
curl -s http://localhost:8080/health > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo [AVISO] Backend nao esta respondendo em localhost:8080
    echo Iniciando com Docker Compose...
    docker-compose up -d
    timeout /t 30 >nul
) else (
    echo [OK] Backend local funcionando
)

curl -s http://localhost:4173 > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo [AVISO] Frontend nao esta respondendo em localhost:4173
    echo Iniciando frontend...
    start "Frontend Dev" cmd /k "cd frontend && npm run dev -- --port 4173 --host 0.0.0.0"
    timeout /t 20 >nul
) else (
    echo [OK] Frontend local funcionando
)

echo.
pause

REM Limpar configuracoes antigas
if exist "frontend\.env.local" del "frontend\.env.local"
if exist "frontend\.env.production.local" del "frontend\.env.production.local"

echo.
echo ============================================
echo   PASSO 1: TUNEL DO BACKEND
echo ============================================
start "Backend Tunnel" cmd /k "echo Aguarde a URL aparecer abaixo... && cloudflared tunnel --url http://localhost:8080"
timeout /t 10 >nul

echo.
echo Olhe a janela "Backend Tunnel"
echo Copie EXATAMENTE a URL (ex: https://abc-123.trycloudflare.com)
echo.
set /p BACKEND_URL="Cole aqui: "

REM Limpar URL
set BACKEND_URL=%BACKEND_URL: =%
if "%BACKEND_URL:~-1%"=="/" set BACKEND_URL=%BACKEND_URL:~0,-1%

echo.
echo Testando backend via tunel...
curl -s "%BACKEND_URL%/api/auth/login" > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo [AVISO] Backend pode nao estar acessivel via tunel
    echo Mas vamos continuar...
)

echo.
echo ============================================
echo   PASSO 2: COMPILAR FRONTEND
echo ============================================
cd frontend

REM Criar arquivo de ambiente
echo VITE_API_URL=%BACKEND_URL%/api > .env.production.local
echo.
echo Configurado: VITE_API_URL=%BACKEND_URL%/api
echo.

echo Compilando (isso pode demorar 30-60 segundos)...
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERRO] Falha na compilacao!
    cd ..
    pause
    exit /b 1
)

cd ..
echo [OK] Frontend compilado com sucesso!

echo.
echo ============================================
echo   PASSO 3: SERVIR FRONTEND E CRIAR TUNEL
echo ============================================

start "Frontend Server" cmd /k "cd frontend && npx vite preview --port 4173 --host 0.0.0.0"
timeout /t 10 >nul

start "Frontend Tunnel" cmd /k "echo Copie a URL abaixo para compartilhar: && cloudflared tunnel --url http://localhost:4173"
timeout /t 5 >nul

color 0A
echo.
echo ============================================
echo   SUCESSO! APLICACAO COMPARTILHAVEL
echo ============================================
echo.
echo Backend:  %BACKEND_URL%
echo Frontend: Veja na janela "Frontend Tunnel"
echo.
echo CREDENCIAIS DE TESTE:
echo   Login: admin.master
echo   Senha: Admin@123
echo   Unidade: UBS - Unidade Basica de Saude
echo.
echo COMPARTILHE:
echo   Apenas a URL do FRONTEND
echo.
echo MANTER ABERTAS:
echo   - Backend (IntelliJ ou terminal)
echo   - Backend Tunnel
echo   - Frontend Server
echo   - Frontend Tunnel
echo.
echo PARA PARAR:
echo   Feche todas as janelas e delete:
echo   frontend\.env.production.local
echo.
echo ============================================
pause
