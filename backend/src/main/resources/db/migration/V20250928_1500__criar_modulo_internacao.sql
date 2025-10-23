-- =================================================
-- MIGRAÇÃO: Módulo de Internação Hospitalar
-- Data: 2025-09-28 15:00
-- Descrição: Criação das tabelas para o módulo de internação
-- =================================================

-- Criar tabela de pré-internações
CREATE TABLE hospitalar_pre_internacoes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    numero_pre_internacao VARCHAR(50) UNIQUE NOT NULL,
    paciente_id BIGINT NOT NULL REFERENCES pacientes(id),
    leito_reservado_id BIGINT REFERENCES leito(id),
    unidade_id BIGINT NOT NULL,
    medico_responsavel_id BIGINT,
    servico_id BIGINT,

    -- Datas e horários
    data_previsao_internacao DATE NOT NULL,
    hora_previsao_internacao TIME,

    -- Status e tipos
    status_pre_internacao VARCHAR(30) NOT NULL DEFAULT 'AGUARDANDO_LEITO',
    tipo_internacao VARCHAR(20) NOT NULL,
    regime_internacao VARCHAR(20) NOT NULL,
    carater_internacao VARCHAR(20) NOT NULL,
    origem VARCHAR(30) NOT NULL,

    -- Dados clínicos
    cid_principal VARCHAR(10),
    diagnostico TEXT,
    observacoes TEXT,

    -- Convênio
    convenio_id BIGINT,

    -- Acomodação
    enfermaria_preferida VARCHAR(100),
    tipo_acomodacao VARCHAR(20),
    precisa_isolamento BOOLEAN DEFAULT false,
    permite_acompanhante BOOLEAN DEFAULT true,

    -- Reserva de leito
    solicitou_reserva_leito BOOLEAN DEFAULT false,
    data_reserva_leito TIMESTAMP,
    data_solicitacao_leito TIMESTAMP,

    -- Pendências
    tem_pendencias BOOLEAN DEFAULT false,
    pendencias TEXT,

    -- Integração com cirurgia
    data_cirurgia DATE,
    hora_cirurgia TIME,
    agendamento_cirurgia_id BIGINT,

    -- Integração com urgência
    atendimento_urgencia_id BIGINT,

    -- Auditoria
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    operador_criacao_id BIGINT NOT NULL REFERENCES operadores(id),
    data_ultima_atualizacao TIMESTAMP,
    operador_ultima_atualizacao_id BIGINT REFERENCES operadores(id),
    data_efetivacao TIMESTAMP,
    operador_efetivacao_id BIGINT REFERENCES operadores(id),
    data_cancelamento TIMESTAMP,
    operador_cancelamento_id BIGINT REFERENCES operadores(id),
    motivo_cancelamento TEXT,

    -- Referência para internação gerada
    internacao_gerada_id BIGINT,

    CONSTRAINT chk_pre_internacao_status CHECK (
        status_pre_internacao IN ('AGUARDANDO_LEITO', 'LEITO_RESERVADO', 'AGUARDANDO_AUTORIZACAO', 'EFETIVADA', 'CANCELADA')
    ),
    CONSTRAINT chk_pre_internacao_tipo CHECK (
        tipo_internacao IN ('ELETIVA', 'URGENCIA', 'OBSERVACAO')
    ),
    CONSTRAINT chk_pre_internacao_regime CHECK (
        regime_internacao IN ('AMBULATORIAL', 'HOSPITAL_DIA', 'INTERNACAO_INTEGRAL', 'UTI')
    ),
    CONSTRAINT chk_pre_internacao_carater CHECK (
        carater_internacao IN ('ELETIVO', 'URGENCIA', 'ACIDENTE_TRABALHO', 'ACIDENTE_TRANSITO')
    ),
    CONSTRAINT chk_pre_internacao_origem CHECK (
        origem IN ('AMBULATORIO', 'EMERGENCIA', 'TRANSFERENCIA', 'AGENDAMENTO_CIRURGICO', 'CENTRAL_REGULACAO')
    ),
    CONSTRAINT chk_pre_internacao_acomodacao CHECK (
        tipo_acomodacao IN ('ENFERMARIA', 'APARTAMENTO', 'UTI', 'BERÇARIO', 'ISOLAMENTO')
    )
);

-- Criar tabela de internações
CREATE TABLE hospitalar_internacoes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    numero_internacao VARCHAR(50) UNIQUE NOT NULL,
    paciente_id BIGINT NOT NULL REFERENCES pacientes(id),
    leito_id BIGINT REFERENCES leito(id),
    unidade_id BIGINT NOT NULL,
    medico_responsavel_id BIGINT,

    -- Datas e horários
    data_internacao DATE NOT NULL,
    hora_internacao TIME NOT NULL,
    data_prevista_alta DATE,
    data_alta DATE,
    hora_alta TIME,

    -- Status e tipos
    status_internacao VARCHAR(20) NOT NULL DEFAULT 'ATIVA',
    tipo_internacao VARCHAR(20) NOT NULL,
    regime_internacao VARCHAR(20) NOT NULL,
    tipo_alta VARCHAR(30),

    -- Dados clínicos
    cid_principal VARCHAR(10),
    diagnostico_internacao TEXT,
    motivo_alta TEXT,
    cid_alta VARCHAR(10),
    observacoes TEXT,

    -- Convênio
    convenio_id BIGINT,
    numero_carteira VARCHAR(50),

    -- Configurações
    permite_acompanhante BOOLEAN DEFAULT true,

    -- Métricas
    dias_internacao INTEGER,

    -- Auditoria
    data_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    operador_registro_id BIGINT NOT NULL REFERENCES operadores(id),
    data_alta_registro TIMESTAMP,
    operador_alta_id BIGINT REFERENCES operadores(id),

    -- Referência para pré-internação
    pre_internacao_id BIGINT REFERENCES hospitalar_pre_internacoes(id),

    CONSTRAINT chk_internacao_status CHECK (
        status_internacao IN ('ATIVA', 'ALTA_MEDICA', 'ALTA_ADMINISTRATIVA', 'TRANSFERIDA', 'OBITO')
    ),
    CONSTRAINT chk_internacao_tipo CHECK (
        tipo_internacao IN ('ELETIVA', 'URGENCIA', 'OBSERVACAO', 'HOSPITAL_DIA')
    ),
    CONSTRAINT chk_internacao_regime CHECK (
        regime_internacao IN ('AMBULATORIAL', 'HOSPITAL_DIA', 'INTERNACAO_INTEGRAL', 'UTI')
    ),
    CONSTRAINT chk_internacao_tipo_alta CHECK (
        tipo_alta IN ('MEDICA', 'ADMINISTRATIVA', 'TRANSFERENCIA', 'OBITO', 'EVASAO', 'ALTA_PEDIDO')
    )
);

-- Criar tabela de transferências de leito
CREATE TABLE hospitalar_transferencias_leito (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    internacao_id BIGINT NOT NULL REFERENCES hospitalar_internacoes(id),
    leito_origem_id BIGINT NOT NULL REFERENCES leito(id),
    leito_destino_id BIGINT NOT NULL REFERENCES leito(id),

    -- Datas do processo
    data_solicitacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_autorizacao TIMESTAMP,
    data_efetivacao TIMESTAMP,

    -- Status
    status_transferencia VARCHAR(20) NOT NULL DEFAULT 'SOLICITADA',
    tipo_transferencia VARCHAR(30) NOT NULL,

    -- Justificativas
    justificativa_solicitacao TEXT,
    observacoes_autorizacao TEXT,
    observacoes_efetivacao TEXT,

    -- Responsáveis
    operador_solicitacao_id BIGINT NOT NULL REFERENCES operadores(id),
    operador_autorizacao_id BIGINT REFERENCES operadores(id),
    operador_efetivacao_id BIGINT REFERENCES operadores(id),

    CONSTRAINT chk_transferencia_status CHECK (
        status_transferencia IN ('SOLICITADA', 'AUTORIZADA', 'EFETIVADA', 'CANCELADA', 'REJEITADA')
    ),
    CONSTRAINT chk_transferencia_tipo CHECK (
        tipo_transferencia IN ('CLINICA', 'ISOLAMENTO', 'UTI', 'ADMINISTRATIVO', 'LIMPEZA_LEITO', 'COMODIDADE')
    ),
    CONSTRAINT chk_transferencia_leitos_diferentes CHECK (leito_origem_id != leito_destino_id)
);

-- Criar tabela de acompanhantes de internação
CREATE TABLE hospitalar_acompanhantes_internacao (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    internacao_id BIGINT NOT NULL REFERENCES hospitalar_internacoes(id),

    -- Dados pessoais
    nome_completo VARCHAR(200) NOT NULL,
    cpf VARCHAR(14),
    rg VARCHAR(20),
    data_nascimento DATE,
    telefone VARCHAR(20),
    email VARCHAR(100),

    -- Relacionamento
    grau_parentesco VARCHAR(30) NOT NULL,
    responsavel_legal BOOLEAN DEFAULT false,

    -- Período de acompanhamento
    data_inicio_acompanhamento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_fim_acompanhamento TIMESTAMP,
    status_acompanhamento VARCHAR(20) NOT NULL DEFAULT 'ATIVO',

    -- Configurações
    tipo_acompanhamento VARCHAR(30) NOT NULL DEFAULT 'PRESENCIAL',
    permite_revezamento BOOLEAN DEFAULT false,
    pode_receber_informacoes BOOLEAN DEFAULT true,
    pode_tomar_decisoes BOOLEAN DEFAULT false,

    -- Observações médicas
    restricoes_medicas TEXT,
    observacoes TEXT,

    -- Auditoria
    data_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    operador_registro_id BIGINT NOT NULL REFERENCES operadores(id),

    CONSTRAINT chk_acompanhante_status CHECK (
        status_acompanhamento IN ('ATIVO', 'INATIVO', 'SUSPENSO', 'FINALIZADO')
    ),
    CONSTRAINT chk_acompanhante_grau_parentesco CHECK (
        grau_parentesco IN ('PAI', 'MAE', 'FILHO', 'FILHA', 'IRMAO', 'IRMA', 'CONJUGE', 'AVOS', 'NETOS', 'TIOS', 'OUTROS')
    ),
    CONSTRAINT chk_acompanhante_tipo CHECK (
        tipo_acompanhamento IN ('PRESENCIAL', 'REVEZAMENTO', 'ESPORADICO', 'RESPONSAVEL_LEGAL')
    )
);

-- Atualizar tabela de pré-internações para referenciar internação gerada
ALTER TABLE hospitalar_pre_internacoes
ADD CONSTRAINT fk_pre_internacao_gerada
FOREIGN KEY (internacao_gerada_id) REFERENCES hospitalar_internacoes(id);

-- Criar índices para otimização
CREATE INDEX idx_pre_internacao_paciente ON hospitalar_pre_internacoes(paciente_id);
CREATE INDEX idx_pre_internacao_status ON hospitalar_pre_internacoes(status_pre_internacao);
CREATE INDEX idx_pre_internacao_data_previsao ON hospitalar_pre_internacoes(data_previsao_internacao);
CREATE INDEX idx_pre_internacao_unidade ON hospitalar_pre_internacoes(unidade_id);
CREATE INDEX idx_pre_internacao_leito_reservado ON hospitalar_pre_internacoes(leito_reservado_id);

CREATE INDEX idx_internacao_paciente ON hospitalar_internacoes(paciente_id);
CREATE INDEX idx_internacao_status ON hospitalar_internacoes(status_internacao);
CREATE INDEX idx_internacao_data ON hospitalar_internacoes(data_internacao);
CREATE INDEX idx_internacao_leito ON hospitalar_internacoes(leito_id);
CREATE INDEX idx_internacao_unidade ON hospitalar_internacoes(unidade_id);
CREATE INDEX idx_internacao_medico ON hospitalar_internacoes(medico_responsavel_id);

CREATE INDEX idx_transferencia_internacao ON hospitalar_transferencias_leito(internacao_id);
CREATE INDEX idx_transferencia_status ON hospitalar_transferencias_leito(status_transferencia);
CREATE INDEX idx_transferencia_data_solicitacao ON hospitalar_transferencias_leito(data_solicitacao);

CREATE INDEX idx_acompanhante_internacao ON hospitalar_acompanhantes_internacao(internacao_id);
CREATE INDEX idx_acompanhante_status ON hospitalar_acompanhantes_internacao(status_acompanhamento);
CREATE INDEX idx_acompanhante_cpf ON hospitalar_acompanhantes_internacao(cpf);

-- Comentários nas tabelas
COMMENT ON TABLE hospitalar_pre_internacoes IS 'Gerenciamento de pré-internações hospitalares';
COMMENT ON TABLE hospitalar_internacoes IS 'Registro de internações hospitalares';
COMMENT ON TABLE hospitalar_transferencias_leito IS 'Controle de transferências entre leitos';
COMMENT ON TABLE hospitalar_acompanhantes_internacao IS 'Gerenciamento de acompanhantes durante internação';

-- Inserir configurações padrão se necessário
INSERT INTO configuracoes (chave, valor, descricao, tipo, unidade_id) VALUES
('INTERNACAO_NUMERO_AUTOMATICO', 'true', 'Gerar número de internação automaticamente', 'BOOLEAN', NULL),
('INTERNACAO_PREFIXO_NUMERO', 'INT', 'Prefixo para numeração de internações', 'STRING', NULL),
('PRE_INTERNACAO_NUMERO_AUTOMATICO', 'true', 'Gerar número de pré-internação automaticamente', 'BOOLEAN', NULL),
('PRE_INTERNACAO_PREFIXO_NUMERO', 'PI', 'Prefixo para numeração de pré-internações', 'STRING', NULL),
('INTERNACAO_DIAS_MAXIMO_PREVISAO_ALTA', '30', 'Máximo de dias para previsão de alta', 'INTEGER', NULL),
('TRANSFERENCIA_REQUER_AUTORIZACAO', 'true', 'Transferências de leito requerem autorização', 'BOOLEAN', NULL)
ON CONFLICT (chave, unidade_id) DO NOTHING;