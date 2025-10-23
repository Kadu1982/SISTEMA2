-- Cria tabelas de TRIAGEM e ATENDIMENTO UPA (sem alterar tabela UPA existente)

CREATE TABLE IF NOT EXISTS upa_triagens (
                                            id BIGSERIAL PRIMARY KEY,
                                            upa_id BIGINT NOT NULL REFERENCES upa(id) ON DELETE CASCADE,
    paciente_id BIGINT NOT NULL REFERENCES pacientes(id),
    motivo_consulta VARCHAR(80),
    queixa_principal TEXT,
    observacoes TEXT,
    alergias TEXT,
    pressao_arterial VARCHAR(20),
    temperatura NUMERIC(4,1),
    peso NUMERIC(6,2),
    altura NUMERIC(4,2),
    frequencia_cardiaca INTEGER,
    frequencia_respiratoria INTEGER,
    saturacao_oxigenio INTEGER,
    escala_dor INTEGER,
    dum_informada DATE,
    gestante_informado BOOLEAN,
    semanas_gestacao_informadas INTEGER,
    classificacao_risco VARCHAR(12),
    criado_em TIMESTAMP DEFAULT now()
    );

CREATE INDEX IF NOT EXISTS idx_upa_triagens_upa_id ON upa_triagens (upa_id);
CREATE INDEX IF NOT EXISTS idx_upa_triagens_paciente_id ON upa_triagens (paciente_id);

CREATE TABLE IF NOT EXISTS upa_atendimentos (
                                                id BIGSERIAL PRIMARY KEY,
                                                upa_id BIGINT NOT NULL REFERENCES upa(id) ON DELETE CASCADE,
    triagem_id BIGINT NOT NULL REFERENCES upa_triagens(id) ON DELETE CASCADE,
    paciente_id BIGINT NOT NULL REFERENCES pacientes(id),
    cid10 VARCHAR(10) NOT NULL,
    anamnese TEXT,
    exame_fisico TEXT,
    hipotese_diagnostica TEXT,
    conduta TEXT,
    prescricao TEXT,
    observacoes TEXT,
    retorno VARCHAR(60),
    status_atendimento VARCHAR(20) NOT NULL,
    criado_em TIMESTAMP DEFAULT now()
    );

CREATE INDEX IF NOT EXISTS idx_upa_atend_triagem_id ON upa_atendimentos (triagem_id);
