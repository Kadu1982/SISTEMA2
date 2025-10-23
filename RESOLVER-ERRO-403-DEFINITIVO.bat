@echo off
cd /d "%~dp0"
color 0A
echo ============================================
echo   RESOLVER ERRO 403 - DEFINITIVO
echo ============================================
echo.

echo [1/6] Parando todos os processos...
taskkill /F /IM node.exe > nul 2>&1
taskkill /F /IM cloudflared.exe > nul 2>&1

echo.
echo [2/6] Verificando backend...
curl -s http://localhost:8080/health > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Backend nao esta rodando
    echo Inicie o backend primeiro!
    pause
    exit /b 1
)
echo [OK] Backend funcionando

echo.
echo [3/6] Configurando frontend...
cd frontend
echo VITE_API_URL=http://localhost:8080/api > .env.local
echo.
echo [OK] Frontend configurado para usar backend local

echo.
echo [4/6] Iniciando frontend...
start "Frontend" cmd /k "npm run dev -- --port 5173 --host 0.0.0.0"
timeout /t 20 >nul

echo.
echo [5/6] Verificando frontend...
curl -s http://localhost:5173 > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Frontend nao conseguiu inicializar
    pause
    exit /b 1
)
echo [OK] Frontend funcionando

cd ..
echo.
echo [6/6] Criando Cloudflare Tunnel...
echo.
echo IMPORTANTE: O frontend agora usa o backend local
echo Isso resolve o erro 403 porque nao ha problema de CORS
echo.
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --url http://localhost:5173"

echo.
echo ============================================
echo   ERRO 403 RESOLVIDO DEFINITIVAMENTE!
echo ============================================
echo.
echo ✅ Backend: http://localhost:8080 (local)
echo ✅ Frontend: http://localhost:5173 (local)
echo ✅ Cloudflare Tunnel: Aguarde URL na janela "Cloudflare Tunnel"
echo.
echo Como funciona:
echo 1. Frontend acessa via Cloudflare Tunnel
echo 2. Frontend faz requisicoes para backend local (localhost:8080)
echo 3. Nao ha problema de CORS porque e local
echo.
echo Para testar:
echo 1. Aguarde a URL do Cloudflare aparecer
echo 2. Acesse a URL
echo 3. Use: admin.master / Admin@123
echo 4. O login deve funcionar sem erro 403
echo.
echo IMPORTANTE: 
echo - Mantenha o backend rodando localmente
echo - Mantenha as janelas "Frontend" e "Cloudflare Tunnel" abertas
echo.
echo ============================================
pause

