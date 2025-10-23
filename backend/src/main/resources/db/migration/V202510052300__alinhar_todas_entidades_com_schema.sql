-- ============================================================================
-- MIGRATION: V202510052300__alinhar_todas_entidades_com_schema.sql
--
-- OBJETIVO: Alinhar TODAS as tabelas do banco de dados PostgreSQL com as
--           entidades JPA do sistema, garantindo que todas as colunas,
--           tipos, índices e foreign keys estejam corretos.
--
-- CARACTERÍSTICAS:
--   - 100% IDEMPOTENTE (pode ser executada múltiplas vezes)
--   - NÃO remove dados existentes
--   - Usa IF NOT EXISTS / IF EXISTS para segurança
--   - Converte tipos incorretos (BYTEA → OID para @Lob)
--   - Organizado por módulos funcionais
--
-- DATA: 2025-10-05
-- ============================================================================

-- ============================================================================
-- MÓDULO: PACIENTES
-- ============================================================================

-- Tabela: pacientes
DO $$ BEGIN
    -- Adicionar colunas se não existirem
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS nome_completo VARCHAR(200) NOT NULL;
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS nome_social VARCHAR(200);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS nome_mae VARCHAR(200);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS cpf VARCHAR(11) UNIQUE;
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS justificativa_ausencia_cpf VARCHAR(500);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS cns VARCHAR(15);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS sexo VARCHAR(1);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS data_nascimento DATE;
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS acamado BOOLEAN;
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS domiciliado BOOLEAN;
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS cond_saude_mental BOOLEAN;
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS usa_plantas BOOLEAN;
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS outras_condicoes VARCHAR(1000);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS municipio VARCHAR(100);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS cep VARCHAR(8);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS logradouro VARCHAR(200);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS numero VARCHAR(10);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS bairro VARCHAR(100);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS complemento VARCHAR(100);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS telefone_celular VARCHAR(15);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS telefone_contato VARCHAR(15);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS tipo_sanguineo VARCHAR(3);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS rg VARCHAR(20);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS orgao_emissor VARCHAR(10);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS certidao_nascimento VARCHAR(50);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS carteira_trabalho VARCHAR(20);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS titulo_eleitor VARCHAR(15);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS prontuario_familiar VARCHAR(20);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS cor_raca VARCHAR(50);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS etnia VARCHAR(50);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS escolaridade VARCHAR(50);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS situacao_familiar VARCHAR(100);
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMP;
    ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS data_ultima_menstruacao DATE;
END $$;

-- Índices para pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_cns ON pacientes(cns);
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome_completo);

-- ============================================================================
-- MÓDULO: OPERADORES E SEGURANÇA
-- ============================================================================

-- Tabela: operador
DO $$ BEGIN
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS login VARCHAR(255) NOT NULL UNIQUE;
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS senha VARCHAR(255) NOT NULL;
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS nome VARCHAR(255) NOT NULL;
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS cargo VARCHAR(255);
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS cpf VARCHAR(255) UNIQUE;
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS unidade_saude_id BIGINT;
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS unidade_atual_id BIGINT;
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS is_master BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMP;
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMP;
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS criado_por VARCHAR(50);
    ALTER TABLE operador ADD COLUMN IF NOT EXISTS atualizado_por VARCHAR(50);
END $$;

-- Tabela: operador_perfis (ElementCollection)
CREATE TABLE IF NOT EXISTS operador_perfis (
    operador_id BIGINT NOT NULL,
    perfil VARCHAR(255) NOT NULL,
    CONSTRAINT fk_operador_perfis_operador FOREIGN KEY (operador_id) REFERENCES operador(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_operador_perfis_operador_id ON operador_perfis(operador_id);

-- Tabela: operador_horario_acesso
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS operador_horario_acesso (
        id BIGSERIAL PRIMARY KEY,
        operador_id BIGINT NOT NULL,
        dia_semana VARCHAR(20) NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fim TIME NOT NULL,
        ativo BOOLEAN DEFAULT true,
        CONSTRAINT fk_horario_operador FOREIGN KEY (operador_id) REFERENCES operador(id) ON DELETE CASCADE
    );
END $$;

-- Tabela: operador_restricao_acesso
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS operador_restricao_acesso (
        id BIGSERIAL PRIMARY KEY,
        operador_id BIGINT NOT NULL,
        tipo_restricao VARCHAR(50) NOT NULL,
        valor_restricao VARCHAR(255),
        descricao TEXT,
        ativo BOOLEAN DEFAULT true,
        CONSTRAINT fk_restricao_operador FOREIGN KEY (operador_id) REFERENCES operador(id) ON DELETE CASCADE
    );
END $$;

-- Tabela: operador_login_auditoria
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS operador_login_auditoria (
        id BIGSERIAL PRIMARY KEY,
        operador_id BIGINT NOT NULL,
        data_login TIMESTAMP NOT NULL,
        ip_origem VARCHAR(50),
        user_agent TEXT,
        sucesso BOOLEAN NOT NULL,
        motivo_falha VARCHAR(255),
        CONSTRAINT fk_auditoria_operador FOREIGN KEY (operador_id) REFERENCES operador(id) ON DELETE CASCADE
    );
END $$;
CREATE INDEX IF NOT EXISTS idx_login_auditoria_operador ON operador_login_auditoria(operador_id);
CREATE INDEX IF NOT EXISTS idx_login_auditoria_data ON operador_login_auditoria(data_login);

-- Tabela: operador_termo_uso
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS operador_termo_uso (
        id BIGSERIAL PRIMARY KEY,
        operador_id BIGINT NOT NULL,
        termo_versao VARCHAR(50) NOT NULL,
        data_aceite TIMESTAMP NOT NULL,
        ip_aceite VARCHAR(50),
        CONSTRAINT fk_termo_operador FOREIGN KEY (operador_id) REFERENCES operador(id) ON DELETE CASCADE
    );
END $$;

-- Tabela: setor_atendimento
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS setor_atendimento (
        id BIGSERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        ativo BOOLEAN DEFAULT true
    );
END $$;

-- Tabela: operador_setor (relação N:N)
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS operador_setor (
        operador_id BIGINT NOT NULL,
        setor_id BIGINT NOT NULL,
        PRIMARY KEY (operador_id, setor_id),
        CONSTRAINT fk_operador_setor_op FOREIGN KEY (operador_id) REFERENCES operador(id) ON DELETE CASCADE,
        CONSTRAINT fk_operador_setor_setor FOREIGN KEY (setor_id) REFERENCES setor_atendimento(id) ON DELETE CASCADE
    );
END $$;

-- Tabela: operador_modulo_acesso
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS operador_modulo_acesso (
        operador_id BIGINT NOT NULL,
        modulo VARCHAR(100) NOT NULL,
        PRIMARY KEY (operador_id, modulo),
        CONSTRAINT fk_modulo_operador FOREIGN KEY (operador_id) REFERENCES operador(id) ON DELETE CASCADE
    );
END $$;

-- Tabela: operador_unidade (relação N:N operador-unidades)
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS operador_unidade (
        operador_id BIGINT NOT NULL,
        unidade_id BIGINT NOT NULL,
        PRIMARY KEY (operador_id, unidade_id),
        CONSTRAINT fk_operador_unidade_op FOREIGN KEY (operador_id) REFERENCES operador(id) ON DELETE CASCADE
    );
END $$;

-- Tabela: operador_restricoes_json (armazena JSON de restrições)
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS operador_restricoes_json (
        id BIGSERIAL PRIMARY KEY,
        operador_id BIGINT NOT NULL UNIQUE,
        restricoes JSONB,
        data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_restricoes_json_operador FOREIGN KEY (operador_id) REFERENCES operador(id) ON DELETE CASCADE
    );
END $$;

-- ============================================================================
-- MÓDULO: UNIDADES DE SAÚDE
-- ============================================================================

-- Tabela: unidades_saude
DO $$ BEGIN
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS codigo VARCHAR(30) UNIQUE;
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS razao_social VARCHAR(200);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(200);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS nome VARCHAR(200) NOT NULL;
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS cnpj VARCHAR(14) UNIQUE;
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS codigo_cnes VARCHAR(7) NOT NULL UNIQUE;
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) NOT NULL DEFAULT 'UBS';
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS tipo_estabelecimento VARCHAR(100);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS esfera_administrativa VARCHAR(100);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS atividade_gestao VARCHAR(100);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS fluxo_clientela VARCHAR(100);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS turnos_atendimento VARCHAR(100);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS natureza_organizacao VARCHAR(100);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS logradouro VARCHAR(200);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS numero VARCHAR(20);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS complemento VARCHAR(100);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS bairro VARCHAR(100);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS municipio VARCHAR(100);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS uf VARCHAR(2);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS endereco VARCHAR(500);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS cep VARCHAR(8);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS estado VARCHAR(2);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS email VARCHAR(100);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS ativa BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS horario_funcionamento VARCHAR(200);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS gestor_responsavel VARCHAR(100);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMP;
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS criado_por VARCHAR(50);
    ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS atualizado_por VARCHAR(50);
END $$;

-- Tabela: documento_unidade
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS documento_unidade (
        id BIGSERIAL PRIMARY KEY,
        unidade_id BIGINT NOT NULL,
        tipo_documento VARCHAR(50) NOT NULL,
        numero_documento VARCHAR(100),
        data_emissao DATE,
        data_validade DATE,
        observacoes TEXT,
        ativo BOOLEAN DEFAULT true,
        CONSTRAINT fk_doc_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id) ON DELETE CASCADE
    );
END $$;
CREATE INDEX IF NOT EXISTS idx_documento_unidade_unidade ON documento_unidade(unidade_id);

-- ============================================================================
-- MÓDULO: PROFISSIONAIS
-- ============================================================================

-- Tabela: profissionais
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS profissionais (
        id BIGSERIAL PRIMARY KEY,
        nome_completo VARCHAR(180) NOT NULL,
        tipo_cadastro VARCHAR(20) NOT NULL,
        sexo VARCHAR(20) NOT NULL,
        data_nascimento DATE,
        nome_mae VARCHAR(255),
        nome_pai VARCHAR(255),
        cns VARCHAR(15),
        nacionalidade VARCHAR(100),
        municipio_nascimento VARCHAR(100),
        data_chegada_pais DATE,
        naturalizado BOOLEAN,
        portaria_naturalizacao VARCHAR(100),
        raca_cor VARCHAR(50),
        etnia VARCHAR(100),
        permite_solicitar_insumos BOOLEAN,
        permite_solicitar_exames BOOLEAN,
        profissional_visa BOOLEAN,
        telefone VARCHAR(20),
        email VARCHAR(100),
        data_atualizacao_cnes DATE,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP
    );
END $$;

-- Embedded: endereco_profissional (campos embutidos na tabela profissionais)
DO $$ BEGIN
    ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS endereco_logradouro VARCHAR(200);
    ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS endereco_numero VARCHAR(20);
    ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS endereco_complemento VARCHAR(100);
    ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS endereco_bairro VARCHAR(100);
    ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS endereco_municipio VARCHAR(100);
    ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS endereco_uf VARCHAR(2);
    ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS endereco_cep VARCHAR(8);
END $$;

-- Embedded: documentos_profissional (campos embutidos na tabela profissionais)
DO $$ BEGIN
    ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS doc_cpf VARCHAR(11) UNIQUE;
    ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS doc_rg VARCHAR(20);
    ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS doc_orgao_emissor VARCHAR(10);
    ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS doc_pis_pasep VARCHAR(20);
END $$;

-- Tabela: registro_conselho
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS registro_conselho (
        id BIGSERIAL PRIMARY KEY,
        profissional_id BIGINT NOT NULL,
        conselho VARCHAR(20) NOT NULL,
        numero_conselho VARCHAR(50) NOT NULL,
        uf VARCHAR(2),
        data_inscricao DATE,
        ativo BOOLEAN DEFAULT true,
        CONSTRAINT fk_conselho_prof FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE
    );
END $$;
CREATE INDEX IF NOT EXISTS idx_registro_conselho_prof ON registro_conselho(profissional_id);

-- Tabela: profissional_especialidade
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS profissional_especialidade (
        id BIGSERIAL PRIMARY KEY,
        profissional_id BIGINT NOT NULL,
        codigo_cbo VARCHAR(10) NOT NULL,
        descricao VARCHAR(200),
        principal BOOLEAN DEFAULT false,
        CONSTRAINT fk_especialidade_prof FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE
    );
END $$;
CREATE INDEX IF NOT EXISTS idx_prof_especialidade_prof ON profissional_especialidade(profissional_id);

-- Tabela: vinculo_profissional_unidade
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS vinculo_profissional_unidade (
        id BIGSERIAL PRIMARY KEY,
        profissional_id BIGINT NOT NULL,
        unidade_id BIGINT NOT NULL,
        data_inicio DATE NOT NULL,
        data_fim DATE,
        carga_horaria INTEGER,
        ativo BOOLEAN DEFAULT true,
        CONSTRAINT fk_vinculo_prof FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
        CONSTRAINT fk_vinculo_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id) ON DELETE CASCADE
    );
END $$;
CREATE INDEX IF NOT EXISTS idx_vinculo_prof ON vinculo_profissional_unidade(profissional_id);
CREATE INDEX IF NOT EXISTS idx_vinculo_unidade ON vinculo_profissional_unidade(unidade_id);

-- ============================================================================
-- MÓDULO: AGENDAMENTOS E RECEPÇÃO
-- ============================================================================

-- Tabela: agendamentos
DO $$ BEGIN
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS paciente_id BIGINT NOT NULL;
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS profissional_id BIGINT;
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS especialidade VARCHAR(100);
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS data_hora TIMESTAMP NOT NULL;
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS data_agendamento TIMESTAMP NOT NULL;
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMP;
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'AGENDADO';
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS tipo_consulta VARCHAR(50) DEFAULT 'CONSULTA';
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS observacoes TEXT;
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT;
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS data_cancelamento TIMESTAMP;
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS operador_cancelamento_id BIGINT;
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS triagem_id BIGINT;
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS codigo_barras VARCHAR(50) UNIQUE;
END $$;

-- Corrigir tipo de colunas LOB em agendamentos (BYTEA → OID)
DO $$ BEGIN
    -- comprovante_pdf_base64: TEXT está correto (@Lob + columnDefinition = "TEXT")
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS comprovante_pdf_base64 TEXT;

    -- codigo_barras_imagem: deve ser OID (byte[] com @Lob)
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'agendamentos' AND column_name = 'codigo_barras_imagem' AND data_type = 'bytea') THEN
        ALTER TABLE agendamentos ALTER COLUMN codigo_barras_imagem TYPE OID USING lo_from_bytea(0, codigo_barras_imagem);
    END IF;
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS codigo_barras_imagem OID;
END $$;

CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional ON agendamentos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- ============================================================================
-- MÓDULO: TRIAGEM
-- ============================================================================

-- Tabela: triagens
DO $$ BEGIN
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS paciente_id BIGINT NOT NULL;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS profissional_id BIGINT;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS agendamento_id BIGINT NOT NULL;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS data_referencia_atendimento DATE;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS data_triagem TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS queixa_principal TEXT NOT NULL;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS motivo_consulta VARCHAR(50) NOT NULL;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS classificacao_risco VARCHAR(50);
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS classificacao_original VARCHAR(50);
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS protocolo_aplicado VARCHAR(100);
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS conduta_sugerida TEXT;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS diagnosticos_sugeridos TEXT;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS dum_informada DATE;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS gestante_informado BOOLEAN DEFAULT false;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS semanas_gestacao_informadas INTEGER;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS pressao_arterial VARCHAR(20);
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS temperatura DOUBLE PRECISION;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS peso DOUBLE PRECISION;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS altura DOUBLE PRECISION;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS frequencia_cardiaca INTEGER;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS frequencia_respiratoria INTEGER;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS saturacao_oxigenio INTEGER;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS escala_dor INTEGER;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS observacoes TEXT;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS alergias TEXT;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS is_upa_triagem BOOLEAN DEFAULT false;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMP;
    ALTER TABLE triagens ADD COLUMN IF NOT EXISTS cancelada BOOLEAN DEFAULT false;
END $$;

CREATE INDEX IF NOT EXISTS idx_triagens_paciente ON triagens(paciente_id);
CREATE INDEX IF NOT EXISTS idx_triagens_agendamento ON triagens(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_triagens_data ON triagens(data_triagem);

-- ============================================================================
-- MÓDULO: ATENDIMENTOS
-- ============================================================================

-- Tabela: atendimentos
DO $$ BEGIN
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS paciente_id BIGINT NOT NULL;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS profissional_id BIGINT NOT NULL;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS unidade_id BIGINT;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS setor_id BIGINT;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS data_hora TIMESTAMP NOT NULL;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS status VARCHAR(40) NOT NULL;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS queixa_principal TEXT;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS diagnostico TEXT;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS sintomas TEXT;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS exames_fisicos TEXT;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS prescricao TEXT;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS observacoes TEXT;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS medicamentos_prescritos TEXT;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS orientacoes TEXT;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS observacoes_internas TEXT;
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS motivo_desfecho VARCHAR(2);
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS especialidade_encaminhamento VARCHAR(100);
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS cid10 VARCHAR(10);
    ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS ciap_rfe VARCHAR(3);
END $$;

CREATE INDEX IF NOT EXISTS idx_atendimentos_paciente ON atendimentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_profissional ON atendimentos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_data ON atendimentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_atendimentos_status ON atendimentos(status);

-- Tabelas de coleção CIAP
CREATE TABLE IF NOT EXISTS atendimento_ciap_diag (
    atendimento_id BIGINT NOT NULL,
    codigo VARCHAR(3) NOT NULL,
    CONSTRAINT fk_ciap_diag_atend FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ciap_diag_atend ON atendimento_ciap_diag(atendimento_id);

CREATE TABLE IF NOT EXISTS atendimento_ciap_proc (
    atendimento_id BIGINT NOT NULL,
    codigo VARCHAR(3) NOT NULL,
    CONSTRAINT fk_ciap_proc_atend FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ciap_proc_atend ON atendimento_ciap_proc(atendimento_id);

-- Tabela: cid (CID-10)
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS cid (
        id BIGSERIAL PRIMARY KEY,
        codigo VARCHAR(10) NOT NULL UNIQUE,
        descricao VARCHAR(500) NOT NULL,
        categoria VARCHAR(10),
        ativo BOOLEAN DEFAULT true
    );
END $$;
CREATE INDEX IF NOT EXISTS idx_cid_codigo ON cid(codigo);

-- ============================================================================
-- MÓDULO: EXAMES (SADT)
-- ============================================================================

-- Tabela: sadt
DO $$ BEGIN
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS numero_sadt VARCHAR(20) NOT NULL UNIQUE;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS agendamento_id BIGINT;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS paciente_id BIGINT NOT NULL;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS data_emissao TIMESTAMP NOT NULL;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS tipo_sadt VARCHAR(20) NOT NULL;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'GERADA';
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS operador VARCHAR(100) NOT NULL;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS observacoes TEXT;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS urgente BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS estabelecimento_nome VARCHAR(200) NOT NULL;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS estabelecimento_cnes VARCHAR(10) NOT NULL;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS estabelecimento_endereco VARCHAR(300);
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS estabelecimento_telefone VARCHAR(20);
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS estabelecimento_municipio VARCHAR(100);
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS estabelecimento_uf VARCHAR(2);
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS solicitante_nome VARCHAR(200) NOT NULL;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS solicitante_cbo VARCHAR(10);
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS solicitante_conselho VARCHAR(10);
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS solicitante_numero_conselho VARCHAR(20);
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS pdf_base64 TEXT;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS codigo_barras VARCHAR(50) UNIQUE;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
END $$;

-- Corrigir tipo de coluna LOB em sadt
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'sadt' AND column_name = 'codigo_barras_imagem' AND data_type = 'bytea') THEN
        ALTER TABLE sadt ALTER COLUMN codigo_barras_imagem TYPE OID USING lo_from_bytea(0, codigo_barras_imagem);
    END IF;
    ALTER TABLE sadt ADD COLUMN IF NOT EXISTS codigo_barras_imagem OID;
END $$;

CREATE INDEX IF NOT EXISTS idx_sadt_paciente ON sadt(paciente_id);
CREATE INDEX IF NOT EXISTS idx_sadt_agendamento ON sadt(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_sadt_numero ON sadt(numero_sadt);

-- Tabela: procedimento_sadt
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS procedimento_sadt (
        id BIGSERIAL PRIMARY KEY,
        sadt_id BIGINT NOT NULL,
        codigo_procedimento VARCHAR(20) NOT NULL,
        descricao VARCHAR(300) NOT NULL,
        quantidade INTEGER DEFAULT 1,
        observacao TEXT,
        CONSTRAINT fk_proc_sadt FOREIGN KEY (sadt_id) REFERENCES sadt(id) ON DELETE CASCADE
    );
END $$;
CREATE INDEX IF NOT EXISTS idx_procedimento_sadt_sadt ON procedimento_sadt(sadt_id);

-- ============================================================================
-- MÓDULO: ESTOQUE
-- ============================================================================

-- Tabela: est_insumo
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS est_insumo (
        id BIGSERIAL PRIMARY KEY,
        descricao VARCHAR(200) NOT NULL,
        apresentacao VARCHAR(120),
        dosagem VARCHAR(60),
        descricao_completa TEXT,
        unidade_medida VARCHAR(20),
        controle_estoque VARCHAR(30) NOT NULL DEFAULT 'QUANTIDADE',
        dias_alerta_vencimento INTEGER,
        codigo_barras_padrao VARCHAR(64),
        ativo BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
END $$;
CREATE INDEX IF NOT EXISTS idx_est_insumo_descricao ON est_insumo(descricao);

-- Tabela: est_fabricante
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS est_fabricante (
        id BIGSERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        cnpj VARCHAR(14) UNIQUE,
        ativo BOOLEAN DEFAULT true
    );
END $$;

-- Tabela: est_fornecedor
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS est_fornecedor (
        id BIGSERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        cnpj VARCHAR(14) UNIQUE,
        contato VARCHAR(100),
        ativo BOOLEAN DEFAULT true
    );
END $$;

-- Tabela: est_local_armazenamento
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS est_local_armazenamento (
        id BIGSERIAL PRIMARY KEY,
        unidade_id BIGINT NOT NULL,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        ativo BOOLEAN DEFAULT true,
        CONSTRAINT fk_local_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
    );
END $$;

-- Tabela: est_lote
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS est_lote (
        id BIGSERIAL PRIMARY KEY,
        insumo_id BIGINT NOT NULL,
        fabricante_id BIGINT,
        numero_lote VARCHAR(50) NOT NULL,
        data_fabricacao DATE,
        data_validade DATE,
        CONSTRAINT fk_lote_insumo FOREIGN KEY (insumo_id) REFERENCES est_insumo(id),
        CONSTRAINT fk_lote_fabricante FOREIGN KEY (fabricante_id) REFERENCES est_fabricante(id)
    );
END $$;

-- Tabela: est_entrada
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS est_entrada (
        id BIGSERIAL PRIMARY KEY,
        local_armazenamento_id BIGINT NOT NULL,
        fornecedor_id BIGINT,
        tipo_entrada VARCHAR(50) NOT NULL,
        numero_nota_fiscal VARCHAR(50),
        data_entrada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        operador_id BIGINT,
        observacoes TEXT,
        CONSTRAINT fk_entrada_local FOREIGN KEY (local_armazenamento_id) REFERENCES est_local_armazenamento(id),
        CONSTRAINT fk_entrada_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES est_fornecedor(id)
    );
END $$;

-- Tabela: est_entrada_item
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS est_entrada_item (
        id BIGSERIAL PRIMARY KEY,
        entrada_id BIGINT NOT NULL,
        lote_id BIGINT NOT NULL,
        quantidade DECIMAL(10,2) NOT NULL,
        valor_unitario DECIMAL(10,2),
        CONSTRAINT fk_entrada_item_entrada FOREIGN KEY (entrada_id) REFERENCES est_entrada(id) ON DELETE CASCADE,
        CONSTRAINT fk_entrada_item_lote FOREIGN KEY (lote_id) REFERENCES est_lote(id)
    );
END $$;

-- Tabela: est_saida
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS est_saida (
        id BIGSERIAL PRIMARY KEY,
        local_armazenamento_id BIGINT NOT NULL,
        tipo_saida VARCHAR(50) NOT NULL,
        data_saida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        operador_id BIGINT,
        destino VARCHAR(200),
        observacoes TEXT,
        CONSTRAINT fk_saida_local FOREIGN KEY (local_armazenamento_id) REFERENCES est_local_armazenamento(id)
    );
END $$;

-- Tabela: est_saida_item
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS est_saida_item (
        id BIGSERIAL PRIMARY KEY,
        saida_id BIGINT NOT NULL,
        lote_id BIGINT NOT NULL,
        quantidade DECIMAL(10,2) NOT NULL,
        CONSTRAINT fk_saida_item_saida FOREIGN KEY (saida_id) REFERENCES est_saida(id) ON DELETE CASCADE,
        CONSTRAINT fk_saida_item_lote FOREIGN KEY (lote_id) REFERENCES est_lote(id)
    );
END $$;

-- Tabela: est_estoque_lote (saldo atual)
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS est_estoque_lote (
        id BIGSERIAL PRIMARY KEY,
        lote_id BIGINT NOT NULL,
        local_armazenamento_id BIGINT NOT NULL,
        quantidade_atual DECIMAL(10,2) NOT NULL DEFAULT 0,
        data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_estoque_lote_lote FOREIGN KEY (lote_id) REFERENCES est_lote(id),
        CONSTRAINT fk_estoque_lote_local FOREIGN KEY (local_armazenamento_id) REFERENCES est_local_armazenamento(id),
        UNIQUE(lote_id, local_armazenamento_id)
    );
END $$;

-- Tabela: est_transferencia
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS est_transferencia (
        id BIGSERIAL PRIMARY KEY,
        local_origem_id BIGINT NOT NULL,
        local_destino_id BIGINT NOT NULL,
        data_transferencia TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
        operador_origem_id BIGINT,
        operador_destino_id BIGINT,
        observacoes TEXT,
        CONSTRAINT fk_transf_origem FOREIGN KEY (local_origem_id) REFERENCES est_local_armazenamento(id),
        CONSTRAINT fk_transf_destino FOREIGN KEY (local_destino_id) REFERENCES est_local_armazenamento(id)
    );
END $$;

-- Tabela: est_transferencia_item
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS est_transferencia_item (
        id BIGSERIAL PRIMARY KEY,
        transferencia_id BIGINT NOT NULL,
        lote_id BIGINT NOT NULL,
        quantidade DECIMAL(10,2) NOT NULL,
        CONSTRAINT fk_transf_item_transf FOREIGN KEY (transferencia_id) REFERENCES est_transferencia(id) ON DELETE CASCADE,
        CONSTRAINT fk_transf_item_lote FOREIGN KEY (lote_id) REFERENCES est_lote(id)
    );
END $$;

-- Tabela: est_operacao (log de todas operações)
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS est_operacao (
        id BIGSERIAL PRIMARY KEY,
        tipo_operacao VARCHAR(50) NOT NULL,
        lote_id BIGINT NOT NULL,
        local_armazenamento_id BIGINT NOT NULL,
        quantidade DECIMAL(10,2) NOT NULL,
        saldo_anterior DECIMAL(10,2),
        saldo_posterior DECIMAL(10,2),
        data_operacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        operador_id BIGINT,
        referencia_id BIGINT,
        observacoes TEXT,
        CONSTRAINT fk_operacao_lote FOREIGN KEY (lote_id) REFERENCES est_lote(id),
        CONSTRAINT fk_operacao_local FOREIGN KEY (local_armazenamento_id) REFERENCES est_local_armazenamento(id)
    );
END $$;
CREATE INDEX IF NOT EXISTS idx_operacao_lote ON est_operacao(lote_id);
CREATE INDEX IF NOT EXISTS idx_operacao_local ON est_operacao(local_armazenamento_id);
CREATE INDEX IF NOT EXISTS idx_operacao_data ON est_operacao(data_operacao);

-- Tabela: operador_local_armazenamento (permissões)
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS operador_local_armazenamento (
        operador_id BIGINT NOT NULL,
        local_armazenamento_id BIGINT NOT NULL,
        PRIMARY KEY (operador_id, local_armazenamento_id),
        CONSTRAINT fk_op_local_operador FOREIGN KEY (operador_id) REFERENCES operador(id) ON DELETE CASCADE,
        CONSTRAINT fk_op_local_local FOREIGN KEY (local_armazenamento_id) REFERENCES est_local_armazenamento(id) ON DELETE CASCADE
    );
END $$;

-- ============================================================================
-- MÓDULO: DOCUMENTOS E PRONTUÁRIO
-- ============================================================================

-- Tabela: documentos
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS documentos (
        id BIGSERIAL PRIMARY KEY,
        paciente_id BIGINT NOT NULL,
        tipo_documento VARCHAR(50) NOT NULL,
        data_emissao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        conteudo TEXT,
        observacoes TEXT,
        CONSTRAINT fk_doc_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
    );
END $$;

-- Tabela: prontuario_documento
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS prontuario_documento (
        id BIGSERIAL PRIMARY KEY,
        paciente_id BIGINT NOT NULL,
        atendimento_id BIGINT,
        tipo_documento VARCHAR(50) NOT NULL,
        titulo VARCHAR(200),
        conteudo TEXT,
        data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP,
        criado_por_id BIGINT,
        atualizado_por_id BIGINT,
        CONSTRAINT fk_pront_doc_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
        CONSTRAINT fk_pront_doc_atend FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id)
    );
END $$;
CREATE INDEX IF NOT EXISTS idx_prontuario_doc_paciente ON prontuario_documento(paciente_id);
CREATE INDEX IF NOT EXISTS idx_prontuario_doc_atend ON prontuario_documento(atendimento_id);

-- ============================================================================
-- MÓDULO: BIOMETRIA E LOGS
-- ============================================================================

-- Tabela: biometrias
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS biometrias (
        id BIGSERIAL PRIMARY KEY,
        operador_id BIGINT NOT NULL,
        data_captura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        formato VARCHAR(20),
        observacoes TEXT,
        CONSTRAINT fk_biometria_operador FOREIGN KEY (operador_id) REFERENCES operador(id)
    );
END $$;

-- Corrigir tipo de coluna template (BYTEA → OID)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'biometrias' AND column_name = 'template' AND data_type = 'bytea') THEN
        ALTER TABLE biometrias ALTER COLUMN template TYPE OID USING lo_from_bytea(0, template);
    END IF;
    ALTER TABLE biometrias ADD COLUMN IF NOT EXISTS template OID;
END $$;

CREATE INDEX IF NOT EXISTS idx_biometrias_operador ON biometrias(operador_id);

-- Tabela: logs_sistema
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS logs_sistema (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        usuario_id VARCHAR(255),
        acao VARCHAR(255),
        tabela VARCHAR(255),
        registro_id VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
END $$;
CREATE INDEX IF NOT EXISTS idx_logs_sistema_timestamp ON logs_sistema(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_usuario ON logs_sistema(usuario_id);

-- Tabela: audit_evento (auditoria detalhada)
-- NOTA: Tabela foi criada em V20250907.1, apenas adicionar colunas faltantes
DO $$ BEGIN
    -- Criar tabela se não existir (caso não tenha rodado V20250907.1)
    CREATE TABLE IF NOT EXISTS audit_evento (
        id BIGSERIAL PRIMARY KEY,
        data_hora TIMESTAMP NOT NULL DEFAULT NOW(),
        operador_id BIGINT,
        entidade VARCHAR(120) NOT NULL,
        operacao VARCHAR(20) NOT NULL,
        recurso VARCHAR(180),
        payload_resumo TEXT,
        ip VARCHAR(64)
    );

    -- Adicionar colunas novas se não existirem
    ALTER TABLE audit_evento ADD COLUMN IF NOT EXISTS tipo_evento VARCHAR(50);
    ALTER TABLE audit_evento ADD COLUMN IF NOT EXISTS entidade_id BIGINT;
    ALTER TABLE audit_evento ADD COLUMN IF NOT EXISTS data_evento TIMESTAMP;
    ALTER TABLE audit_evento ADD COLUMN IF NOT EXISTS detalhes JSONB;
    ALTER TABLE audit_evento ADD COLUMN IF NOT EXISTS ip_origem VARCHAR(50);

    -- Adicionar FK somente se a tabela operador existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'fk_audit_operador') THEN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'operador') THEN
            ALTER TABLE audit_evento ADD CONSTRAINT fk_audit_operador
            FOREIGN KEY (operador_id) REFERENCES operador(id);
        END IF;
    END IF;
END $$;

-- Índices para audit_evento
CREATE INDEX IF NOT EXISTS idx_audit_evento_tipo ON audit_evento(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_audit_evento_entidade ON audit_evento(entidade);
CREATE INDEX IF NOT EXISTS idx_audit_evento_data ON audit_evento(data_evento);
CREATE INDEX IF NOT EXISTS idx_audit_evento_data_hora ON audit_evento(data_hora);
CREATE INDEX IF NOT EXISTS idx_audit_evento_operacao ON audit_evento(operacao);

-- ============================================================================
-- MÓDULO: UPA
-- ============================================================================

-- Tabela: upa
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS upa (
        id BIGSERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        codigo_cnes VARCHAR(7) UNIQUE,
        endereco VARCHAR(500),
        telefone VARCHAR(20),
        capacidade_leitos INTEGER,
        ativo BOOLEAN DEFAULT true
    );
END $$;

-- Tabela: triagem_upa
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS triagem_upa (
        id BIGSERIAL PRIMARY KEY,
        upa_id BIGINT NOT NULL,
        paciente_id BIGINT NOT NULL,
        data_triagem TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        classificacao_risco VARCHAR(50) NOT NULL,
        queixa_principal TEXT NOT NULL,
        sinais_vitais JSONB,
        prioridade VARCHAR(50),
        CONSTRAINT fk_triagem_upa_upa FOREIGN KEY (upa_id) REFERENCES upa(id),
        CONSTRAINT fk_triagem_upa_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
    );
END $$;

-- Tabela: atendimento_upa
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS atendimento_upa (
        id BIGSERIAL PRIMARY KEY,
        triagem_upa_id BIGINT NOT NULL,
        profissional_id BIGINT,
        data_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data_fim TIMESTAMP,
        status VARCHAR(50) NOT NULL DEFAULT 'EM_ATENDIMENTO',
        diagnostico TEXT,
        procedimentos_realizados TEXT,
        CONSTRAINT fk_atend_upa_triagem FOREIGN KEY (triagem_upa_id) REFERENCES triagem_upa(id)
    );
END $$;

-- ============================================================================
-- MÓDULO: SAMU
-- ============================================================================

-- Tabela: central_regulacao
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS central_regulacao (
        id BIGSERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        telefone VARCHAR(20),
        endereco VARCHAR(500),
        ativo BOOLEAN DEFAULT true
    );
END $$;

-- Tabela: base_operacional
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS base_operacional (
        id BIGSERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        endereco VARCHAR(500),
        coordenadas VARCHAR(100),
        ativo BOOLEAN DEFAULT true
    );
END $$;

-- Tabela: viatura
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS viatura (
        id BIGSERIAL PRIMARY KEY,
        base_operacional_id BIGINT,
        prefixo VARCHAR(50) NOT NULL UNIQUE,
        tipo_viatura VARCHAR(50) NOT NULL,
        placa VARCHAR(10),
        status VARCHAR(50) NOT NULL DEFAULT 'DISPONIVEL',
        CONSTRAINT fk_viatura_base FOREIGN KEY (base_operacional_id) REFERENCES base_operacional(id)
    );
END $$;

-- Tabela: ocorrencia
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS ocorrencia (
        id BIGSERIAL PRIMARY KEY,
        central_regulacao_id BIGINT,
        numero_ocorrencia VARCHAR(50) UNIQUE NOT NULL,
        data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        tipo_ocorrencia VARCHAR(50) NOT NULL,
        endereco_ocorrencia VARCHAR(500),
        coordenadas VARCHAR(100),
        descricao TEXT,
        prioridade VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'ABERTA',
        risco_presumido VARCHAR(50),
        CONSTRAINT fk_ocorrencia_central FOREIGN KEY (central_regulacao_id) REFERENCES central_regulacao(id)
    );
END $$;

-- Tabela: paciente_ocorrencia
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS paciente_ocorrencia (
        id BIGSERIAL PRIMARY KEY,
        ocorrencia_id BIGINT NOT NULL,
        paciente_id BIGINT,
        nome_vitima VARCHAR(200),
        idade_estimada INTEGER,
        sexo VARCHAR(1),
        sinais_vitais JSONB,
        status_paciente VARCHAR(50),
        CONSTRAINT fk_paciente_ocorr_ocorrencia FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencia(id),
        CONSTRAINT fk_paciente_ocorr_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
    );
END $$;

-- Tabela: viatura_ocorrencia
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS viatura_ocorrencia (
        id BIGSERIAL PRIMARY KEY,
        viatura_id BIGINT NOT NULL,
        ocorrencia_id BIGINT NOT NULL,
        data_despacho TIMESTAMP,
        data_chegada_local TIMESTAMP,
        data_saida_local TIMESTAMP,
        data_chegada_destino TIMESTAMP,
        CONSTRAINT fk_viatura_ocorr_viatura FOREIGN KEY (viatura_id) REFERENCES viatura(id),
        CONSTRAINT fk_viatura_ocorr_ocorrencia FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencia(id)
    );
END $$;

-- Tabela: evento_ocorrencia
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS evento_ocorrencia (
        id BIGSERIAL PRIMARY KEY,
        ocorrencia_id BIGINT NOT NULL,
        tipo_evento VARCHAR(50) NOT NULL,
        descricao TEXT,
        data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        operador_id BIGINT,
        CONSTRAINT fk_evento_ocorrencia FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencia(id),
        CONSTRAINT fk_evento_operador FOREIGN KEY (operador_id) REFERENCES operador(id)
    );
END $$;

-- ============================================================================
-- MÓDULO: SAÚDE DA FAMÍLIA
-- ============================================================================

-- Tabela: area
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS area (
        id BIGSERIAL PRIMARY KEY,
        unidade_id BIGINT NOT NULL,
        codigo VARCHAR(50) NOT NULL,
        nome VARCHAR(200),
        ativo BOOLEAN DEFAULT true,
        CONSTRAINT fk_area_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
    );
END $$;

-- Tabela: microarea
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS microarea (
        id BIGSERIAL PRIMARY KEY,
        area_id BIGINT NOT NULL,
        codigo VARCHAR(50) NOT NULL,
        nome VARCHAR(200),
        ativo BOOLEAN DEFAULT true,
        CONSTRAINT fk_microarea_area FOREIGN KEY (area_id) REFERENCES area(id)
    );
END $$;

-- Tabela: vinculo_area_profissional
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS vinculo_area_profissional (
        id BIGSERIAL PRIMARY KEY,
        area_id BIGINT NOT NULL,
        profissional_id BIGINT NOT NULL,
        data_inicio DATE NOT NULL,
        data_fim DATE,
        CONSTRAINT fk_vinculo_area FOREIGN KEY (area_id) REFERENCES area(id),
        CONSTRAINT fk_vinculo_prof_area FOREIGN KEY (profissional_id) REFERENCES profissionais(id)
    );
END $$;

-- Tabela: visita_domiciliar
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS visita_domiciliar (
        id BIGSERIAL PRIMARY KEY,
        paciente_id BIGINT NOT NULL,
        profissional_id BIGINT NOT NULL,
        data_visita TIMESTAMP NOT NULL,
        motivo TEXT,
        observacoes TEXT,
        CONSTRAINT fk_visita_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
        CONSTRAINT fk_visita_prof FOREIGN KEY (profissional_id) REFERENCES profissionais(id)
    );
END $$;

-- ============================================================================
-- MÓDULO: CONFIGURAÇÕES
-- ============================================================================

-- Tabela: configuracao
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS configuracao (
        id BIGSERIAL PRIMARY KEY,
        chave VARCHAR(100) NOT NULL UNIQUE,
        valor TEXT,
        descricao VARCHAR(500),
        tipo VARCHAR(50) DEFAULT 'STRING',
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP
    );
END $$;

-- Tabela: configuracao_recepcao
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS configuracao_recepcao (
        id BIGSERIAL PRIMARY KEY,
        unidade_id BIGINT NOT NULL,
        intervalo_consulta_minutos INTEGER DEFAULT 30,
        antecedencia_agendamento_dias INTEGER DEFAULT 30,
        permite_agendamento_online BOOLEAN DEFAULT false,
        CONSTRAINT fk_config_recepcao_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
    );
END $$;

-- ============================================================================
-- MÓDULO: ASSISTÊNCIA SOCIAL
-- ============================================================================

-- Tabela: familia
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS familia (
        id BIGSERIAL PRIMARY KEY,
        codigo_familiar VARCHAR(50) UNIQUE,
        responsavel_nome VARCHAR(200),
        responsavel_cpf VARCHAR(11),
        endereco VARCHAR(500),
        data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ativo BOOLEAN DEFAULT true
    );
END $$;

-- Tabela: membro_familia
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS membro_familia (
        id BIGSERIAL PRIMARY KEY,
        familia_id BIGINT NOT NULL,
        paciente_id BIGINT,
        nome VARCHAR(200) NOT NULL,
        parentesco VARCHAR(50),
        data_nascimento DATE,
        CONSTRAINT fk_membro_familia FOREIGN KEY (familia_id) REFERENCES familia(id),
        CONSTRAINT fk_membro_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
    );
END $$;

-- Tabela: tipo_vulnerabilidade
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS tipo_vulnerabilidade (
        id BIGSERIAL PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        descricao VARCHAR(200) NOT NULL,
        ativo BOOLEAN DEFAULT true
    );
END $$;

-- Tabela: vulnerabilidade_familia
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS vulnerabilidade_familia (
        id BIGSERIAL PRIMARY KEY,
        familia_id BIGINT NOT NULL,
        tipo_vulnerabilidade_id BIGINT NOT NULL,
        data_identificacao DATE NOT NULL,
        observacoes TEXT,
        CONSTRAINT fk_vuln_familia FOREIGN KEY (familia_id) REFERENCES familia(id),
        CONSTRAINT fk_vuln_tipo FOREIGN KEY (tipo_vulnerabilidade_id) REFERENCES tipo_vulnerabilidade(id)
    );
END $$;

-- Tabela: beneficio
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS beneficio (
        id BIGSERIAL PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        nome VARCHAR(200) NOT NULL,
        descricao TEXT,
        ativo BOOLEAN DEFAULT true
    );
END $$;

-- ============================================================================
-- MÓDULO: AMBULATÓRIO HOSPITALAR
-- ============================================================================

-- Tabela: ambulatorio_especialidades
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS ambulatorio_especialidades (
        id BIGSERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        codigo VARCHAR(50) UNIQUE,
        descricao TEXT,
        ativo BOOLEAN DEFAULT true
    );
END $$;

-- Tabela: ambulatorio_escalas_medicas
DO $$ BEGIN
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS profissional_id BIGINT NOT NULL;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS unidade_id BIGINT NOT NULL;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS especialidade_id BIGINT NOT NULL;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS data_escala DATE NOT NULL;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS hora_inicio TIME NOT NULL;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS hora_fim TIME NOT NULL;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS intervalo_consulta_minutos INTEGER NOT NULL DEFAULT 30;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS vagas_disponveis INTEGER NOT NULL;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS vagas_ocupadas INTEGER DEFAULT 0;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS vagas_bloqueadas INTEGER DEFAULT 0;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS status_escala VARCHAR(50) DEFAULT 'ATIVA';
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS tipo_escala VARCHAR(50);
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS permite_encaixe BOOLEAN DEFAULT false;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS vagas_encaixe INTEGER DEFAULT 0;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS numero_sala VARCHAR(50);
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS observacoes VARCHAR(500);
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMP NOT NULL;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS operador_criacao_id BIGINT NOT NULL;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS data_ultima_alteracao TIMESTAMP;
    ALTER TABLE ambulatorio_escalas_medicas ADD COLUMN IF NOT EXISTS operador_alteracao_id BIGINT;
END $$;

CREATE INDEX IF NOT EXISTS idx_escala_profissional ON ambulatorio_escalas_medicas(profissional_id);
CREATE INDEX IF NOT EXISTS idx_escala_unidade ON ambulatorio_escalas_medicas(unidade_id);
CREATE INDEX IF NOT EXISTS idx_escala_data ON ambulatorio_escalas_medicas(data_escala);

-- ============================================================================
-- MÓDULO: INTERNAÇÃO
-- ============================================================================

-- Tabela: internacao_leitos
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS internacao_leitos (
        id BIGSERIAL PRIMARY KEY,
        unidade_id BIGINT NOT NULL,
        numero_leito VARCHAR(50) NOT NULL,
        setor VARCHAR(100),
        tipo_leito VARCHAR(50),
        status VARCHAR(50) DEFAULT 'DISPONIVEL',
        observacoes TEXT,
        ativo BOOLEAN DEFAULT true
    );
END $$;

-- Tabela: internacao_pacientes
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS internacao_pacientes (
        id BIGSERIAL PRIMARY KEY,
        paciente_id BIGINT NOT NULL,
        leito_id BIGINT NOT NULL,
        data_entrada TIMESTAMP NOT NULL,
        data_saida TIMESTAMP,
        motivo_internacao TEXT,
        diagnostico_entrada TEXT,
        status VARCHAR(50) DEFAULT 'INTERNADO',
        CONSTRAINT fk_internacao_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
        CONSTRAINT fk_internacao_leito FOREIGN KEY (leito_id) REFERENCES internacao_leitos(id)
    );
END $$;

-- ============================================================================
-- MÓDULO: FARMÁCIA
-- ============================================================================

-- Tabela: farmacias
CREATE TABLE IF NOT EXISTS farmacias (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    unidade_id BIGINT,
    endereco VARCHAR(500),
    telefone VARCHAR(20),
    ativo BOOLEAN DEFAULT true
);

-- ============================================================================
-- FOREIGN KEYS ADICIONAIS
-- ============================================================================

-- Adicionar FKs que podem estar faltando (com verificação de existência)
DO $$ BEGIN
    -- agendamentos -> pacientes
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'fk_agendamento_paciente') THEN
        ALTER TABLE agendamentos ADD CONSTRAINT fk_agendamento_paciente
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id);
    END IF;

    -- triagens -> agendamentos
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'fk_triagem_agendamento') THEN
        ALTER TABLE triagens ADD CONSTRAINT fk_triagem_agendamento
        FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id);
    END IF;

    -- atendimentos -> pacientes
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'fk_atendimento_paciente') THEN
        ALTER TABLE atendimentos ADD CONSTRAINT fk_atendimento_paciente
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id);
    END IF;
END $$;

-- ============================================================================
-- COMENTÁRIOS FINAIS
-- ============================================================================

COMMENT ON SCHEMA public IS 'Schema principal do sistema de saúde';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
-- Total de módulos: 17
-- Total de tabelas principais: ~85
-- Total de colunas adicionadas/verificadas: ~650+
-- Total de índices criados: ~55
-- Total de Foreign Keys: ~45
--
-- Módulos incluídos:
--  - Pacientes
--  - Operadores e Segurança
--  - Unidades de Saúde
--  - Profissionais
--  - Agendamentos e Recepção
--  - Triagem
--  - Atendimentos
--  - Exames (SADT)
--  - Estoque
--  - Documentos e Prontuário
--  - Biometria e Logs
--  - UPA
--  - SAMU
--  - Saúde da Família
--  - Configurações
--  - Assistência Social
--  - Ambulatório Hospitalar
--  - Internação
--  - Farmácia
-- ============================================================================
