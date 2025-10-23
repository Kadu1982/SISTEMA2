-- Migration para criar o módulo Hospitalar
-- Versão: V20250923_1500__criar_modulo_hospitalar.sql

-- Tabela de configurações hospitalares
CREATE TABLE configuracao_hospitalar (
    id BIGSERIAL PRIMARY KEY,
    parametro VARCHAR(100) NOT NULL,
    valor VARCHAR(500) NOT NULL,
    descricao VARCHAR(255),
    tipo VARCHAR(50) CHECK (tipo IN ('PROCEDIMENTO', 'IMPRESSAO', 'SISTEMA', 'CONTROLE_ACESSO', 'CERTIFICADO_DIGITAL', 'MULTI_ESTABELECIMENTO')),
    ativo BOOLEAN DEFAULT true,
    unidade_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para configuracao_hospitalar
CREATE UNIQUE INDEX UK_configuracao_parametro_unidade ON configuracao_hospitalar(parametro, unidade_id);
CREATE INDEX IDX_configuracao_tipo ON configuracao_hospitalar(tipo);
CREATE INDEX IDX_configuracao_unidade ON configuracao_hospitalar(unidade_id);

-- Tabela de filas de atendimento
CREATE TABLE fila_atendimento (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    prefixo_senha VARCHAR(10) NOT NULL,
    sequencia_atual INT DEFAULT 0,
    periodo_sequencia VARCHAR(20) CHECK (periodo_sequencia IN ('DIARIO', 'SEMANAL', 'MENSAL', 'ANUAL')),
    ativo BOOLEAN DEFAULT true,
    unidade_id BIGINT,
    setor_id BIGINT,
    horario_inicio TIME,
    horario_fim TIME,
    permite_prioritario BOOLEAN DEFAULT true,
    tempo_espera_alvo INT, -- em minutos
    tempo_espera_tolerancia INT, -- em minutos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para fila_atendimento
CREATE UNIQUE INDEX UK_fila_prefixo_unidade ON fila_atendimento(prefixo_senha, unidade_id);
CREATE INDEX IDX_fila_unidade ON fila_atendimento(unidade_id);
CREATE INDEX IDX_fila_setor ON fila_atendimento(setor_id);
CREATE INDEX IDX_fila_ativo ON fila_atendimento(ativo);

-- Tabela de senhas de atendimento
CREATE TABLE senha_atendimento (
    id BIGSERIAL PRIMARY KEY,
    fila_id BIGINT NOT NULL,
    numero_senha VARCHAR(20) NOT NULL,
    sequencia INT NOT NULL,
    tipo_senha VARCHAR(30) CHECK (tipo_senha IN ('NORMAL', 'PRIORITARIO_IDOSO', 'PRIORITARIO_PNE', 'PRIORITARIO_GESTANTE', 'PRIORITARIO_LACTANTE')),
    paciente_id BIGINT,
    status VARCHAR(20) CHECK (status IN ('AGUARDANDO', 'CHAMADA', 'EM_ATENDIMENTO', 'CONCLUIDA', 'CANCELADA', 'NAO_COMPARECEU')),
    data_emissao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_chamada TIMESTAMP,
    data_atendimento TIMESTAMP,
    data_conclusao TIMESTAMP,
    posicao_guiche VARCHAR(50),
    sala_consultorio VARCHAR(50),
    operador_chamada_id BIGINT,
    operador_atendimento_id BIGINT,
    motivo_cancelamento VARCHAR(255),
    observacoes VARCHAR(500)
);

-- Índices para senha_atendimento
CREATE INDEX IDX_senha_fila ON senha_atendimento(fila_id);
CREATE INDEX IDX_senha_status ON senha_atendimento(status);
CREATE INDEX IDX_senha_data_emissao ON senha_atendimento(data_emissao);
CREATE INDEX IDX_senha_paciente ON senha_atendimento(paciente_id);
CREATE INDEX IDX_senha_fila_status ON senha_atendimento(fila_id, status);
CREATE UNIQUE INDEX UK_senha_numero_fila ON senha_atendimento(numero_senha, fila_id);

-- Tabela de painéis de atendimento
CREATE TABLE painel_atendimento (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    localizacao VARCHAR(100) NOT NULL,
    fila_id BIGINT,
    configuracao_campos TEXT, -- JSON
    configuracao_layout TEXT, -- JSON
    chamada_tela_cheia BOOLEAN DEFAULT false,
    chamada_com_som BOOLEAN DEFAULT true,
    chamada_com_voz BOOLEAN DEFAULT true,
    tipo_voz VARCHAR(20) CHECK (tipo_voz IN ('MASCULINA', 'FEMININA', 'ESPECIFICA')),
    exibir_direcao BOOLEAN DEFAULT true,
    exibir_local BOOLEAN DEFAULT true,
    exibir_ultimas_senhas BOOLEAN DEFAULT true,
    qtd_ultimas_senhas INT DEFAULT 5,
    exibir_multimedia BOOLEAN DEFAULT false,
    multimedia_config TEXT, -- JSON
    exibir_fila_espera BOOLEAN DEFAULT true,
    exibir_tempo_espera BOOLEAN DEFAULT true,
    ativo BOOLEAN DEFAULT true,
    unidade_id BIGINT,
    setor_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para painel_atendimento
CREATE INDEX IDX_painel_fila ON painel_atendimento(fila_id);
CREATE INDEX IDX_painel_unidade ON painel_atendimento(unidade_id);
CREATE INDEX IDX_painel_setor ON painel_atendimento(setor_id);
CREATE INDEX IDX_painel_ativo ON painel_atendimento(ativo);

-- Tabela de controle de acesso
CREATE TABLE controle_acesso (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    documento VARCHAR(50) NOT NULL,
    tipo_documento VARCHAR(20) CHECK (tipo_documento IN ('CPF', 'RG', 'CNH', 'PASSAPORTE')),
    tipo_visitante VARCHAR(30) CHECK (tipo_visitante IN ('VISITANTE', 'ACOMPANHANTE', 'FORNECEDOR', 'PRESTADOR_SERVICO', 'PACIENTE')),
    paciente_id BIGINT,
    grau_parentesco VARCHAR(50),
    telefone VARCHAR(20),
    empresa_fornecedor VARCHAR(100),
    setor_destino VARCHAR(100),
    responsavel_liberacao_id BIGINT,
    data_entrada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_saida TIMESTAMP,
    observacoes VARCHAR(500),
    numero_cracha VARCHAR(20),
    foto_path VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('DENTRO', 'SAIU', 'CANCELADO')),
    unidade_id BIGINT
);

-- Índices para controle_acesso
CREATE INDEX IDX_acesso_data_entrada ON controle_acesso(data_entrada);
CREATE INDEX IDX_acesso_status ON controle_acesso(status);
CREATE INDEX IDX_acesso_paciente ON controle_acesso(paciente_id);
CREATE INDEX IDX_acesso_unidade ON controle_acesso(unidade_id);
CREATE INDEX IDX_acesso_tipo_visitante ON controle_acesso(tipo_visitante);

-- Tabela de classificação de risco
CREATE TABLE classificacao_risco (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    atendimento_id BIGINT,
    protocolo_utilizado VARCHAR(20) CHECK (protocolo_utilizado IN ('HUMANIZA_SUS', 'MANCHESTER', 'INSTITUCIONAL')),
    queixa_principal VARCHAR(500),
    observacoes_abordagem VARCHAR(1000),
    medicamentos_uso VARCHAR(1000),
    alergias VARCHAR(500),
    reacoes_alergicas VARCHAR(500),
    sinais_vitais TEXT, -- JSON
    sintoma_principal VARCHAR(200),
    avaliacao_glasgow INT,
    escala_dor INT CHECK (escala_dor BETWEEN 0 AND 10),
    cor_prioridade VARCHAR(20) CHECK (cor_prioridade IN ('AZUL', 'VERDE', 'AMARELO', 'LARANJA', 'VERMELHO')),
    tempo_max_espera INT, -- em minutos
    especialidade_sugerida VARCHAR(100),
    risco_sepse BOOLEAN DEFAULT false,
    data_classificacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    operador_id BIGINT NOT NULL,
    reavaliacao BOOLEAN DEFAULT false,
    classificacao_anterior_id BIGINT,
    encaminhamento_social BOOLEAN DEFAULT false,
    observacoes_gerais VARCHAR(1000)
);

-- Índices para classificacao_risco
CREATE INDEX IDX_classificacao_paciente ON classificacao_risco(paciente_id);
CREATE INDEX IDX_classificacao_atendimento ON classificacao_risco(atendimento_id);
CREATE INDEX IDX_classificacao_data ON classificacao_risco(data_classificacao);
CREATE INDEX IDX_classificacao_cor ON classificacao_risco(cor_prioridade);
CREATE INDEX IDX_classificacao_operador ON classificacao_risco(operador_id);

-- Tabela de leitos
CREATE TABLE leito (
    id BIGSERIAL PRIMARY KEY,
    numero VARCHAR(20) NOT NULL,
    andar VARCHAR(20),
    ala VARCHAR(50),
    enfermaria VARCHAR(100) NOT NULL,
    unidade_id BIGINT NOT NULL,
    setor_id BIGINT,
    tipo_acomodacao VARCHAR(20) CHECK (tipo_acomodacao IN ('ENFERMARIA', 'APARTAMENTO', 'UTI', 'SEMI_UTI', 'ISOLAMENTO')),
    status VARCHAR(20) CHECK (status IN ('DISPONIVEL', 'OCUPADO', 'RESERVADO', 'INTERDITADO', 'MANUTENCAO', 'LIMPEZA')),
    paciente_id BIGINT,
    atendimento_id BIGINT,
    data_ocupacao TIMESTAMP,
    data_liberacao TIMESTAMP,
    data_limpeza TIMESTAMP,
    tipo_limpeza_necessaria VARCHAR(20) CHECK (tipo_limpeza_necessaria IN ('TERMINAL', 'CONCORRENTE', 'DESINFECCAO')),
    status_limpeza VARCHAR(20) CHECK (status_limpeza IN ('LIMPO', 'SUJO', 'EM_LIMPEZA', 'AGUARDANDO_LIMPEZA')),
    motivo_interdicao VARCHAR(255),
    data_interdicao TIMESTAMP,
    responsavel_interdicao_id BIGINT,
    observacoes VARCHAR(500),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para leito
CREATE UNIQUE INDEX UK_leito_numero_enfermaria_unidade ON leito(numero, enfermaria, unidade_id);
CREATE INDEX IDX_leito_status ON leito(status);
CREATE INDEX IDX_leito_unidade ON leito(unidade_id);
CREATE INDEX IDX_leito_paciente ON leito(paciente_id);
CREATE INDEX IDX_leito_enfermaria ON leito(enfermaria);
CREATE INDEX IDX_leito_tipo_acomodacao ON leito(tipo_acomodacao);
CREATE INDEX IDX_leito_status_limpeza ON leito(status_limpeza);

-- Tabela de solicitação de leito
CREATE TABLE solicitacao_leito (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL,
    atendimento_id BIGINT,
    medico_solicitante_id BIGINT NOT NULL,
    tipo_acomodacao_solicitada VARCHAR(20) CHECK (tipo_acomodacao_solicitada IN ('ENFERMARIA', 'APARTAMENTO', 'UTI', 'SEMI_UTI', 'ISOLAMENTO')),
    especialidade_solicitada VARCHAR(100),
    unidade_solicitada VARCHAR(100),
    prioridade VARCHAR(20) CHECK (prioridade IN ('ALTA', 'MEDIA', 'BAIXA', 'ELETIVA')),
    motivo_internacao VARCHAR(500),
    observacoes_clinicas VARCHAR(1000),
    data_solicitacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_necessidade TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('SOLICITADO', 'EM_ANALISE', 'RESERVADO', 'ATENDIDO', 'CANCELADO', 'TRANSFERIDO')),
    leito_reservado_id BIGINT,
    data_reserva TIMESTAMP,
    responsavel_reserva_id BIGINT,
    data_atendimento TIMESTAMP,
    motivo_cancelamento VARCHAR(255),
    observacoes_central VARCHAR(500)
);

-- Índices para solicitacao_leito
CREATE INDEX IDX_solicitacao_paciente ON solicitacao_leito(paciente_id);
CREATE INDEX IDX_solicitacao_medico ON solicitacao_leito(medico_solicitante_id);
CREATE INDEX IDX_solicitacao_status ON solicitacao_leito(status);
CREATE INDEX IDX_solicitacao_data ON solicitacao_leito(data_solicitacao);
CREATE INDEX IDX_solicitacao_prioridade ON solicitacao_leito(prioridade);
CREATE INDEX IDX_solicitacao_leito_reservado ON solicitacao_leito(leito_reservado_id);

-- Foreign Keys para tabelas internas do módulo
ALTER TABLE senha_atendimento ADD CONSTRAINT FK_senha_fila
    FOREIGN KEY (fila_id) REFERENCES fila_atendimento(id);

ALTER TABLE painel_atendimento ADD CONSTRAINT FK_painel_fila
    FOREIGN KEY (fila_id) REFERENCES fila_atendimento(id);

ALTER TABLE classificacao_risco ADD CONSTRAINT FK_classificacao_anterior
    FOREIGN KEY (classificacao_anterior_id) REFERENCES classificacao_risco(id);

ALTER TABLE solicitacao_leito ADD CONSTRAINT FK_solicitacao_leito_reservado
    FOREIGN KEY (leito_reservado_id) REFERENCES leito(id);

-- Foreign Keys para tabelas do sistema existente
-- Referências para Paciente
ALTER TABLE senha_atendimento ADD CONSTRAINT FK_senha_paciente
    FOREIGN KEY (paciente_id) REFERENCES paciente(id);

ALTER TABLE controle_acesso ADD CONSTRAINT FK_acesso_paciente
    FOREIGN KEY (paciente_id) REFERENCES paciente(id);

ALTER TABLE classificacao_risco ADD CONSTRAINT FK_classificacao_paciente
    FOREIGN KEY (paciente_id) REFERENCES paciente(id);

ALTER TABLE leito ADD CONSTRAINT FK_leito_paciente
    FOREIGN KEY (paciente_id) REFERENCES paciente(id);

ALTER TABLE solicitacao_leito ADD CONSTRAINT FK_solicitacao_paciente
    FOREIGN KEY (paciente_id) REFERENCES paciente(id);

-- Referências para Operador
ALTER TABLE senha_atendimento ADD CONSTRAINT FK_senha_operador_chamada
    FOREIGN KEY (operador_chamada_id) REFERENCES operador(id);

ALTER TABLE senha_atendimento ADD CONSTRAINT FK_senha_operador_atendimento
    FOREIGN KEY (operador_atendimento_id) REFERENCES operador(id);

ALTER TABLE controle_acesso ADD CONSTRAINT FK_acesso_responsavel
    FOREIGN KEY (responsavel_liberacao_id) REFERENCES operador(id);

ALTER TABLE classificacao_risco ADD CONSTRAINT FK_classificacao_operador
    FOREIGN KEY (operador_id) REFERENCES operador(id);

ALTER TABLE leito ADD CONSTRAINT FK_leito_responsavel_interdicao
    FOREIGN KEY (responsavel_interdicao_id) REFERENCES operador(id);

ALTER TABLE solicitacao_leito ADD CONSTRAINT FK_solicitacao_responsavel_reserva
    FOREIGN KEY (responsavel_reserva_id) REFERENCES operador(id);

-- Referências para Profissional (médico solicitante)
ALTER TABLE solicitacao_leito ADD CONSTRAINT FK_solicitacao_medico
    FOREIGN KEY (medico_solicitante_id) REFERENCES profissional(id);

-- Referências para UnidadeSaude
ALTER TABLE configuracao_hospitalar ADD CONSTRAINT FK_config_unidade
    FOREIGN KEY (unidade_id) REFERENCES unidade_saude(id);

ALTER TABLE fila_atendimento ADD CONSTRAINT FK_fila_unidade
    FOREIGN KEY (unidade_id) REFERENCES unidade_saude(id);

ALTER TABLE painel_atendimento ADD CONSTRAINT FK_painel_unidade
    FOREIGN KEY (unidade_id) REFERENCES unidade_saude(id);

ALTER TABLE controle_acesso ADD CONSTRAINT FK_acesso_unidade
    FOREIGN KEY (unidade_id) REFERENCES unidade_saude(id);

ALTER TABLE leito ADD CONSTRAINT FK_leito_unidade
    FOREIGN KEY (unidade_id) REFERENCES unidade_saude(id);

-- Inserir algumas configurações padrão
INSERT INTO configuracao_hospitalar (parametro, valor, descricao, tipo) VALUES
('SISTEMA_MULTI_ESTABELECIMENTO', 'true', 'Habilita funcionamento multi-estabelecimento', 'SISTEMA'),
('CERTIFICADO_DIGITAL_OBRIGATORIO', 'false', 'Exige certificado digital para documentos', 'CERTIFICADO_DIGITAL'),
('TEMPO_EXPIRACAO_SENHA_DIAS', '90', 'Dias para expiração de senhas de usuário', 'SISTEMA'),
('BACKUP_AUTOMATICO', 'true', 'Habilita backup automático do sistema', 'SISTEMA'),
('PROTOCOLO_CLASSIFICACAO_PADRAO', 'HUMANIZA_SUS', 'Protocolo padrão para classificação de risco', 'PROCEDIMENTO');

-- Inserir configurações de exemplo para filas
INSERT INTO fila_atendimento (nome, prefixo_senha, periodo_sequencia, unidade_id, horario_inicio, horario_fim, tempo_espera_alvo, tempo_espera_tolerancia) VALUES
('Recepção Geral', 'RG', 'DIARIO', 1, '07:00', '17:00', 15, 30),
('Triagem', 'TR', 'DIARIO', 1, '07:00', '17:00', 10, 20),
('Consulta Médica', 'CM', 'DIARIO', 1, '07:00', '17:00', 30, 60),
('Exames', 'EX', 'DIARIO', 1, '07:00', '17:00', 20, 45),
('Farmácia', 'FA', 'DIARIO', 1, '07:00', '17:00', 10, 25);

-- Migration completed successfully