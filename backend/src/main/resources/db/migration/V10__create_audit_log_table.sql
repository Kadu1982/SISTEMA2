-- ============================================================================
-- Migration V10: Criar tabela de auditoria para conformidade LGPD e segurança
-- Data: 2025-11-05
-- Descrição: Sistema de auditoria completo para rastreamento de operações
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT,
    usuario_nome VARCHAR(200),
    usuario_cpf VARCHAR(14),
    tipo_operacao VARCHAR(50) NOT NULL,
    entidade_tipo VARCHAR(100),
    entidade_id BIGINT,
    descricao VARCHAR(500),
    ip_origem VARCHAR(45),
    user_agent VARCHAR(500),
    endpoint VARCHAR(500),
    metodo_http VARCHAR(10),
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sucesso BOOLEAN DEFAULT TRUE,
    mensagem_erro VARCHAR(1000),
    dados_antes TEXT,
    dados_depois TEXT,

    CONSTRAINT chk_tipo_operacao CHECK (tipo_operacao IN (
        'LOGIN', 'LOGOUT', 'CREATE', 'READ', 'UPDATE', 'DELETE',
        'EXPORT', 'IMPORT', 'ACESSO_DADOS_SENSIVEIS',
        'ALTERACAO_PERMISSAO', 'FALHA_AUTENTICACAO',
        'TENTATIVA_ACESSO_NAO_AUTORIZADO'
    ))
);

-- Índices para performance em consultas de auditoria
CREATE INDEX idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_data ON audit_log(data_hora DESC);
CREATE INDEX idx_audit_tipo ON audit_log(tipo_operacao);
CREATE INDEX idx_audit_entidade ON audit_log(entidade_tipo, entidade_id);
CREATE INDEX idx_audit_falhas ON audit_log(tipo_operacao, sucesso) WHERE sucesso = FALSE;

-- Comentários para documentação
COMMENT ON TABLE audit_log IS 'Tabela de auditoria para conformidade LGPD e requisitos de segurança';
COMMENT ON COLUMN audit_log.usuario_id IS 'ID do usuário que realizou a operação';
COMMENT ON COLUMN audit_log.tipo_operacao IS 'Tipo de operação realizada';
COMMENT ON COLUMN audit_log.entidade_tipo IS 'Tipo da entidade afetada (ex: Paciente, Exame)';
COMMENT ON COLUMN audit_log.entidade_id IS 'ID da entidade afetada';
COMMENT ON COLUMN audit_log.ip_origem IS 'Endereço IP de origem da requisição';
COMMENT ON COLUMN audit_log.dados_antes IS 'Estado anterior dos dados (para UPDATEs)';
COMMENT ON COLUMN audit_log.dados_depois IS 'Estado posterior dos dados (para UPDATEs)';
