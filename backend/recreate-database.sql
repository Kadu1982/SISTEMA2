-- Script para recriar o banco de dados do zero
-- Execute este script conectado ao banco 'postgres' como superusuário

-- 1. Encerra todas as conexões ativas no banco sistema_saude
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'sistema_saude'
  AND pid <> pg_backend_pid();

-- 2. Remove o banco de dados se existir
DROP DATABASE IF EXISTS sistema_saude;

-- 3. Cria o banco de dados novamente
CREATE DATABASE sistema_saude
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Brazil.1252'
    LC_CTYPE = 'Portuguese_Brazil.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- 4. Mensagem de confirmação
\echo 'Banco de dados sistema_saude recriado com sucesso!'
\echo 'Execute a aplicação Spring Boot para aplicar as migrations do Flyway.'
