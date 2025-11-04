@echo off
chcp 65001 >nul
echo ============================================================================
echo CONFIGURAÇÃO: Ana Paula Branco - Módulo UPA
echo ============================================================================
echo.
echo Executando script SQL...
echo.
set PGPASSWORD=123456
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d saude_db -f "D:\IntelliJ\sistema2\conceder-upa-ana-paula-v2.sql"
echo.
echo ============================================================================
echo ✅ Script executado!
echo ============================================================================
echo.
echo 📋 Próximos passos:
echo    1. Reinicie o backend (se necessário)
echo    2. Execute o teste Playwright para verificar
echo.
pause
