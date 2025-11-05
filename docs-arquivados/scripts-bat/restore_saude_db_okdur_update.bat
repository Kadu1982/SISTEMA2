@echo off
REM Script para restaurar o banco saude_db usando o backup no diretório da aplicação 'sistema2' na Área de Trabalho do usuário okdur.
REM Ajuste o nome do arquivo de backup se necessário.

pg_restore -h localhost -p 5432 -U postgres --clean --create --no-owner --no-acl -d postgres "C:\Users\okdur\Desktop\sistema2\backup_saude_db.backup"

pause
