-- =============================================================================
-- V11: Criar tabelas para Atendimento de Enfermagem (Procedimentos Rápidos)
-- =============================================================================
-- Módulo para gerenciar atendimentos rápidos de enfermagem vindos do
-- Ambulatorial ou UPA, conforme Manual UPA - Procedimentos Rápidos.
-- =============================================================================

-- Tabela: atendimento_enfermagem
CREATE TABLE atendimento_enfermagem (
    id BIGSERIAL PRIMARY KEY,

    -- Relacionamentos
    paciente_id BIGINT NOT NULL,
    unidade_id BIGINT NOT NULL,
    enfermeiro_id BIGINT,

    -- Origem do atendimento
    origem_atendimento VARCHAR(20) NOT NULL, -- AMBULATORIAL, UPA
    origem_id BIGINT, -- ID do atendimento original

    -- Classificação
    prioridade VARCHAR(20) NOT NULL DEFAULT 'ROTINA', -- ROTINA, URGENTE, EMERGENCIA
    status VARCHAR(30) NOT NULL DEFAULT 'AGUARDANDO', -- AGUARDANDO, EM_ATENDIMENTO, FINALIZADO, CANCELADO

    -- Sinais vitais
    pressao_arterial VARCHAR(20),
    frequencia_cardiaca INTEGER,
    frequencia_respiratoria INTEGER,
    temperatura DECIMAL(4,1),
    saturacao_o2 INTEGER,
    glicemia INTEGER,
    escala_dor INTEGER, -- 0 a 10

    -- Informações clínicas
    queixa_principal TEXT,
    observacoes TEXT,
    condicoes_gerais TEXT,

    -- Controle de tempo
    data_hora_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_hora_fim TIMESTAMP,

    -- Auditoria
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    criado_por VARCHAR(255),
    atualizado_por VARCHAR(255),

    -- Foreign keys
    CONSTRAINT fk_atend_enfermagem_paciente FOREIGN KEY (paciente_id) REFERENCES paciente(id),
    CONSTRAINT fk_atend_enfermagem_unidade FOREIGN KEY (unidade_id) REFERENCES unidade_saude(id),
    CONSTRAINT fk_atend_enfermagem_enfermeiro FOREIGN KEY (enfermeiro_id) REFERENCES operador(id),

    -- Constraints
    CONSTRAINT chk_atend_enfermagem_origem CHECK (origem_atendimento IN ('AMBULATORIAL', 'UPA')),
    CONSTRAINT chk_atend_enfermagem_prioridade CHECK (prioridade IN ('ROTINA', 'URGENTE', 'EMERGENCIA')),
    CONSTRAINT chk_atend_enfermagem_status CHECK (status IN ('AGUARDANDO', 'EM_ATENDIMENTO', 'FINALIZADO', 'CANCELADO')),
    CONSTRAINT chk_atend_enfermagem_fc CHECK (frequencia_cardiaca IS NULL OR (frequencia_cardiaca >= 30 AND frequencia_cardiaca <= 250)),
    CONSTRAINT chk_atend_enfermagem_fr CHECK (frequencia_respiratoria IS NULL OR (frequencia_respiratoria >= 8 AND frequencia_respiratoria <= 60)),
    CONSTRAINT chk_atend_enfermagem_temp CHECK (temperatura IS NULL OR (temperatura >= 30.0 AND temperatura <= 45.0)),
    CONSTRAINT chk_atend_enfermagem_sat CHECK (saturacao_o2 IS NULL OR (saturacao_o2 >= 0 AND saturacao_o2 <= 100)),
    CONSTRAINT chk_atend_enfermagem_glicemia CHECK (glicemia IS NULL OR (glicemia >= 0 AND glicemia <= 600)),
    CONSTRAINT chk_atend_enfermagem_dor CHECK (escala_dor IS NULL OR (escala_dor >= 0 AND escala_dor <= 10))
);

-- Índices para otimização
CREATE INDEX idx_atend_enfermagem_paciente ON atendimento_enfermagem(paciente_id);
CREATE INDEX idx_atend_enfermagem_unidade ON atendimento_enfermagem(unidade_id);
CREATE INDEX idx_atend_enfermagem_enfermeiro ON atendimento_enfermagem(enfermeiro_id);
CREATE INDEX idx_atend_enfermagem_status ON atendimento_enfermagem(status);
CREATE INDEX idx_atend_enfermagem_origem ON atendimento_enfermagem(origem_atendimento, origem_id);
CREATE INDEX idx_atend_enfermagem_data ON atendimento_enfermagem(data_hora_inicio DESC);
CREATE INDEX idx_atend_enfermagem_fila ON atendimento_enfermagem(unidade_id, status, prioridade DESC, data_hora_inicio ASC);

-- Comentários
COMMENT ON TABLE atendimento_enfermagem IS 'Atendimentos de enfermagem (procedimentos rápidos) vindos do Ambulatorial ou UPA';
COMMENT ON COLUMN atendimento_enfermagem.origem_atendimento IS 'Origem do paciente: AMBULATORIAL ou UPA';
COMMENT ON COLUMN atendimento_enfermagem.origem_id IS 'ID do atendimento original (Ambulatorial ou UPA)';
COMMENT ON COLUMN atendimento_enfermagem.prioridade IS 'Prioridade: ROTINA, URGENTE, EMERGENCIA';
COMMENT ON COLUMN atendimento_enfermagem.status IS 'Status: AGUARDANDO, EM_ATENDIMENTO, FINALIZADO, CANCELADO';

-- =============================================================================

-- Tabela: procedimento_enfermagem
CREATE TABLE procedimento_enfermagem (
    id BIGSERIAL PRIMARY KEY,

    -- Relacionamento
    atendimento_id BIGINT NOT NULL,
    executor_id BIGINT,

    -- Tipo e status
    tipo_procedimento VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE', -- PENDENTE, EM_EXECUCAO, CONCLUIDO, CANCELADO

    -- Campos específicos para MEDICAÇÃO
    medicamento_nome VARCHAR(255),
    medicamento_dose VARCHAR(100),
    medicamento_via VARCHAR(50), -- IM, EV, SC, ORAL
    medicamento_lote VARCHAR(100),
    medicamento_data_aplicacao TIMESTAMP,

    -- Campos específicos para CURATIVO
    curativo_localizacao VARCHAR(255),
    curativo_tipo VARCHAR(100),
    curativo_material_utilizado TEXT,
    curativo_aspecto VARCHAR(255),

    -- Campos específicos para SUTURA
    sutura_localizacao VARCHAR(255),
    sutura_numero_pontos INTEGER,
    sutura_fio_tipo VARCHAR(100),
    sutura_tecnica VARCHAR(100),

    -- Campos específicos para NEBULIZAÇÃO
    nebulizacao_medicamento VARCHAR(255),
    nebulizacao_dose VARCHAR(100),
    nebulizacao_tempo INTEGER, -- em minutos

    -- Campos específicos para OXIGENIOTERAPIA
    oxigenio_fluxo INTEGER, -- litros por minuto
    oxigenio_dispositivo VARCHAR(100), -- cateter nasal, máscara, etc.

    -- Campos específicos para SONDAGEM
    sondagem_tipo VARCHAR(100), -- vesical, nasogástrica, etc.
    sondagem_numero VARCHAR(50),
    sondagem_fixacao VARCHAR(255),

    -- Observações gerais
    observacoes TEXT,
    complicacoes TEXT,

    -- Controle de tempo
    data_hora_inicio TIMESTAMP,
    data_hora_fim TIMESTAMP,

    -- Auditoria
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    criado_por VARCHAR(255),
    atualizado_por VARCHAR(255),

    -- Foreign keys
    CONSTRAINT fk_proc_enfermagem_atendimento FOREIGN KEY (atendimento_id) REFERENCES atendimento_enfermagem(id) ON DELETE CASCADE,
    CONSTRAINT fk_proc_enfermagem_executor FOREIGN KEY (executor_id) REFERENCES operador(id),

    -- Constraints
    CONSTRAINT chk_proc_enfermagem_tipo CHECK (tipo_procedimento IN (
        'CURATIVO_SIMPLES', 'CURATIVO_COMPLEXO',
        'MEDICACAO_IM', 'MEDICACAO_EV', 'MEDICACAO_SC', 'MEDICACAO_ORAL',
        'NEBULIZACAO', 'OXIGENIOTERAPIA',
        'SUTURA_SIMPLES', 'SUTURA_COMPLEXA', 'RETIRADA_PONTOS',
        'SONDAGEM_VESICAL', 'SONDAGEM_NASOGASTRICA', 'SONDAGEM_NASOENTERICA',
        'GLICEMIA_CAPILAR', 'AFERACAO_PA', 'ECG',
        'LAVAGEM_GASTRICA', 'OUTROS'
    )),
    CONSTRAINT chk_proc_enfermagem_status CHECK (status IN ('PENDENTE', 'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO'))
);

-- Índices para otimização
CREATE INDEX idx_proc_enfermagem_atendimento ON procedimento_enfermagem(atendimento_id);
CREATE INDEX idx_proc_enfermagem_executor ON procedimento_enfermagem(executor_id);
CREATE INDEX idx_proc_enfermagem_tipo ON procedimento_enfermagem(tipo_procedimento);
CREATE INDEX idx_proc_enfermagem_status ON procedimento_enfermagem(status);
CREATE INDEX idx_proc_enfermagem_data ON procedimento_enfermagem(criado_em DESC);

-- Comentários
COMMENT ON TABLE procedimento_enfermagem IS 'Procedimentos rápidos de enfermagem: curativos, medicação, suturas, nebulização, etc.';
COMMENT ON COLUMN procedimento_enfermagem.tipo_procedimento IS 'Tipo: CURATIVO_SIMPLES, MEDICACAO_IM, SUTURA_SIMPLES, NEBULIZACAO, etc.';
COMMENT ON COLUMN procedimento_enfermagem.status IS 'Status: PENDENTE, EM_EXECUCAO, CONCLUIDO, CANCELADO';
COMMENT ON COLUMN procedimento_enfermagem.medicamento_via IS 'Via de administração: IM (intramuscular), EV (endovenosa), SC (subcutânea), ORAL';

-- =============================================================================
-- FIM DA MIGRATION V11
-- =============================================================================
