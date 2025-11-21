@echo off
REM Script para iniciar o backend com JAVA_HOME configurado
REM Resolve o problema de JAVA_HOME não encontrado

echo =========================================
echo Iniciando Backend Spring Boot
echo =========================================
echo.

REM Configura JAVA_HOME
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.8.9-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo JAVA_HOME configurado: %JAVA_HOME%
echo.

echo Verificando Java...
java -version
echo.

echo Iniciando Spring Boot...
echo.

REM Inicia o Spring Boot
call mvnw.cmd spring-boot:run





