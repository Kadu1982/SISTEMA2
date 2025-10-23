@echo off
echo Verificando usuario admin.master no banco...
echo.

"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d saude_db -c "SELECT id, login, nome, ativo, is_master FROM operador WHERE login = 'admin.master';"

echo.
echo Se nao apareceu nenhum resultado, o usuario NAO EXISTE!
echo.
pause
