@echo off
cd /d "%~dp0"
color 0A
echo ============================================
echo   COMPARTILHAR APLICACAO - VERSAO FINAL
echo   (Com correcoes para Cloudflare Tunnel)
echo ============================================
echo.

REM Verificar dependencias
where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Cloudflared nao encontrado!
    echo Instale com: winget install --id Cloudflare.cloudflared
    pause
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Node.js nao encontrado!
    echo Instale de: https://nodejs.org
    pause
    exit /b 1
)

echo [!] IMPORTANTE: Certifique-se que:
echo     1. Backend Spring Boot rodando na porta 8080
echo     2. Banco de dados PostgreSQL conectado
echo     3. Usuario admin.master existe (senha: Admin@123)
echo.

REM Verificar backend
echo [1/5] Verificando backend...
curl -s http://localhost:8080/health > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo [ERRO] Backend nao esta respondendo em localhost:8080
    echo.
    echo Inicie o backend primeiro:
    echo 1. Abra o IntelliJ IDEA
    echo 2. Execute BackendApplication.java
    echo 3. Ou execute: mvn spring-boot:run
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Backend funcionando
)

echo.
echo [2/5] Limpando processos antigos...
taskkill /F /IM node.exe > nul 2>&1
taskkill /F /IM cloudflared.exe > nul 2>&1

echo.
echo [3/5] Instalando dependencias do Playwright...
if not exist "node_modules\playwright" (
    echo Instalando Playwright...
    npm install playwright
    npx playwright install chromium
)

echo.
echo [4/5] Iniciando frontend com configuracao de tunnel...
start "Frontend" cmd /k "cd frontend && npx vite --config vite.config.tunnel.ts"
timeout /t 15 >nul

REM Verificar se frontend iniciou
curl -s http://localhost:5173 > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo [ERRO] Frontend nao conseguiu inicializar
    echo Verifique se as dependencias estao instaladas:
    echo cd frontend && npm install
    pause
    exit /b 1
) else (
    echo [OK] Frontend funcionando
)

echo.
echo [5/5] Testando aplicacao e criando tunnel...
echo Executando testes automatizados...
node testar-aplicacao.js

echo.
echo Criando Cloudflare Tunnel...
echo Aguarde a URL aparecer na janela "Cloudflare Tunnel"...
echo.
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --url http://localhost:5173"

echo.
echo ============================================
echo   APLICACAO COMPARTILHAVEL COM SUCESSO!
echo ============================================
echo.
echo ✅ Backend: Funcionando (localhost:8080)
echo ✅ Frontend: Funcionando (localhost:5173)
echo ✅ Cloudflare Tunnel: Criado
echo.
echo 📋 PROXIMOS PASSOS:
echo 1. Aguarde a URL do Cloudflare aparecer na janela "Cloudflare Tunnel"
echo 2. Copie a URL (ex: https://abc-123.trycloudflare.com)
echo 3. Cole no navegador para acessar sua aplicacao
echo.
echo 🔐 CREDENCIAIS DE TESTE:
echo    Login: admin.master
echo    Senha: Admin@123
echo    Unidade: UBS - Unidade Basica de Saude
echo.
echo 🛑 PARA PARAR:
echo    Feche as janelas "Frontend" e "Cloudflare Tunnel"
echo.
echo 📊 MONITORAMENTO:
echo    - Backend: http://localhost:8080/health
echo    - Frontend: http://localhost:5173
echo    - Logs: Verifique as janelas abertas
echo.
echo ============================================
pause

