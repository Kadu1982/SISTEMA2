@echo off
cd /d "%~dp0"
color 0A
echo ============================================
echo   EXPOR APLICACAO PARA INTERNET
echo   (Solucao Completa e Definitiva)
echo ============================================
echo.

REM Verificar cloudflared
where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Cloudflared nao encontrado!
    echo Instale com: winget install --id Cloudflare.cloudflared
    pause
    exit /b 1
)

echo [1/6] Limpando processos antigos...
taskkill /F /IM node.exe > nul 2>&1
taskkill /F /IM cloudflared.exe > nul 2>&1

echo.
echo [2/6] Verificando backend...
netstat -ano | findstr :8080 > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo [ERRO] Backend nao esta rodando em localhost:8080
    echo.
    echo O backend foi iniciado mas nao esta na porta 8080.
    echo Por favor, verifique se o Spring Boot iniciou corretamente.
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Backend funcionando na porta 8080
)

echo.
echo [3/6] Criando tunnel para o BACKEND...
start "Backend Tunnel" cmd /k "echo ============================================ && echo    BACKEND TUNNEL && echo ============================================ && echo. && echo Aguarde a URL aparecer abaixo... && echo. && cloudflared tunnel --url http://localhost:8080"
timeout /t 15 >nul

echo.
echo ============================================
echo   COPIE A URL DO BACKEND
echo ============================================
echo.
echo Olhe a janela "Backend Tunnel"
echo Copie a URL que aparece (ex: https://abc-123.trycloudflare.com)
echo.
set /p BACKEND_URL="Cole a URL do BACKEND aqui: "

REM Limpar URL
set BACKEND_URL=%BACKEND_URL: =%
if "%BACKEND_URL:~-1%"=="/" set BACKEND_URL=%BACKEND_URL:~0,-1%

echo.
echo [4/6] Testando backend via tunnel...
curl -s "%BACKEND_URL%/health" > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo [AVISO] Backend pode nao estar acessivel via tunnel
    echo Mas vamos continuar...
) else (
    echo [OK] Backend acessivel via tunnel
)

echo.
echo [5/6] Configurando frontend...
cd frontend

REM Limpar configuracoes antigas
if exist ".env.local" del ".env.local"
if exist ".env.production.local" del ".env.production.local"

REM Criar arquivo de ambiente
echo VITE_API_URL=%BACKEND_URL%/api > .env.production.local
echo.
echo [OK] Frontend configurado: VITE_API_URL=%BACKEND_URL%/api

echo.
echo Compilando frontend...
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Falha na compilacao do frontend!
    cd ..
    pause
    exit /b 1
)

cd ..
echo [OK] Frontend compilado com sucesso

echo.
echo [6/6] Iniciando frontend e criando tunnel...
start "Frontend Server" cmd /k "cd frontend && npx vite preview --port 4173 --host 0.0.0.0"
timeout /t 15 >nul

start "Frontend Tunnel" cmd /k "echo ============================================ && echo    FRONTEND TUNNEL && echo ============================================ && echo. && echo Copie a URL abaixo para acessar sua aplicacao: && echo. && cloudflared tunnel --url http://localhost:4173"

echo.
echo ============================================
echo   APLICACAO EXPOSTA COM SUCESSO!
echo ============================================
echo.
echo Backend:  %BACKEND_URL%
echo Frontend: Aguarde URL na janela "Frontend Tunnel"
echo.
echo COMO FUNCIONA:
echo 1. Frontend e acessado via Cloudflare Tunnel
echo 2. Frontend faz requisicoes para o backend via tunnel
echo 3. Nao ha problema de CORS porque tudo esta configurado
echo.
echo CREDENCIAIS DE TESTE:
echo   Login: admin.master
echo   Senha: Admin@123
echo   Unidade: UBS - Unidade Basica de Saude
echo.
echo COMPARTILHE:
echo   Apenas a URL do FRONTEND (janela "Frontend Tunnel")
echo.
echo MANTER ABERTAS:
echo   - Backend (terminal do Spring Boot)
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

