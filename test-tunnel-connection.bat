@echo off
echo ========================================
echo  Testando Conexão do Cloudflare Tunnel
echo ========================================

echo.
echo 1. Testando Backend local...
curl -s http://localhost:8080/health
if %errorlevel% neq 0 (
    echo ❌ Backend não está respondendo em localhost:8080
    echo Execute: docker-compose up -d
    pause
    exit /b 1
) else (
    echo ✅ Backend local funcionando
)

echo.
echo 2. Testando Frontend local...
curl -s http://localhost:4173
if %errorlevel% neq 0 (
    echo ❌ Frontend não está respondendo em localhost:4173
    echo Execute: docker-compose up -d
    pause
    exit /b 1
) else (
    echo ✅ Frontend local funcionando
)

echo.
echo 3. Testando Favicon...
curl -s -I http://localhost:8080/favicon.ico
if %errorlevel% neq 0 (
    echo ❌ Favicon não está respondendo
) else (
    echo ✅ Favicon funcionando
)

echo.
echo ========================================
echo  Próximos passos:
echo ========================================
echo 1. Execute: start-cloudflare-tunnel.bat
echo 2. Aguarde as URLs públicas aparecerem
echo 3. Teste as URLs fornecidas pelo Cloudflare
echo.
echo URLs esperadas:
echo - Frontend: https://saude-sistema-xxxxx.trycloudflare.com
echo - Backend:  https://api-saude-sistema-xxxxx.trycloudflare.com
echo.

pause

