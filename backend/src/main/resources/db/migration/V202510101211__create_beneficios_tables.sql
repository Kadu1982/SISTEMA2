-- Migration para criar as tabelas do módulo de Benefícios da Assistência Social

-- 1. Tabela de tipos de benefício
CREATE TABLE IF NOT EXISTS tipos_beneficio (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    data_cadastro TIMESTAMP,
    data_atualizacao TIMESTAMP,
    usuario_cadastro VARCHAR(255),
    usuario_atualizacao VARCHAR(255)
);

-- 2. Tabela de subtipos de benefício
CREATE TABLE IF NOT EXISTS subtipos_beneficio (
    id BIGSERIAL PRIMARY KEY,
    tipo_beneficio_id BIGINT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    data_cadastro TIMESTAMP,
    data_atualizacao TIMESTAMP,
    usuario_cadastro VARCHAR(255),
    usuario_atualizacao VARCHAR(255),
    CONSTRAINT fk_subtipo_tipo_beneficio FOREIGN KEY (tipo_beneficio_id)
        REFERENCES tipos_beneficio(id) ON DELETE CASCADE
);

-- 3. Tabela de benefícios
CREATE TABLE IF NOT EXISTS beneficios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo_beneficio_id BIGINT NOT NULL,
    subtipo_beneficio_id BIGINT,
    valor_base DECIMAL(10, 2),
    numero_lei VARCHAR(255),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    controle_quota BOOLEAN DEFAULT false,
    data_cadastro TIMESTAMP,
    data_atualizacao TIMESTAMP,
    usuario_cadastro VARCHAR(255),
    usuario_atualizacao VARCHAR(255),
    CONSTRAINT fk_beneficio_tipo FOREIGN KEY (tipo_beneficio_id)
        REFERENCES tipos_beneficio(id) ON DELETE CASCADE,
    CONSTRAINT fk_beneficio_subtipo FOREIGN KEY (subtipo_beneficio_id)
        REFERENCES subtipos_beneficio(id) ON DELETE SET NULL
);

-- 4. Tabela de dispensações de benefício
CREATE TABLE IF NOT EXISTS dispensacoes_beneficio (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    familia_id BIGINT,
    unidade_id BIGINT NOT NULL,
    profissional_id BIGINT NOT NULL,
    data_dispensacao TIMESTAMP NOT NULL,
    valor_total DECIMAL(10, 2),
    observacoes TEXT,
    situacao VARCHAR(50) DEFAULT 'PENDENTE',
    data_autorizacao TIMESTAMP,
    usuario_autorizacao_id BIGINT,
    data_rejeicao TIMESTAMP,
    usuario_rejeicao_id BIGINT,
    motivo_rejeicao TEXT,
    data_cancelamento TIMESTAMP,
    usuario_cancelamento_id BIGINT,
    motivo_cancelamento TEXT,
    data_cadastro TIMESTAMP,
    usuario_cadastro VARCHAR(255),
    CONSTRAINT fk_dispensacao_paciente FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispensacao_familia FOREIGN KEY (familia_id)
        REFERENCES familias(id) ON DELETE SET NULL,
    CONSTRAINT fk_dispensacao_unidade FOREIGN KEY (unidade_id)
        REFERENCES unidades_assistenciais(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispensacao_profissional FOREIGN KEY (profissional_id)
        REFERENCES operador(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispensacao_usuario_autorizacao FOREIGN KEY (usuario_autorizacao_id)
        REFERENCES operador(id) ON DELETE SET NULL,
    CONSTRAINT fk_dispensacao_usuario_rejeicao FOREIGN KEY (usuario_rejeicao_id)
        REFERENCES operador(id) ON DELETE SET NULL,
    CONSTRAINT fk_dispensacao_usuario_cancelamento FOREIGN KEY (usuario_cancelamento_id)
        REFERENCES operador(id) ON DELETE SET NULL
);

-- 5. Tabela de itens de dispensação de benefício
CREATE TABLE IF NOT EXISTS itens_dispensacao_beneficio (
    id BIGSERIAL PRIMARY KEY,
    dispensacao_id BIGINT NOT NULL,
    beneficio_id BIGINT NOT NULL,
    quantidade INTEGER NOT NULL,
    valor_unitario DECIMAL(10, 2) NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_item_dispensacao FOREIGN KEY (dispensacao_id)
        REFERENCES dispensacoes_beneficio(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_beneficio FOREIGN KEY (beneficio_id)
        REFERENCES beneficios(id) ON DELETE CASCADE
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_subtipos_tipo ON subtipos_beneficio(tipo_beneficio_id);
CREATE INDEX IF NOT EXISTS idx_beneficios_tipo ON beneficios(tipo_beneficio_id);
CREATE INDEX IF NOT EXISTS idx_beneficios_subtipo ON beneficios(subtipo_beneficio_id);
CREATE INDEX IF NOT EXISTS idx_dispensacoes_paciente ON dispensacoes_beneficio(paciente_id);
CREATE INDEX IF NOT EXISTS idx_dispensacoes_familia ON dispensacoes_beneficio(familia_id);
CREATE INDEX IF NOT EXISTS idx_dispensacoes_unidade ON dispensacoes_beneficio(unidade_id);
CREATE INDEX IF NOT EXISTS idx_dispensacoes_situacao ON dispensacoes_beneficio(situacao);
CREATE INDEX IF NOT EXISTS idx_itens_dispensacao ON itens_dispensacao_beneficio(dispensacao_id);
CREATE INDEX IF NOT EXISTS idx_itens_beneficio ON itens_dispensacao_beneficio(beneficio_id);
