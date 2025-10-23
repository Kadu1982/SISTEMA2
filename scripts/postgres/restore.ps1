param(
  [Parameter(Mandatory = $true)][string]$DumpFile,
  [switch]$Local
)

if (-not (Test-Path $DumpFile)) {
  throw "Arquivo nao encontrado: $DumpFile"
}

$DbHost = $env:DB_HOST
if (-not $DbHost) { $DbHost = "localhost" }
$DbPort = $env:DB_PORT
if (-not $DbPort) { $DbPort = "5432" }
$DbName = $env:DB_NAME
if (-not $DbName) { $DbName = "saude_db" }
$DbUser = $env:DB_USER
if (-not $DbUser) { $DbUser = "postgres" }
$DbPass = $env:DB_PASS
if (-not $DbPass) { $DbPass = "123456" }

Write-Host "Restaurando backup $DumpFile"

if ($Local.IsPresent) {
  try {
    $env:PGPASSWORD = $DbPass
    pg_restore -h $DbHost -p $DbPort -U $DbUser -d $DbName --clean --if-exists $DumpFile
  } finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  }
} else {
  $command = "env PGPASSWORD=`"$DbPass`" pg_restore --clean --if-exists -U `"$DbUser`" -d `"$DbName`""
  Get-Content -Path $DumpFile -Encoding Byte -Raw | docker compose exec -T postgres sh -c $command
}

Write-Host "Restauracao finalizada."
