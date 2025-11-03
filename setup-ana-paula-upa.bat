@echo off
chcp 65001 >nul
echo ============================================================================
echo CONFIGURAÇÃO: Conceder Módulo UPA para Ana Paula Branco
echo ============================================================================
echo.

echo 📋 Passo 1: Verificando dados atuais da Ana Paula...
echo.
psql -U postgres -d saude_db -f verificar-ana-paula.sql
echo.
echo.

echo 🔧 Passo 2: Concedendo módulo UPA...
echo.
psql -U postgres -d saude_db -f conceder-upa-ana-paula.sql
echo.
echo.

echo ✅ Configuração concluída!
echo.
echo 📝 Próximos passos:
echo    1. Reinicie o backend (se ainda não reiniciou)
echo    2. Faça login com Ana Paula Branco
echo    3. Verifique se o módulo UPA aparece no menu lateral
echo.
pause
