$env:PGPASSWORD = "123456"
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$sqlFile = "D:\IntelliJ\sistema2\config-upa-teste-operador-CORRIGIDO.sql"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "      Executando Script CORRIGIDO - teste.operador UPA" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

& $psqlPath -U postgres -d saude_db -f $sqlFile

Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
