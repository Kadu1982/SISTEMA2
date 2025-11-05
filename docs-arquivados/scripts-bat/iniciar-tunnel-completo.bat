@echo off
cd /d "%~dp0"
color 0A
echo ============================================
echo   INICIAR APLICACAO COM CLOUDFLARE TUNNEL
echo ============================================
echo.

REM Verificar se cloudflared está instalado
where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Cloudflared nao encontrado!
    echo Instale com: winget install --id Cloudflare.cloudflared
    pause
    exit /b 1
)

echo [1/4] Verificando backend...
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
echo [2/4] Limpando processos antigos...
taskkill /F /IM node.exe > nul 2>&1
taskkill /F /IM cloudflared.exe > nul 2>&1

echo.
echo [3/4] Iniciando frontend...
start "Frontend" cmd /k "cd frontend && npx vite --config vite.config.tunnel.ts"
timeout /t 10 >nul

echo.
echo [4/4] Criando Cloudflare Tunnel...
echo Aguarde a URL aparecer abaixo...
echo.
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --url http://localhost:5173"

echo.
echo ============================================
echo   APLICACAO INICIADA COM SUCESSO!
echo ============================================
echo.
echo 1. Aguarde a URL do Cloudflare aparecer na janela "Cloudflare Tunnel"
echo 2. Copie a URL (ex: https://abc-123.trycloudflare.com)
echo 3. Cole no navegador para acessar sua aplicacao
echo.
echo CREDENCIAIS DE TESTE:
echo   Login: admin.master
echo   Senha: Admin@123
echo.
echo Para parar: Feche as janelas "Frontend" e "Cloudflare Tunnel"
echo.
pause

