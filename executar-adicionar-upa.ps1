$env:PGPASSWORD = "123456"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d saude_db -f "D:\IntelliJ\sistema2\adicionar-perfil-upa.sql"
Write-Host "Concluído!" -ForegroundColor Green
