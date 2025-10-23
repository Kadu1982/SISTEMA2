# Script PowerShell para reparar Flyway
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REPARANDO FLYWAY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configurar senha do PostgreSQL
$env:PGPASSWORD = "123456"

# Executar SQL para remover migrations falhadas
Write-Host "Removendo migrations falhadas do historico Flyway..." -ForegroundColor Yellow

$sql = @"
DELETE FROM flyway_schema_history
WHERE version IN ('202510051900', '202510052000', '202510052300')
AND success = false;

SELECT version, description, success, installed_on
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 5;
"@

$sql | & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d saude_db

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Flyway reparado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Agora execute: mvnw.cmd spring-boot:run" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "ERRO ao conectar ao PostgreSQL" -ForegroundColor Red
    Write-Host "Execute manualmente no PgAdmin:" -ForegroundColor Yellow
    Write-Host $sql -ForegroundColor White
}

Write-Host ""
Read-Host "Pressione Enter para continuar"
