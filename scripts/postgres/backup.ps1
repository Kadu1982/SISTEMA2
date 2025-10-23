param(
  [string]$OutputDir = "backups",
  [string]$FileName,
  [switch]$Local
)

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

if (-not $FileName) {
  $FileName = "$(Get-Date -Format yyyyMMdd_HHmmss)_$DbName.dump"
}

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$TargetPath = Join-Path $OutputDir $FileName
Write-Host "Gerando backup em $TargetPath"

if ($Local.IsPresent) {
  try {
    $env:PGPASSWORD = $DbPass
    pg_dump -h $DbHost -p $DbPort -U $DbUser -d $DbName -Fc -f $TargetPath
  } finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  }
} else {
  $command = "env PGPASSWORD=`"$DbPass`" pg_dump -U `"$DbUser`" -d `"$DbName`" -Fc"
  docker compose exec -T postgres sh -c $command | Set-Content -Encoding Byte -Path $TargetPath
}

Write-Host "Backup finalizado."
