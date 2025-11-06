@echo off
chcp 65001 >nul
set PGPASSWORD=123456
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d saude_db -f "D:\IntelliJ\sistema2\query-operador-teste.sql"
pause
