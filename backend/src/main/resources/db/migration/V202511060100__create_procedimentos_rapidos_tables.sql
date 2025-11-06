-- ============================================================================
-- Migration: Criação do Módulo de Procedimentos Rápidos
-- Descrição: Cria tabelas para gerenciar procedimentos de enfermagem rápidos
--            (medicação, exames, vacinas) provenientes do atendimento ambulatorial
-- Versão: V36
-- Data: 2025-01-05
-- ============================================================================

-- Tabela principal de procedimentos rápidos
CREATE TABLE IF NOT EXISTS procedimentos_rapidos (
    id BIGSERIAL PRIMARY KEY,

    -- Relacionamentos
    paciente_id BIGINT NOT NULL,
    operador_responsavel_id BIGINT,

    -- Status e origem
    status VARCHAR(50) NOT NULL DEFAULT 'AGUARDANDO',
    origem_encaminhamento VARCHAR(200),
    atendimento_medico_origem_id BIGINT,
    medico_solicitante VARCHAR(200),
    especialidade_origem VARCHAR(100),

    -- Informações clínicas
    alergias VARCHAR(1000),
    observacoes_gerais VARCHAR(2000),

    -- Bloqueio (para controle de concorrência)
    bloqueado_por_operador_id BIGINT,
    bloqueado_em TIMESTAMP,

    -- Timestamps do atendimento
    data_hora_inicio_atendimento TIMESTAMP,
    data_hora_fim_atendimento TIMESTAMP,

    -- Desfecho (Embeddable)
    desfecho_tipo VARCHAR(50),
    desfecho_setor_destino VARCHAR(200),
    desfecho_especialidade VARCHAR(200),
    desfecho_procedimento_solicitado VARCHAR(500),
    desfecho_data_agendada_reavaliacao TIMESTAMP,
    desfecho_observacoes VARCHAR(1000),
    desfecho_data_registro TIMESTAMP,
    desfecho_profissional_responsavel VARCHAR(200),

    -- Cancelamento
    cancelado_por VARCHAR(200),
    motivo_cancelamento VARCHAR(500),
    data_cancelamento TIMESTAMP,

    -- Auditoria
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100),

    -- Constraints
    CONSTRAINT fk_proc_rapido_paciente
        FOREIGN KEY (paciente_id) REFERENCES pacientes (id) ON DELETE RESTRICT,
    CONSTRAINT fk_proc_rapido_operador
        FOREIGN KEY (operador_responsavel_id) REFERENCES operador (id) ON DELETE SET NULL,
    CONSTRAINT fk_proc_rapido_bloqueado_por
        FOREIGN KEY (bloqueado_por_operador_id) REFERENCES operador (id) ON DELETE SET NULL,
    CONSTRAINT chk_status_valido
        CHECK (status IN ('AGUARDANDO', 'EM_ATENDIMENTO', 'FINALIZADO', 'CANCELADO')),
    CONSTRAINT chk_desfecho_tipo_valido
        CHECK (desfecho_tipo IS NULL OR desfecho_tipo IN ('LIBERAR_USUARIO', 'OBSERVACAO', 'ENCAMINHAMENTO_INTERNO', 'REAVALIACAO'))
);

-- Índices para performance
CREATE INDEX idx_proc_rapido_paciente ON procedimentos_rapidos(paciente_id);
CREATE INDEX idx_proc_rapido_status ON procedimentos_rapidos(status);
CREATE INDEX idx_proc_rapido_operador ON procedimentos_rapidos(operador_responsavel_id);
CREATE INDEX idx_proc_rapido_data_criacao ON procedimentos_rapidos(data_criacao DESC);
CREATE INDEX idx_proc_rapido_bloqueado_por ON procedimentos_rapidos(bloqueado_por_operador_id);

-- Comentários
COMMENT ON TABLE procedimentos_rapidos IS 'Procedimentos rápidos de enfermagem (medicação, exames, vacinas)';
COMMENT ON COLUMN procedimentos_rapidos.status IS 'Status do procedimento: AGUARDANDO, EM_ATENDIMENTO, FINALIZADO, CANCELADO';
COMMENT ON COLUMN procedimentos_rapidos.bloqueado_por_operador_id IS 'ID do operador que bloqueou o procedimento para edição';

-- ============================================================================
-- Tabela de atividades de enfermagem
-- ============================================================================
CREATE TABLE IF NOT EXISTS atividades_enfermagem (
    id BIGSERIAL PRIMARY KEY,

    -- Relacionamento
    procedimento_rapido_id BIGINT NOT NULL,

    -- Dados da atividade
    tipo VARCHAR(50) NOT NULL,
    atividade VARCHAR(500) NOT NULL,
    situacao VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',

    -- Execução
    data_hora_inicial TIMESTAMP,
    data_hora_final TIMESTAMP,
    profissional VARCHAR(200),
    observacoes VARCHAR(1000),

    -- Priorização
    urgente BOOLEAN DEFAULT FALSE,
    alerta VARCHAR(500),

    -- Aprazamento
    intervalo_minutos INTEGER,

    -- Auditoria
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP,

    -- Constraints
    CONSTRAINT fk_atividade_procedimento
        FOREIGN KEY (procedimento_rapido_id) REFERENCES procedimentos_rapidos (id) ON DELETE CASCADE,
    CONSTRAINT chk_tipo_valido
        CHECK (tipo IN ('VACINAS', 'PROCEDIMENTOS')),
    CONSTRAINT chk_situacao_valida
        CHECK (situacao IN ('PENDENTE', 'EM_EXECUCAO', 'EXECUTADO', 'CANCELADO', 'NAO_REALIZADO'))
);

-- Índices
CREATE INDEX idx_atividade_procedimento ON atividades_enfermagem(procedimento_rapido_id);
CREATE INDEX idx_atividade_situacao ON atividades_enfermagem(situacao);
CREATE INDEX idx_atividade_urgente ON atividades_enfermagem(urgente) WHERE urgente = TRUE;
CREATE INDEX idx_atividade_data_criacao ON atividades_enfermagem(data_criacao ASC);

-- Comentários
COMMENT ON TABLE atividades_enfermagem IS 'Atividades de enfermagem dentro de um procedimento rápido';
COMMENT ON COLUMN atividades_enfermagem.tipo IS 'Tipo da atividade: VACINAS ou PROCEDIMENTOS';
COMMENT ON COLUMN atividades_enfermagem.situacao IS 'Situação: PENDENTE, EM_EXECUCAO, EXECUTADO, CANCELADO, NAO_REALIZADO';
COMMENT ON COLUMN atividades_enfermagem.urgente IS 'Se TRUE, a atividade é prioritária';

-- ============================================================================
-- Tabela de horários aprazados (ElementCollection)
-- ============================================================================
CREATE TABLE IF NOT EXISTS atividade_horarios (
    atividade_id BIGINT NOT NULL,
    horario_aprazado TIMESTAMP NOT NULL,
    ordem INTEGER NOT NULL,

    PRIMARY KEY (atividade_id, ordem),

    CONSTRAINT fk_horario_atividade
        FOREIGN KEY (atividade_id) REFERENCES atividades_enfermagem (id) ON DELETE CASCADE
);

-- Índice
CREATE INDEX idx_horario_atividade ON atividade_horarios(atividade_id);

-- Comentário
COMMENT ON TABLE atividade_horarios IS 'Horários aprazados para execução das atividades';

-- ============================================================================
-- Tabela de horários anteriores (para auditoria de aprazamento)
-- ============================================================================
CREATE TABLE IF NOT EXISTS atividade_horarios_anteriores (
    atividade_id BIGINT NOT NULL,
    horario_anterior TIMESTAMP NOT NULL,
    ordem INTEGER NOT NULL,

    PRIMARY KEY (atividade_id, ordem),

    CONSTRAINT fk_horario_anterior_atividade
        FOREIGN KEY (atividade_id) REFERENCES atividades_enfermagem (id) ON DELETE CASCADE
);

-- Índice
CREATE INDEX idx_horario_anterior_atividade ON atividade_horarios_anteriores(atividade_id);

-- Comentário
COMMENT ON TABLE atividade_horarios_anteriores IS 'Histórico de horários anteriores antes do aprazamento';

-- ============================================================================
-- View para facilitar consultas
-- ============================================================================
CREATE OR REPLACE VIEW v_procedimentos_rapidos_resumo AS
SELECT
    pr.id,
    pr.status,
    pr.data_criacao,
    p.nome_completo AS paciente_nome,
    p.cpf AS paciente_cpf,
    EXTRACT(YEAR FROM AGE(p.data_nascimento)) AS paciente_idade,
    pr.medico_solicitante,
    pr.origem_encaminhamento,
    o.nome AS operador_responsavel_nome,
    pr.bloqueado_por_operador_id IS NOT NULL AS bloqueado,
    COUNT(ae.id) FILTER (WHERE ae.situacao = 'PENDENTE') AS atividades_pendentes,
    COUNT(ae.id) AS total_atividades,
    BOOL_OR(ae.urgente) AS tem_urgentes
FROM procedimentos_rapidos pr
    INNER JOIN pacientes p ON pr.paciente_id = p.id
    LEFT JOIN operador o ON pr.operador_responsavel_id = o.id
    LEFT JOIN atividades_enfermagem ae ON ae.procedimento_rapido_id = pr.id
GROUP BY pr.id, p.id, o.id;

-- Comentário
COMMENT ON VIEW v_procedimentos_rapidos_resumo IS 'View resumida dos procedimentos rápidos com informações agregadas';

-- ============================================================================
-- Dados iniciais (se necessário)
-- ============================================================================
-- Nenhum dado inicial necessário para este módulo

-- ============================================================================
-- Fim da migration
-- ============================================================================
