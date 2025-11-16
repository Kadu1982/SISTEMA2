-- V20250907.1__create_audit_evento.sql
-- Cria a tabela de auditoria "audit_evento" para registrar operações CRUD sensíveis.
-- Compatível com PostgreSQL (recomendado). Se usar MySQL/MariaDB, troque BIGSERIAL por BIGINT AUTO_INCREMENT
-- e CURRENT_TIMESTAMP no DEFAULT, e remova "IF NOT EXISTS" se sua versão não suportar.

-- 🗃️ Tabela principal
CREATE TABLE IF NOT EXISTS audit_evento (
                                            id               BIGSERIAL PRIMARY KEY,         -- chave técnica
                                            data_hora        TIMESTAMP NOT NULL DEFAULT NOW(), -- quando ocorreu o evento
    operador_id      BIGINT,                        -- quem executou (pode ser null, ex.: integrações)
    entidade         VARCHAR(120) NOT NULL,         -- ex.: OPERADORES, ESTOQUE, PACIENTES
    operacao         VARCHAR(20)  NOT NULL,         -- CREATE | UPDATE | DELETE (normalizado no Aspect)
    recurso          VARCHAR(180),                  -- endpoint/URI que processou a requisição
    payload_resumo   TEXT,                          -- resumo seguro do payload (sem dados sensíveis)
    ip               VARCHAR(64)                    -- IP de origem (quando disponível)
    );

-- 🔎 Índices úteis para relatórios e filtros
-- Nota: A tabela já existe na baseline com a coluna 'data_evento' (não 'data_hora')
DO $$
BEGIN
    -- Índice em data_evento (nome correto conforme baseline)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_evento_data') THEN
        CREATE INDEX idx_audit_evento_data ON audit_evento (data_evento);
    END IF;
    
    -- Índice em operador_id (sempre existe)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_evento_oper') THEN
        CREATE INDEX idx_audit_evento_oper ON audit_evento (operador_id);
    END IF;
    
    -- Índices em entidade e operacao (apenas se as colunas existirem)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_evento' AND column_name = 'entidade'
    ) THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_evento_entidade') THEN
            CREATE INDEX idx_audit_evento_entidade ON audit_evento (entidade);
        END IF;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_evento' AND column_name = 'operacao'
    ) THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_evento_operacao') THEN
            CREATE INDEX idx_audit_evento_operacao ON audit_evento (operacao);
        END IF;
    END IF;
END $$;

-- 📌 Observações:
-- - A entidade JPA correspondente é com.sistemadesaude.backend.auditoria.AuditEvento
-- - O Aspect (AuditoriaAspect) grava nesta tabela após POST/PUT/DELETE de controllers.
-- - Caso seu banco seja MySQL/MariaDB:
--     * id BIGINT AUTO_INCREMENT PRIMARY KEY
--     * data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
--     * Remova IF NOT EXISTS se necessário (dependendo da versão do servidor).
