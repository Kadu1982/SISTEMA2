@echo off
cd /d "%~dp0"
color 0A

echo ==========================================
echo     TUNNEL CLOUDFLARE - SOLUÇÃO TOTAL
echo ==========================================

REM 1. Parar backend antigo se a porta estiver ocupada
echo [1/7] Verificando porta 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTEN') do (taskkill /F /PID %%a >nul 2>&1)

echo [2/7] Subindo backend Spring Boot...
cd backend
start "Backend" cmd /k "call .\mvnw.cmd spring-boot:run"
timeout /t 15 >nul

echo [3/7] Criando Tunnel para backend...
start "Backend Tunnel" cmd /k "cloudflared tunnel --url http://localhost:8080"
timeout /t 15 >nul

echo.
echo ===========================================
echo Olhe a janela 'Backend Tunnel' e copie a URL gerada (https://…trycloudflare.com)
echo Cole a seguir SEM espaços:
set /p BACKEND_URL="Cole aqui a URL do backend do Tunnel: "

cd ..
echo [4/7] Escrevendo .env.production.local do frontend...
cd frontend
del /Q .env.production.local 2>nul
echo VITE_API_URL=%BACKEND_URL%/api > .env.production.local
echo VITE_API_URL configurado para %BACKEND_URL%/api

echo [5/7] Instalando dependências e compilando frontend...
call npm install
call npm run build

echo [6/7] Subindo preview frontend e criando tunnel...
start "Frontend Server" cmd /k "npx vite preview --port 4173 --host 0.0.0.0"
timeout /t 10 >nul
start "Frontend Tunnel" cmd /k "cloudflared tunnel --url http://localhost:4173"

echo ==========================================
echo   AGORA SUA APLICAÇÃO ESTÁ ONLINE
echo ==========================================
echo Olhe a janela 'Frontend Tunnel' e compartilhe a próxima URL criada.
echo Login: admin.master
echo Senha: Admin@123
echo Unidade: UBS - Unidade Basica de Saude
echo.
echo IMPORTANTE: mantenha todas as janelas abertas enquanto estiver usando o sistema externo!
echo ==========================================
pause
