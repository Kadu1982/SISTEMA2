@echo off
cd /d "%~dp0"
echo ============================================
echo   COMPARTILHAR APLICACAO VIA WEB
echo   (Modo Dev - sem HMR)
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

echo [1/2] Iniciando frontend com configuracao para tunnel (porta 5173)...
cd frontend
start "Frontend Dev (Tunnel)" cmd /k "npx vite --config vite.config.tunnel.ts --host 0.0.0.0 --port 5173"
timeout /t 8 >nul
cd ..

echo.
echo [2/2] Criando tunel Cloudflare...
start "Frontend Tunnel" cmd /k "cloudflared tunnel --url http://localhost:5173"
timeout /t 5 >nul

echo.
echo ============================================
echo   TUNEL CRIADO COM SUCESSO!
echo ============================================
echo.
echo IMPORTANTE:
echo 1. Copie a URL que aparece na janela "Frontend Tunnel"
echo 2. Compartilhe essa URL para testes externos
echo 3. O frontend esta rodando SEM hot-reload (mais estavel)
echo.
echo ANTES DE COMPARTILHAR:
echo - Certifique-se que o BACKEND esta rodando (porta 8080)
echo.
echo NOTA:
echo - A URL muda a cada execucao do script
echo - Este modo desabilita HMR para evitar tela preta
echo - Para desenvolvimento local normal, use: npm run dev
echo - Mantenha as janelas abertas durante os testes
echo.
echo ============================================
pause