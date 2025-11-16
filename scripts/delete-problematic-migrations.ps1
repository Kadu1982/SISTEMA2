# Script para deletar migrations problemáticas
# Mantém apenas: V1, V999999999999 (baseline), e V202510012050 (correção perfil)

$migrationsPath = "C:\Users\okdur\IdeaProjects\SISTEMA2\backend\src\main\resources\db\migration"

# Migrations que devem ser MANTIDAS
$keepMigrations = @(
    "V1__Initial_Schema.sql",
    "V999999999999__baseline_sistema_saude.sql",
    "V202510012050__add_perfil_column_to_operador_perfis.sql"
)

# Listar todas as migrations V2025*
$migrations = Get-ChildItem -Path $migrationsPath -Filter "V2025*.sql"

Write-Host "=== MIGRATIONS PROBLEMÁTICAS QUE SERÃO DELETADAS ===" -ForegroundColor Yellow
Write-Host ""

$toDelete = @()

foreach ($migration in $migrations) {
    if ($migration.Name -notin $keepMigrations) {
        $toDelete += $migration
        Write-Host "  [X] $($migration.Name)" -ForegroundColor Red
    } else {
        Write-Host "  [MANTIDA] $($migration.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Total de migrations a deletar: $($toDelete.Count)" -ForegroundColor Yellow
Write-Host ""

# Deletar migrations
foreach ($migration in $toDelete) {
    Remove-Item -Path $migration.FullName -Force
    Write-Host "Deletada: $($migration.Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== CONCLUÍDO ===" -ForegroundColor Green
Write-Host "Migrations mantidas:" -ForegroundColor Cyan
foreach ($keep in $keepMigrations) {
    if (Test-Path "$migrationsPath\$keep") {
        Write-Host "  [OK] $keep" -ForegroundColor Green
    }
}
