@echo off
echo ============================================================
echo Script de Reinicializacao do Backend
echo ============================================================
echo.

echo [1/4] Matando processos Java em background...
powershell -command "Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force"
timeout /t 3 /nobreak > nul

echo [2/4] Aguardando liberacao da porta 8080...
timeout /t 5 /nobreak > nul

echo [3/4] Limpando diretorio target...
cd backend
if exist target rmdir /s /q target
timeout /t 2 /nobreak > nul

echo [4/4] Iniciando backend em nova janela...
start "Backend Spring Boot" cmd /c "set SPRING_PROFILES_ACTIVE=dev && mvnw.cmd spring-boot:run 2>&1 | tee startup-clean.log"

echo.
echo ============================================================
echo Backend iniciado em nova janela!
echo Aguarde aproximadamente 60 segundos para o backend iniciar.
echo.
echo Apos rodar o script SQL no PgAdmin (fix-admin-login.sql):
echo   - Login: admin.master
echo   - Senha: Admin@123
echo.
echo Logs em: backend\startup-clean.log
echo ============================================================
pause
