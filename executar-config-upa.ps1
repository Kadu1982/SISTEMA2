$env:PGPASSWORD = "123456"
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$sqlFile = "D:\IntelliJ\sistema2\config-teste-operador-upa.sql"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "      Configurando teste.operador - Módulo UPA" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

& $psqlPath -U postgres -d saude_db -f $sqlFile

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "      Configuração Finalizada!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
