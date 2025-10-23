@echo off
echo ========================================
echo  Iniciando Cloudflare Tunnel
echo ========================================

echo Verificando se o cloudflared está instalado...
cloudflared --version
if %errorlevel% neq 0 (
    echo ERRO: cloudflared não está instalado ou não está no PATH
    echo Baixe em: https://github.com/cloudflare/cloudflared/releases
    pause
    exit /b 1
)

echo.
echo Iniciando aplicação com Docker Compose...
docker-compose up -d

echo.
echo Aguardando aplicação inicializar...
timeout /t 30 /nobreak

echo.
echo Iniciando Cloudflare Tunnel...
echo.
echo IMPORTANTE: 
echo - O tunnel será criado automaticamente
echo - Você receberá URLs públicas para acessar sua aplicação
echo - Mantenha este terminal aberto enquanto usar o tunnel
echo.

cloudflared tunnel --config cloudflare-tunnel.yml run

pause

