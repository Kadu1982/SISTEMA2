-- Tabela de anexos no prontuário
CREATE TABLE IF NOT EXISTS prontuario_documentos (
                                                     id BIGSERIAL PRIMARY KEY,
                                                     tipo VARCHAR(32) NOT NULL,
    paciente_id VARCHAR(50) NOT NULL,
    atendimento_id VARCHAR(50),
    agendamento_id BIGINT,
    numero_referencia VARCHAR(64),
    arquivo_nome VARCHAR(120) NOT NULL,
    content_type VARCHAR(80),
    arquivo_pdf BYTEA,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    criado_por_operador_id BIGINT
    );

CREATE INDEX IF NOT EXISTS idx_pront_doc_paciente ON prontuario_documentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pront_doc_tipo ON prontuario_documentos(tipo);
