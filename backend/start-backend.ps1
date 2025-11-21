# Script para iniciar o backend com JAVA_HOME configurado
# Resolve o problema de JAVA_HOME não encontrado

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Iniciando Backend Spring Boot" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Configura JAVA_HOME se não estiver configurado
$javaHome = $env:JAVA_HOME
if (-not $javaHome) {
    $javaHome = "C:\Program Files\Microsoft\jdk-21.0.8.9-hotspot"
    if (Test-Path $javaHome) {
        $env:JAVA_HOME = $javaHome
        Write-Host "JAVA_HOME configurado: $javaHome" -ForegroundColor Green
    }
    else {
        Write-Host "ERRO: Java nao encontrado em $javaHome" -ForegroundColor Red
        Write-Host "Por favor, instale o JDK 21 ou configure o JAVA_HOME manualmente." -ForegroundColor Yellow
        exit 1
    }
}
else {
    Write-Host "JAVA_HOME ja configurado: $javaHome" -ForegroundColor Green
}

# Adiciona Java ao PATH se não estiver
$javaBin = Join-Path $javaHome "bin"
if ($env:PATH -notlike "*$javaBin*") {
    $env:PATH = "$javaBin;$env:PATH"
    Write-Host "Java bin adicionado ao PATH desta sessao" -ForegroundColor Green
}

Write-Host ""
Write-Host "Verificando Java..." -ForegroundColor Yellow
java -version

Write-Host ""
Write-Host "Iniciando Spring Boot..." -ForegroundColor Yellow
Write-Host ""

# Inicia o Spring Boot
.\mvnw.cmd spring-boot:run





