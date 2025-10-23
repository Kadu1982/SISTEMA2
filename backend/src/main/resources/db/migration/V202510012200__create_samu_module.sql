-- ===========================================================
-- CRIAÇÃO DO MÓDULO SAMU - Serviço de Atendimento Móvel de Urgência
-- Data: 01/10/2025
-- ===========================================================

-- ===========================================================
-- 1. CENTRAL DE REGULAÇÃO
-- ===========================================================
CREATE TABLE IF NOT EXISTS samu_central_regulacao (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    endereco VARCHAR(500) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(10),
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    horario_funcionamento VARCHAR(255),
    capacidade_maxima INTEGER,
    ocupacao_atual INTEGER DEFAULT 0,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    email_contato VARCHAR(255),
    responsavel VARCHAR(255),
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP
);

-- ===========================================================
-- 2. BASE OPERACIONAL
-- ===========================================================
CREATE TABLE IF NOT EXISTS samu_base_operacional (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    endereco VARCHAR(500) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(10),
    central_regulacao_id BIGINT NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    telefone VARCHAR(20),
    responsavel VARCHAR(255),
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP,
    CONSTRAINT fk_base_central FOREIGN KEY (central_regulacao_id)
        REFERENCES samu_central_regulacao(id)
);

-- ===========================================================
-- 3. VIATURAS (AMBULÂNCIAS)
-- ===========================================================
CREATE TABLE IF NOT EXISTS samu_viatura (
    id BIGSERIAL PRIMARY KEY,
    identificacao VARCHAR(50) NOT NULL UNIQUE,
    placa VARCHAR(10),
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('USA', 'USB', 'VT', 'VIR', 'MOTOLANCIA', 'AMBULANCHA', 'HELICOPTERO')),
    status VARCHAR(30) NOT NULL CHECK (status IN ('DISPONIVEL', 'A_CAMINHO', 'NO_LOCAL', 'TRANSPORTANDO', 'RETORNANDO_BASE', 'INDISPONIVEL', 'MANUTENCAO', 'AVARIADA')),
    base_id BIGINT NOT NULL,
    km_atual INTEGER,
    combustivel_atual DECIMAL(5,2),
    observacoes TEXT,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP,
    CONSTRAINT fk_viatura_base FOREIGN KEY (base_id)
        REFERENCES samu_base_operacional(id)
);

-- ===========================================================
-- 4. EQUIPE VIATURA
-- ===========================================================
CREATE TABLE IF NOT EXISTS samu_equipe_viatura (
    id BIGSERIAL PRIMARY KEY,
    viatura_id BIGINT NOT NULL,
    profissional_id BIGINT NOT NULL,
    funcao VARCHAR(50) NOT NULL CHECK (funcao IN ('MEDICO', 'ENFERMEIRO', 'TECNICO_ENFERMAGEM', 'MOTORISTA', 'SOCORRISTA')),
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_equipe_viatura FOREIGN KEY (viatura_id)
        REFERENCES samu_viatura(id),
    CONSTRAINT fk_equipe_profissional FOREIGN KEY (profissional_id)
        REFERENCES profissional(id)
);

-- ===========================================================
-- 5. EQUIPAMENTO VIATURA
-- ===========================================================
CREATE TABLE IF NOT EXISTS samu_equipamento_viatura (
    id BIGSERIAL PRIMARY KEY,
    viatura_id BIGINT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    numero_serie VARCHAR(100),
    status_operacional VARCHAR(30) CHECK (status_operacional IN ('OPERACIONAL', 'MANUTENCAO', 'DANIFICADO', 'INDISPONIVEL')),
    status_alerta VARCHAR(10) DEFAULT 'OK',
    data_ultima_manutencao TIMESTAMP,
    proxima_manutencao TIMESTAMP,
    observacoes TEXT,
    CONSTRAINT fk_equipamento_viatura FOREIGN KEY (viatura_id)
        REFERENCES samu_viatura(id)
);

-- ===========================================================
-- 6. OCORRÊNCIAS
-- ===========================================================
CREATE TABLE IF NOT EXISTS samu_ocorrencia (
    id BIGSERIAL PRIMARY KEY,
    numero_ocorrencia VARCHAR(50) NOT NULL UNIQUE,
    tipo_ocorrencia VARCHAR(50) NOT NULL CHECK (tipo_ocorrencia IN ('CLINICA', 'TRAUMATICA', 'OBSTETRICA', 'PEDIATRICA', 'PSIQUIATRICA', 'OUTRA')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('ABERTA', 'AGUARDANDO_REGULACAO', 'REGULADA', 'EM_ATENDIMENTO', 'FINALIZADA', 'CANCELADA')),
    prioridade VARCHAR(30) NOT NULL CHECK (prioridade IN ('EMERGENCIA', 'URGENTE', 'POUCO_URGENTE', 'NAO_URGENTE')),
    telefone_solicitante VARCHAR(20) NOT NULL,
    nome_solicitante VARCHAR(255),
    endereco_completo TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    descricao_ocorrencia TEXT NOT NULL,
    queixa_principal TEXT,
    central_regulacao_id BIGINT NOT NULL,
    operador_id BIGINT NOT NULL,
    medico_regulador_id BIGINT,
    data_abertura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_encerramento TIMESTAMP,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP,
    observacoes TEXT,
    recurso_apoio_externo VARCHAR(255),
    CONSTRAINT fk_ocorrencia_central FOREIGN KEY (central_regulacao_id)
        REFERENCES samu_central_regulacao(id),
    CONSTRAINT fk_ocorrencia_operador FOREIGN KEY (operador_id)
        REFERENCES operador(id),
    CONSTRAINT fk_ocorrencia_medico FOREIGN KEY (medico_regulador_id)
        REFERENCES operador(id)
);

-- ===========================================================
-- 7. PACIENTE OCORRÊNCIA
-- ===========================================================
CREATE TABLE IF NOT EXISTS samu_paciente_ocorrencia (
    id BIGSERIAL PRIMARY KEY,
    ocorrencia_id BIGINT NOT NULL,
    nome_informado VARCHAR(255) NOT NULL,
    idade_anos INTEGER,
    idade_meses INTEGER,
    sexo VARCHAR(1) CHECK (sexo IN ('M', 'F', 'O')),
    queixa_especifica TEXT,
    -- Regulação Médica
    hipotese_diagnostica TEXT,
    risco_presumido VARCHAR(30) CHECK (risco_presumido IN ('CRITICO', 'ALTO', 'MODERADO', 'BAIXO')),
    quadro_clinico TEXT,
    antecedentes TEXT,
    unidade_destino_id BIGINT,
    -- Sinais Vitais
    pressao_arterial VARCHAR(20),
    frequencia_cardiaca INTEGER,
    frequencia_respiratoria INTEGER,
    saturacao_oxigenio INTEGER,
    temperatura DECIMAL(4,2),
    escala_glasgow INTEGER,
    -- Controle
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_regulacao TIMESTAMP,
    CONSTRAINT fk_paciente_ocorrencia FOREIGN KEY (ocorrencia_id)
        REFERENCES samu_ocorrencia(id) ON DELETE CASCADE,
    CONSTRAINT fk_paciente_unidade_destino FOREIGN KEY (unidade_destino_id)
        REFERENCES unidades_saude(id)
);

-- ===========================================================
-- 8. VIATURA OCORRÊNCIA (Vínculo de Ambulância)
-- ===========================================================
CREATE TABLE IF NOT EXISTS samu_viatura_ocorrencia (
    id BIGSERIAL PRIMARY KEY,
    ocorrencia_id BIGINT NOT NULL,
    viatura_id BIGINT NOT NULL,
    data_acionamento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_saida_base TIMESTAMP,
    data_chegada_local TIMESTAMP,
    data_saida_local TIMESTAMP,
    data_chegada_destino TIMESTAMP,
    data_retorno_base TIMESTAMP,
    km_inicial INTEGER,
    km_final INTEGER,
    observacoes TEXT,
    CONSTRAINT fk_viatura_ocorrencia_ocorrencia FOREIGN KEY (ocorrencia_id)
        REFERENCES samu_ocorrencia(id) ON DELETE CASCADE,
    CONSTRAINT fk_viatura_ocorrencia_viatura FOREIGN KEY (viatura_id)
        REFERENCES samu_viatura(id)
);

-- ===========================================================
-- 9. EVENTOS DA OCORRÊNCIA (Timeline)
-- ===========================================================
CREATE TABLE IF NOT EXISTS samu_evento_ocorrencia (
    id BIGSERIAL PRIMARY KEY,
    ocorrencia_id BIGINT NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN (
        'ABERTURA_OCORRENCIA',
        'ENCAMINHAMENTO_REGULACAO',
        'REGULACAO_CONCLUIDA',
        'VIATURA_ACIONADA',
        'VIATURA_SAIU_BASE',
        'VIATURA_CHEGOU_LOCAL',
        'VIATURA_SAIU_LOCAL',
        'VIATURA_CHEGOU_DESTINO',
        'VIATURA_RETORNOU_BASE',
        'ADICAO_PACIENTE',
        'ATUALIZACAO_LOCALIZACAO',
        'ENCERRAMENTO_OCORRENCIA',
        'CANCELAMENTO',
        'OUTRO'
    )),
    descricao TEXT NOT NULL,
    operador_id BIGINT,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dados_adicionais TEXT,
    CONSTRAINT fk_evento_ocorrencia FOREIGN KEY (ocorrencia_id)
        REFERENCES samu_ocorrencia(id) ON DELETE CASCADE,
    CONSTRAINT fk_evento_operador FOREIGN KEY (operador_id)
        REFERENCES operador(id)
);

-- ===========================================================
-- 10. CONFIGURAÇÃO DO MÓDULO SAMU
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
-- 11. TIPOS DE SOLICITANTE
-- ===========================================================
CREATE TABLE IF NOT EXISTS samu_tipo_solicitante (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 12. TIPOS DE LIGAÇÃO
-- ===========================================================
CREATE TABLE IF NOT EXISTS samu_tipo_ligacao (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    encerramento BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 13. ORIGENS DE SOLICITAÇÃO
-- ===========================================================
CREATE TABLE IF NOT EXISTS samu_origem_solicitacao (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- 14. TIPOS DE ENCAMINHAMENTO
-- ===========================================================
CREATE TABLE IF NOT EXISTS samu_tipo_encaminhamento (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    encerramento BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- ÍNDICES PARA PERFORMANCE
-- ===========================================================

-- Índices para Ocorrência
CREATE INDEX IF NOT EXISTS idx_ocorrencia_status ON samu_ocorrencia(status);
CREATE INDEX IF NOT EXISTS idx_ocorrencia_prioridade ON samu_ocorrencia(prioridade);
CREATE INDEX IF NOT EXISTS idx_ocorrencia_central ON samu_ocorrencia(central_regulacao_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencia_operador ON samu_ocorrencia(operador_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencia_data_abertura ON samu_ocorrencia(data_abertura);
CREATE INDEX IF NOT EXISTS idx_ocorrencia_numero ON samu_ocorrencia(numero_ocorrencia);

-- Índices para Viatura
CREATE INDEX IF NOT EXISTS idx_viatura_status ON samu_viatura(status);
CREATE INDEX IF NOT EXISTS idx_viatura_tipo ON samu_viatura(tipo);
CREATE INDEX IF NOT EXISTS idx_viatura_base ON samu_viatura(base_id);
CREATE INDEX IF NOT EXISTS idx_viatura_ativa ON samu_viatura(ativa);

-- Índices para Paciente Ocorrência
CREATE INDEX IF NOT EXISTS idx_paciente_ocorrencia ON samu_paciente_ocorrencia(ocorrencia_id);
CREATE INDEX IF NOT EXISTS idx_paciente_risco ON samu_paciente_ocorrencia(risco_presumido);

-- Índices para Eventos
CREATE INDEX IF NOT EXISTS idx_evento_ocorrencia ON samu_evento_ocorrencia(ocorrencia_id);
CREATE INDEX IF NOT EXISTS idx_evento_tipo ON samu_evento_ocorrencia(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_evento_data ON samu_evento_ocorrencia(data_hora);

-- Índices para Viatura Ocorrência
CREATE INDEX IF NOT EXISTS idx_viatura_ocorrencia_ocorrencia ON samu_viatura_ocorrencia(ocorrencia_id);
CREATE INDEX IF NOT EXISTS idx_viatura_ocorrencia_viatura ON samu_viatura_ocorrencia(viatura_id);

-- ===========================================================
-- DADOS INICIAIS - CADASTROS BÁSICOS
-- ===========================================================

-- Tipos de Solicitante
INSERT INTO samu_tipo_solicitante (nome, descricao) VALUES
('Próprio Paciente', 'O paciente está solicitando atendimento'),
('Familiar', 'Familiar do paciente solicitando atendimento'),
('Terceiro', 'Testemunha ou pessoa que presenciou a ocorrência'),
('Unidade de Saúde', 'Solicitação de transferência de unidade de saúde'),
('Polícia', 'Solicitação via Polícia Militar ou Civil'),
('Bombeiros', 'Solicitação via Corpo de Bombeiros')
ON CONFLICT DO NOTHING;

-- Tipos de Ligação
INSERT INTO samu_tipo_ligacao (nome, descricao, encerramento) VALUES
('Emergência', 'Ligação de emergência que requer atendimento imediato', false),
('Urgência', 'Ligação urgente que requer atendimento rápido', false),
('Trote', 'Ligação identificada como trote', true),
('Informação', 'Ligação solicitando informações', true),
('Falso Alarme', 'Alarme falso, situação não caracteriza emergência', true),
('Engano', 'Ligação por engano', true)
ON CONFLICT DO NOTHING;

-- Origens de Solicitação
INSERT INTO samu_origem_solicitacao (nome, descricao) VALUES
('Telefone 192', 'Chamada recebida via 192'),
('Unidade de Saúde', 'Solicitação de unidade de saúde'),
('Polícia/Bombeiros', 'Solicitação via forças de segurança'),
('Rádio', 'Solicitação via comunicação de rádio'),
('Sistema Integrado', 'Solicitação via sistema integrado de emergências')
ON CONFLICT DO NOTHING;

-- Tipos de Encaminhamento
INSERT INTO samu_tipo_encaminhamento (nome, descricao, encerramento) VALUES
('Encaminhar Ambulância', 'Encaminhar ambulância para o local', false),
('Orientação Telefônica', 'Orientação médica por telefone, não requer ambulância', true),
('Encaminhar UBS', 'Encaminhar paciente para UBS mais próxima', false),
('Encaminhar Hospital', 'Encaminhar paciente para hospital', false),
('Negado', 'Atendimento negado por não caracterizar emergência', true),
('Cancelado pelo Solicitante', 'Solicitante cancelou o pedido', true)
ON CONFLICT DO NOTHING;

-- ===========================================================
-- COMENTÁRIOS DAS TABELAS
-- ===========================================================
COMMENT ON TABLE samu_central_regulacao IS 'Centrais de regulação que coordenam as operações SAMU';
COMMENT ON TABLE samu_base_operacional IS 'Bases operacionais onde ficam as viaturas';
COMMENT ON TABLE samu_viatura IS 'Viaturas/Ambulâncias do SAMU (USA, USB, VT, etc.)';
COMMENT ON TABLE samu_equipe_viatura IS 'Equipe alocada em cada viatura';
COMMENT ON TABLE samu_equipamento_viatura IS 'Equipamentos e materiais da viatura';
COMMENT ON TABLE samu_ocorrencia IS 'Registro de ocorrências/chamadas do SAMU';
COMMENT ON TABLE samu_paciente_ocorrencia IS 'Pacientes envolvidos em cada ocorrência';
COMMENT ON TABLE samu_viatura_ocorrencia IS 'Vínculo entre viatura e ocorrência com tempos de atendimento';
COMMENT ON TABLE samu_evento_ocorrencia IS 'Timeline de eventos de cada ocorrência';
COMMENT ON TABLE samu_configuracao IS 'Configurações do módulo SAMU por unidade';
COMMENT ON TABLE samu_tipo_solicitante IS 'Tipos de solicitantes (paciente, familiar, terceiro, etc.)';
COMMENT ON TABLE samu_tipo_ligacao IS 'Tipos de ligação (emergência, trote, informação, etc.)';
COMMENT ON TABLE samu_origem_solicitacao IS 'Origens das solicitações (192, unidade, polícia, etc.)';
COMMENT ON TABLE samu_tipo_encaminhamento IS 'Tipos de encaminhamento (ambulância, orientação, etc.)';
