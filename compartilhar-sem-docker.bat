@echo off
cd /d "%~dp0"
color 0A
echo ============================================
echo   COMPARTILHAR APLICACAO (SEM DOCKER)
echo   (Script com Playwright Testing)
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
echo     4. Frontend pode ser iniciado com npm run dev
echo.

REM Verificar se Playwright está instalado
if not exist "node_modules\playwright" (
    echo Instalando Playwright...
    npm install playwright
    npx playwright install chromium
)

echo.
echo ============================================
echo   VERIFICANDO APLICACAO LOCAL
echo ============================================

REM Verificar backend
echo Verificando backend (localhost:8080)...
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

REM Verificar se frontend está rodando
echo Verificando frontend (localhost:4173)...
curl -s http://localhost:4173 > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo [AVISO] Frontend nao esta rodando em localhost:4173
    echo Iniciando frontend...
    start "Frontend Dev" cmd /k "cd frontend && npm run dev -- --port 4173 --host 0.0.0.0"
    echo Aguardando frontend inicializar...
    timeout /t 20 >nul
    
    REM Verificar novamente
    curl -s http://localhost:4173 > nul 2>&1
    if %errorlevel% neq 0 (
        color 0C
        echo [ERRO] Frontend nao conseguiu inicializar
        echo Verifique se as dependencias estao instaladas:
        echo cd frontend && npm install
        pause
        exit /b 1
    ) else (
        echo [OK] Frontend funcionando
    )
) else (
    echo [OK] Frontend funcionando
)

echo.
echo ============================================
echo   EXECUTANDO TESTES COM PLAYWRIGHT
echo ============================================

echo Executando testes automatizados...
node test-app-playwright.js
if %errorlevel% neq 0 (
    color 0E
    echo [AVISO] Alguns testes falharam, mas continuando...
)

echo.
echo ============================================
echo   CRIANDO TUNNELS CLOUDFLARE
echo ============================================

REM Criar tunnel para backend
echo Criando tunnel para backend...
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
echo Testando backend via tunnel...
curl -s "%BACKEND_URL%/health" > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo [AVISO] Backend pode nao estar acessivel via tunnel
    echo Mas vamos continuar...
) else (
    echo [OK] Backend acessivel via tunnel
)

echo.
echo ============================================
echo   COMPILANDO FRONTEND COM URL DO TUNNEL
echo ============================================

cd frontend

REM Limpar configuracoes antigas
if exist ".env.local" del ".env.local"
if exist ".env.production.local" del ".env.production.local"

REM Criar arquivo de ambiente
echo VITE_API_URL=%BACKEND_URL%/api > .env.production.local
echo.
echo Configurado: VITE_API_URL=%BACKEND_URL%/api
echo.

echo Compilando frontend...
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Falha na compilacao!
    cd ..
    pause
    exit /b 1
)

cd ..
echo [OK] Frontend compilado com sucesso!

echo.
echo ============================================
echo   SERVINDO FRONTEND E CRIANDO TUNNEL
echo ============================================

start "Frontend Server" cmd /k "cd frontend && npx vite preview --port 4173 --host 0.0.0.0"
timeout /t 10 >nul

start "Frontend Tunnel" cmd /k "echo Copie a URL abaixo para compartilhar: && cloudflared tunnel --url http://localhost:4173"
timeout /t 5 >nul

echo.
echo ============================================
echo   TESTANDO TUNNEL COMPLETO
echo ============================================

echo Aguardando tunnel do frontend inicializar...
timeout /t 15 >nul

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
echo   - Backend (IntelliJ/terminal)
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

