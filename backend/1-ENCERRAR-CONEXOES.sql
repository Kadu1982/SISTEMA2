-- Execute este arquivo primeiro
-- Clique com botão direito no servidor PostgreSQL 17
-- Escolha "Query Tool" e cole isto:

SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'sistema_saude'
  AND pid <> pg_backend_pid();
