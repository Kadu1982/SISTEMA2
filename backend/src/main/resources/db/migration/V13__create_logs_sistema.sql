-- V13__create_logs_sistema.sql
-- Tabela para logs do sistema. Compatível com a entidade com.sistemadesaude.backend.logs.model.LogSistema

CREATE TABLE IF NOT EXISTS logs_sistema (
                                            id           VARCHAR(36) PRIMARY KEY,
    usuario_id   VARCHAR(100),
    acao         VARCHAR(100),
    tabela       VARCHAR(100),
    registro_id  VARCHAR(100),
    "timestamp"  TIMESTAMP DEFAULT NOW()
    );

-- Índices úteis (opcionais)
CREATE INDEX IF NOT EXISTS idx_logs_sistema_tabela       ON logs_sistema (tabela);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_registro_id  ON logs_sistema (registro_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_usuario      ON logs_sistema (usuario_id);
