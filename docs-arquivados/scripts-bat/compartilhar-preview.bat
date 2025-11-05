@echo off
cd /d "%~dp0"
echo ============================================
echo   COMPARTILHAR APLICACAO VIA WEB
echo   (Modo Preview - Build de Producao)
echo ============================================
echo.

REM Verificar se cloudflared esta instalado
where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Cloudflared nao encontrado!
    echo.
    echo Instale o cloudflared com:
    echo   winget install --id Cloudflare.cloudflared
    echo.
    pause
    exit /b 1
)

echo [1/3] Fazendo build do frontend (sem verificacao TypeScript)...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo [ERRO] Falha no build do frontend!
    echo Tentando continuar mesmo assim...
)

echo.
echo [2/3] Iniciando servidor do frontend (porta 4173)...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && node serve-build.js"
timeout /t 5 >nul

echo.
echo [3/3] Criando tunel Cloudflare...
start "Frontend Tunnel" cmd /k "cloudflared tunnel --url http://localhost:4173"
timeout /t 5 >nul

cd ..

echo.
echo ============================================
echo   TUNEL CRIADO COM SUCESSO!
echo ============================================
echo.
echo IMPORTANTE:
echo 1. Copie a URL do tunel que aparece na janela "Frontend Tunnel"
echo 2. Compartilhe essa URL para testes externos
echo 3. A aplicacao esta rodando em modo PRODUCAO (build otimizado)
echo.
echo ANTES DE COMPARTILHAR:
echo - Certifique-se que o BACKEND esta rodando (porta 8080)
echo.
echo NOTA:
echo - Este modo funciona melhor com tuneis (sem problemas de WebSocket)
echo - Para desenvolvimento local, use: npm run dev no terminal
echo - Mantenha as janelas abertas durante os testes
echo.
echo ============================================
pause