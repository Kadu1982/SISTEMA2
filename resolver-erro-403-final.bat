@echo off
cd /d "%~dp0"
color 0A
echo ============================================
echo   RESOLVER ERRO 403 - VERSÃO FINAL
echo ============================================
echo.

echo [1/4] Verificando aplicacao...
curl -s http://localhost:8080/health > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Backend nao esta rodando
    pause
    exit /b 1
)

curl -s http://localhost:5173 > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Frontend nao esta rodando
    pause
    exit /b 1
)

echo [OK] Aplicacao funcionando
echo.

echo [2/4] Parando tunnels antigos...
taskkill /F /IM cloudflared.exe > nul 2>&1

echo.
echo [3/4] Criando tunnel para backend...
echo Aguarde a URL aparecer...
start "Backend Tunnel" cmd /k "cloudflared tunnel --url http://localhost:8080"
timeout /t 20 >nul

echo.
echo [4/4] Configurando frontend...
echo.
echo IMPORTANTE: 
echo 1. Olhe a janela "Backend Tunnel" 
echo 2. Copie a URL que aparece (ex: https://abc-123.trycloudflare.com)
echo 3. Cole abaixo
echo.
set /p BACKEND_URL="URL do backend: "

REM Limpar URL
set BACKEND_URL=%BACKEND_URL: =%
if "%BACKEND_URL:~-1%"=="/" set BACKEND_URL=%BACKEND_URL:~0,-1%

echo.
echo Configurando frontend...
cd frontend
echo VITE_API_URL=%BACKEND_URL%/api > .env.local
echo.
echo [OK] Frontend configurado!

cd ..
echo.
echo ============================================
echo   PROBLEMA RESOLVIDO!
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
echo IMPORTANTE: Mantenha a janela "Backend Tunnel" aberta!
echo.
pause

