@echo off
cd /d "%~dp0"
color 0A
echo ============================================
echo   SOLUCAO FINAL - ERRO 403
echo ============================================
echo.

echo [1/3] Verificando aplicacao...
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

echo [2/3] Configurando frontend para usar backend local...
cd frontend
echo VITE_API_URL=http://localhost:8080/api > .env.local
echo.
echo [OK] Frontend configurado para usar backend local

cd ..
echo.
echo [3/3] Criando tunnel para frontend...
echo.
echo IMPORTANTE: O frontend agora usa o backend local
echo Isso resolve o erro 403 porque nao ha problema de CORS
echo.
start "Frontend Tunnel" cmd /k "cloudflared tunnel --url http://localhost:5173"

echo.
echo ============================================
echo   SOLUCAO APLICADA!
echo ============================================
echo.
echo Frontend: Aguarde a URL na janela "Frontend Tunnel"
echo Backend:  http://localhost:8080 (local)
echo.
echo Como funciona:
echo 1. Frontend acessa via Cloudflare Tunnel
echo 2. Frontend faz requisicoes para backend local
echo 3. Nao ha problema de CORS porque e local
echo.
echo Para testar:
echo 1. Aguarde a URL do frontend aparecer
echo 2. Acesse a URL
echo 3. Use: admin.master / Admin@123
echo 4. O login deve funcionar sem erro 403
echo.
echo IMPORTANTE: Mantenha o backend rodando localmente!
echo.
pause

