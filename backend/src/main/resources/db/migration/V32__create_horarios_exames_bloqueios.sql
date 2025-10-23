-- ==========================================
-- Migration V32: Horários de Exames e Bloqueios
-- Baseado no Manual de Agendamento de Exames
-- ==========================================

-- Tabela de Horários de Exames
CREATE TABLE horarios_exames (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT,
    sala_id BIGINT,
    unidade_id BIGINT NOT NULL,
    exame_codigo VARCHAR(50),
    tipo_agendamento VARCHAR(20) DEFAULT 'AMBOS',
    dia_semana VARCHAR(20) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    intervalo_minutos INTEGER NOT NULL DEFAULT 30,
    vagas_por_horario INTEGER NOT NULL DEFAULT 1,
    permite_encaixe BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    observacoes TEXT,

    CONSTRAINT chk_hora_valida CHECK (hora_fim > hora_inicio),
    CONSTRAINT chk_intervalo_positivo CHECK (intervalo_minutos > 0),
    CONSTRAINT chk_vagas_positivas CHECK (vagas_por_horario > 0),
    CONSTRAINT chk_tipo_agendamento CHECK (tipo_agendamento IN ('INTERNO', 'EXTERNO', 'AMBOS')),
    CONSTRAINT chk_dia_semana CHECK (dia_semana IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'))
);

-- Índices para horarios_exames
CREATE INDEX idx_horarios_exames_unidade ON horarios_exames(unidade_id);
CREATE INDEX idx_horarios_exames_profissional ON horarios_exames(profissional_id);
CREATE INDEX idx_horarios_exames_sala ON horarios_exames(sala_id);
CREATE INDEX idx_horarios_exames_dia_semana ON horarios_exames(dia_semana);
CREATE INDEX idx_horarios_exames_exame_codigo ON horarios_exames(exame_codigo);
CREATE INDEX idx_horarios_exames_ativo ON horarios_exames(ativo);

-- Tabela de Bloqueios de Horários
CREATE TABLE bloqueios_horarios (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT,
    sala_id BIGINT,
    unidade_id BIGINT NOT NULL,
    tipo_bloqueio VARCHAR(50) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    hora_inicio TIME,
    hora_fim TIME,
    dia_inteiro BOOLEAN DEFAULT FALSE,
    motivo TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    operador_bloqueio_id BIGINT,

    CONSTRAINT chk_data_valida CHECK (data_fim IS NULL OR data_fim >= data_inicio),
    CONSTRAINT chk_hora_bloqueio_valida CHECK (
        (hora_inicio IS NULL AND hora_fim IS NULL) OR
        (hora_inicio IS NOT NULL AND hora_fim IS NOT NULL AND hora_fim > hora_inicio)
    ),
    CONSTRAINT chk_tipo_bloqueio CHECK (tipo_bloqueio IN ('FERIAS', 'FERIADO', 'MANUTENCAO', 'EVENTO', 'LICENCA', 'AUSENCIA', 'OUTRO'))
);

-- Índices para bloqueios_horarios
CREATE INDEX idx_bloqueios_horarios_unidade ON bloqueios_horarios(unidade_id);
CREATE INDEX idx_bloqueios_horarios_profissional ON bloqueios_horarios(profissional_id);
CREATE INDEX idx_bloqueios_horarios_sala ON bloqueios_horarios(sala_id);
CREATE INDEX idx_bloqueios_horarios_data_inicio ON bloqueios_horarios(data_inicio);
CREATE INDEX idx_bloqueios_horarios_data_fim ON bloqueios_horarios(data_fim);
CREATE INDEX idx_bloqueios_horarios_ativo ON bloqueios_horarios(ativo);
CREATE INDEX idx_bloqueios_horarios_tipo ON bloqueios_horarios(tipo_bloqueio);

-- Comentários
COMMENT ON TABLE horarios_exames IS 'Horários disponíveis para agendamento de exames por profissional/sala';
COMMENT ON TABLE bloqueios_horarios IS 'Bloqueios de horários para férias, feriados, etc';

COMMENT ON COLUMN horarios_exames.tipo_agendamento IS 'Tipo: INTERNO (pacientes da unidade), EXTERNO (pacientes externos), AMBOS';
COMMENT ON COLUMN horarios_exames.dia_semana IS 'Dia da semana (MONDAY, TUESDAY, ...)';
COMMENT ON COLUMN horarios_exames.intervalo_minutos IS 'Intervalo entre agendamentos em minutos';
COMMENT ON COLUMN horarios_exames.vagas_por_horario IS 'Quantidade de vagas disponíveis por slot de horário';
COMMENT ON COLUMN horarios_exames.permite_encaixe IS 'Permite agendamentos extras além das vagas normais';

COMMENT ON COLUMN bloqueios_horarios.tipo_bloqueio IS 'Tipo: FERIAS, FERIADO, MANUTENCAO, EVENTO, LICENCA, AUSENCIA, OUTRO';
COMMENT ON COLUMN bloqueios_horarios.dia_inteiro IS 'Se TRUE, bloqueia o dia inteiro independente dos horários';
COMMENT ON COLUMN bloqueios_horarios.data_fim IS 'Se NULL, bloqueio é apenas para um dia (data_inicio)';