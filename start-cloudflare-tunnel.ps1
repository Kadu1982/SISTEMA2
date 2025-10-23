# Script PowerShell para iniciar Cloudflare Tunnel
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Iniciando Cloudflare Tunnel" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Verificar se cloudflared está instalado
Write-Host "Verificando se o cloudflared está instalado..." -ForegroundColor Yellow
try {
    $version = cloudflared --version
    Write-Host "✓ Cloudflared encontrado: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: cloudflared não está instalado ou não está no PATH" -ForegroundColor Red
    Write-Host "Baixe em: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "Iniciando aplicação com Docker Compose..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "Aguardando aplicação inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "Iniciando Cloudflare Tunnel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Cyan
Write-Host "- O tunnel será criado automaticamente" -ForegroundColor White
Write-Host "- Você receberá URLs públicas para acessar sua aplicação" -ForegroundColor White
Write-Host "- Mantenha este terminal aberto enquanto usar o tunnel" -ForegroundColor White
Write-Host ""

cloudflared tunnel --config cloudflare-tunnel.yml run

Read-Host "Pressione Enter para sair"

