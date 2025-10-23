-- Create controle_acesso table for access control

CREATE TABLE controle_acesso (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    documento VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(50) CHECK (tipo_documento IN ('CPF', 'RG', 'CNH', 'PASSAPORTE')),
    tipo_visitante VARCHAR(50) CHECK (tipo_visitante IN ('VISITANTE', 'ACOMPANHANTE', 'FORNECEDOR', 'PRESTADOR_SERVICO', 'PACIENTE')),
    paciente_id BIGINT,
    grau_parentesco VARCHAR(255),
    telefone VARCHAR(50),
    empresa_fornecedor VARCHAR(255),
    setor_destino VARCHAR(255),
    responsavel_liberacao_id BIGINT,
    data_entrada TIMESTAMP NOT NULL,
    data_saida TIMESTAMP,
    observacoes TEXT,
    numero_cracha VARCHAR(100),
    foto_path VARCHAR(500),
    status VARCHAR(50) CHECK (status IN ('DENTRO', 'SAIU', 'CANCELADO')) DEFAULT 'DENTRO',
    unidade_id BIGINT
);

-- Create indexes for performance
CREATE INDEX idx_controle_acesso_documento ON controle_acesso(documento);
CREATE INDEX idx_controle_acesso_paciente_id ON controle_acesso(paciente_id);
CREATE INDEX idx_controle_acesso_responsavel_liberacao_id ON controle_acesso(responsavel_liberacao_id);
CREATE INDEX idx_controle_acesso_unidade_id ON controle_acesso(unidade_id);
CREATE INDEX idx_controle_acesso_data_entrada ON controle_acesso(data_entrada);
CREATE INDEX idx_controle_acesso_status ON controle_acesso(status);