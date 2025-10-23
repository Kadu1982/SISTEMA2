@echo off
echo ============================================
echo   CRIAR USUARIO ADMIN.MASTER
echo ============================================
echo.

"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d saude_db -f criar-usuario-master.sql

echo.
echo Verificando se foi criado...
echo.

"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d saude_db -c "SELECT id, login, nome, ativo, is_master FROM operador WHERE login = 'admin.master';"

echo.
echo ============================================
echo   IMPORTANTE:
echo   Apos ver o usuario acima, REINICIE O BACKEND!
echo ============================================
echo.
pause
