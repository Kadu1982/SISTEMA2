-- ===========================================================
-- GARANTIR EXISTÊNCIA DA TABELA SAMU_CONFIGURACAO
-- Data: 02/10/2025
-- Descrição: Garante que a tabela samu_configuracao existe no banco
-- ===========================================================

CREATE TABLE IF NOT EXISTS samu_configuracao (
    id BIGSERIAL PRIMARY KEY,
    unidade_id BIGINT NOT NULL UNIQUE,
    -- Campos de Solicitação
    informar_tipo_ocorrencia VARCHAR(20) DEFAULT 'NAO_OBRIGATORIO' CHECK (informar_tipo_ocorrencia IN ('NAO', 'OBRIGATORIO', 'NAO_OBRIGATORIO')),
    informar_tipo_solicitante VARCHAR(20) DEFAULT 'NAO_OBRIGATORIO' CHECK (informar_tipo_solicitante IN ('NAO', 'OBRIGATORIO', 'NAO_OBRIGATORIO')),
    informar_tipo_ligacao VARCHAR(20) DEFAULT 'NAO_OBRIGATORIO' CHECK (informar_tipo_ligacao IN ('NAO', 'OBRIGATORIO', 'NAO_OBRIGATORIO')),
    tipo_ligacao_padrao BIGINT,
    informar_origem_solicitacao VARCHAR(20) DEFAULT 'NAO_OBRIGATORIO' CHECK (informar_origem_solicitacao IN ('NAO', 'OBRIGATORIO', 'NAO_OBRIGATORIO')),
    informar_usuario_solicitacao BOOLEAN DEFAULT TRUE,
    -- Situações padrão
    situacao_amb_iniciar_etapa BIGINT,
    situacao_amb_encerrar_etapa BIGINT,
    -- Períodos dos Estágios (Dias)
    periodo_solicitacoes_samu INTEGER DEFAULT 30,
    periodo_atendimento_solicitacoes INTEGER DEFAULT 30,
    periodo_solicitacoes_ambulancia INTEGER DEFAULT 30,
    -- Períodos de Recarga (Segundos)
    recarga_solicitacoes_samu INTEGER DEFAULT 30,
    recarga_atendimento_solicitacoes INTEGER DEFAULT 30,
    recarga_solicitacoes_ambulancia INTEGER DEFAULT 30,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP,
    CONSTRAINT fk_configuracao_unidade FOREIGN KEY (unidade_id)
        REFERENCES unidades_saude(id)
);

-- ===========================================================
-- COMENTÁRIOS NAS COLUNAS
-- ===========================================================
COMMENT ON TABLE samu_configuracao IS 'Configurações do módulo SAMU por unidade de saúde';
COMMENT ON COLUMN samu_configuracao.unidade_id IS 'ID da unidade de saúde (chave única)';
COMMENT ON COLUMN samu_configuracao.informar_tipo_ocorrencia IS 'Configuração de obrigatoriedade do tipo de ocorrência';
COMMENT ON COLUMN samu_configuracao.informar_tipo_solicitante IS 'Configuração de obrigatoriedade do tipo de solicitante';
COMMENT ON COLUMN samu_configuracao.informar_tipo_ligacao IS 'Configuração de obrigatoriedade do tipo de ligação';
COMMENT ON COLUMN samu_configuracao.informar_usuario_solicitacao IS 'Se deve informar usuário na solicitação';
COMMENT ON COLUMN samu_configuracao.periodo_solicitacoes_samu IS 'Período em dias para exibir solicitações SAMU';
COMMENT ON COLUMN samu_configuracao.periodo_atendimento_solicitacoes IS 'Período em dias para atendimento de solicitações';
COMMENT ON COLUMN samu_configuracao.periodo_solicitacoes_ambulancia IS 'Período em dias para solicitações de ambulância';
COMMENT ON COLUMN samu_configuracao.recarga_solicitacoes_samu IS 'Intervalo de recarga em segundos para solicitações SAMU';
COMMENT ON COLUMN samu_configuracao.recarga_atendimento_solicitacoes IS 'Intervalo de recarga em segundos para atendimento';
COMMENT ON COLUMN samu_configuracao.recarga_solicitacoes_ambulancia IS 'Intervalo de recarga em segundos para ambulâncias';

-- ===========================================================
-- ÍNDICES PARA PERFORMANCE
-- ===========================================================
CREATE INDEX IF NOT EXISTS idx_samu_configuracao_unidade 
    ON samu_configuracao(unidade_id);