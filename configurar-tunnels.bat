@echo off
cd /d "%~dp0"
color 0A
echo ============================================
echo   CONFIGURAR TUNNELS CLOUDFLARE
echo ============================================
echo.

echo [1/4] Verificando backend local...
curl -s http://localhost:8080/health > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo [ERRO] Backend nao esta rodando em localhost:8080
    echo Inicie o backend primeiro!
    pause
    exit /b 1
) else (
    echo [OK] Backend funcionando
)

echo.
echo [2/4] Verificando frontend local...
curl -s http://localhost:5173 > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo [ERRO] Frontend nao esta rodando em localhost:5173
    echo Inicie o frontend primeiro!
    pause
    exit /b 1
) else (
    echo [OK] Frontend funcionando
)

echo.
echo [3/4] Criando tunnel para backend...
echo Aguarde a URL do backend aparecer...
start "Backend Tunnel" cmd /k "cloudflared tunnel --url http://localhost:8080"
timeout /t 10 >nul

echo.
echo [4/4] Aguardando tunnel do backend...
echo.
echo IMPORTANTE: 
echo 1. Aguarde a URL do backend aparecer na janela "Backend Tunnel"
echo 2. Copie a URL (ex: https://abc-123.trycloudflare.com)
echo 3. Cole abaixo quando aparecer
echo.
set /p BACKEND_URL="Cole a URL do backend aqui: "

REM Limpar URL
set BACKEND_URL=%BACKEND_URL: =%
if "%BACKEND_URL:~-1%"=="/" set BACKEND_URL=%BACKEND_URL:~0,-1%

echo.
echo Configurando frontend para usar: %BACKEND_URL%
echo.

REM Criar arquivo de ambiente para o frontend
cd frontend
echo VITE_API_URL=%BACKEND_URL%/api > .env.local
echo.
echo [OK] Frontend configurado para usar backend via tunnel
echo.

echo ============================================
echo   TUNNELS CONFIGURADOS COM SUCESSO!
echo ============================================
echo.
echo Frontend: https://nano-experimental-fishing-benz.trycloudflare.com
echo Backend:  %BACKEND_URL%
echo.
echo Agora o login deve funcionar corretamente!
echo.
echo Para testar:
echo 1. Acesse a URL do frontend
echo 2. Use as credenciais: admin.master / Admin@123
echo 3. O login deve funcionar sem erro 403
echo.
pause

