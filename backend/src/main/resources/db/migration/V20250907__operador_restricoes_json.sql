-- V20250907__operador_restricoes_json.sql
-- Tabela simples para guardar um JSON de restrições por operador (fase 1).
-- PostgreSQL: usa jsonb. Se usar MySQL/MariaDB, me avise que mando a versão equivalente.

CREATE TABLE IF NOT EXISTS operador_restricoes_json (
                                                        operador_id   BIGINT PRIMARY KEY,
                                                        conteudo_json JSONB NOT NULL DEFAULT '{}'::jsonb,
                                                        updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_operador_restricoes_json
    FOREIGN KEY (operador_id) REFERENCES operador(id) ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS idx_orj_updated_at ON operador_restricoes_json(updated_at);
