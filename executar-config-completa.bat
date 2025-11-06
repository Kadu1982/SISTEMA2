@echo off
chcp 65001 >nul
cls
echo.
echo ============================================================================
echo           CONFIGURAÇÃO: Ana Paula Branco - Módulo UPA
echo ============================================================================
echo.
echo Executando configuração completa no banco de dados...
echo.
set PGPASSWORD=123456
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d saude_db -f "D:\IntelliJ\sistema2\configurar-ana-paula-upa-completo.sql"
echo.
echo ============================================================================
echo                         CONFIGURAÇÃO FINALIZADA
echo ============================================================================
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
