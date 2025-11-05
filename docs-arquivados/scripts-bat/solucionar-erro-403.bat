@echo off
cd /d "%~dp0"
color 0A
echo ============================================
echo   SOLUCIONAR ERRO 403 - LOGIN
echo ============================================
echo.

echo [1/5] Verificando aplicacao local...
curl -s http://localhost:8080/health > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo [ERRO] Backend nao esta rodando
    pause
    exit /b 1
)

curl -s http://localhost:5173 > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo [ERRO] Frontend nao esta rodando
    pause
    exit /b 1
)

echo [OK] Aplicacao local funcionando
echo.

echo [2/5] Parando tunnels antigos...
taskkill /F /IM cloudflared.exe > nul 2>&1

echo.
echo [3/5] Criando tunnel para backend...
echo Aguarde a URL aparecer na janela "Backend Tunnel"...
start "Backend Tunnel" cmd /k "echo URL do Backend: && cloudflared tunnel --url http://localhost:8080"
timeout /t 15 >nul

echo.
echo [4/5] Aguardando URL do backend...
echo.
echo IMPORTANTE: Copie a URL do backend da janela "Backend Tunnel"
echo Exemplo: https://abc-123.trycloudflare.com
echo.
set /p BACKEND_URL="Cole a URL do backend aqui: "

REM Limpar URL
set BACKEND_URL=%BACKEND_URL: =%
if "%BACKEND_URL:~-1%"=="/" set BACKEND_URL=%BACKEND_URL:~0,-1%

echo.
echo [5/5] Configurando frontend...
cd frontend
echo VITE_API_URL=%BACKEND_URL%/api > .env.local
echo.
echo [OK] Frontend configurado para usar: %BACKEND_URL%/api

cd ..
echo.
echo ============================================
echo   ERRO 403 RESOLVIDO!
echo ============================================
echo.
echo Frontend: https://nano-experimental-fishing-benz.trycloudflare.com
echo Backend:  %BACKEND_URL%
echo.
echo Agora o login deve funcionar sem erro 403!
echo.
echo Para testar:
echo 1. Acesse a URL do frontend
echo 2. Use: admin.master / Admin@123
echo 3. O login deve funcionar corretamente
echo.
echo IMPORTANTE: Mantenha as janelas "Backend Tunnel" abertas!
echo.
pause

