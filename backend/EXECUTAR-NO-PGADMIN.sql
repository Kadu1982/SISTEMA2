-- =====================================================
-- SCRIPT PARA PGADMIN - EXECUTE CADA BLOCO SEPARADAMENTE
-- =====================================================
-- IMPORTANTE: Execute cada bloco INDIVIDUALMENTE (selecione e F5)
-- NÃO execute tudo de uma vez!
-- =====================================================

-- ==========================================
-- BLOCO 1: ENCERRAR CONEXÕES
-- Selecione apenas estas linhas e execute (F5)
-- ==========================================
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'sistema_saude'
  AND pid <> pg_backend_pid();

-- ==========================================
-- BLOCO 2: DROPAR BANCO
-- Selecione apenas esta linha e execute (F5)
-- ==========================================
DROP DATABASE IF EXISTS sistema_saude;

-- ==========================================
-- BLOCO 3: CRIAR BANCO
-- Selecione apenas estas linhas e execute (F5)
-- ==========================================
CREATE DATABASE sistema_saude
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- =====================================================
-- ✅ CONCLUÍDO!
-- =====================================================
-- Agora execute a aplicação Spring Boot:
-- cd C:\Users\okdur\Desktop\sistema2\backend
-- mvnw.cmd spring-boot:run
-- =====================================================
