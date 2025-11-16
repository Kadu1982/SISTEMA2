-- =====================================================
-- MÓDULO DE LABORATÓRIO - Sistema de Saúde
-- Versão: 1.0
-- Data: 2025-01-30
-- =====================================================

-- Tabela de Configurações do Laboratório
CREATE TABLE IF NOT EXISTS lab_configuracao (
    id BIGSERIAL PRIMARY KEY,
    unidade_id BIGINT NOT NULL UNIQUE,

    -- Aba Laboratório
    controle_transacao BOOLEAN DEFAULT FALSE,
    leitura_codigo_barras BOOLEAN DEFAULT FALSE,
    usar_estagios_atendimento BOOLEAN DEFAULT FALSE,
    integracao_consorcio BOOLEAN DEFAULT FALSE,
    usar_biometria BOOLEAN DEFAULT FALSE,
    gerar_codigo_barras_automatico BOOLEAN DEFAULT TRUE,
    validar_idade_exame BOOLEAN DEFAULT TRUE,
    permitir_exame_duplicado BOOLEAN DEFAULT FALSE,
    dias_validade_exame INTEGER DEFAULT 90,

    -- Aba Resultado de Exames
    digitacao_resultado_por_campo BOOLEAN DEFAULT TRUE,
    digitacao_resultado_memorando BOOLEAN DEFAULT FALSE,
    imprimir_resultado_automatico BOOLEAN DEFAULT FALSE,
    usar_interfaceamento BOOLEAN DEFAULT FALSE,
    caminho_interfaceamento VARCHAR(500),

    -- Aba Entrega Exames
    verificar_documento_entrega BOOLEAN DEFAULT TRUE,
    verificar_biometria_entrega BOOLEAN DEFAULT FALSE,
    permitir_entrega_parcial BOOLEAN DEFAULT TRUE,
    alertar_exame_pendente BOOLEAN DEFAULT TRUE,

    -- Aba Impressão
    impressora_etiqueta VARCHAR(200),
    impressora_comprovante VARCHAR(200),
    impressora_mapa VARCHAR(200),
    impressora_laudo VARCHAR(200),
    numero_vias_etiqueta INTEGER DEFAULT 1,
    imprimir_etiqueta_recepcao BOOLEAN DEFAULT TRUE,
    imprimir_comprovante_recepcao BOOLEAN DEFAULT TRUE,

    -- Aba Etiqueta
    configuracao_ppla TEXT,
    largura_etiqueta INTEGER DEFAULT 40,
    altura_etiqueta INTEGER DEFAULT 25,
    incluir_nome_paciente_etiqueta BOOLEAN DEFAULT TRUE,
    incluir_data_nascimento_etiqueta BOOLEAN DEFAULT TRUE,

    -- Aba Estágios de Atendimento
    cor_estagio_recepcao VARCHAR(7) DEFAULT '#FFFFFF',
    cor_estagio_coleta VARCHAR(7) DEFAULT '#FFFF00',
    cor_estagio_resultado VARCHAR(7) DEFAULT '#00FF00',
    cor_estagio_entrega VARCHAR(7) DEFAULT '#0000FF',
    periodo_alerta_coleta INTEGER DEFAULT 30,
    periodo_alerta_resultado INTEGER DEFAULT 60,

    -- Aba Assinatura Eletrônica
    usar_assinatura_eletronica BOOLEAN DEFAULT FALSE,
    usar_certificado_digital BOOLEAN DEFAULT FALSE,
    caminho_imagem_assinatura VARCHAR(500),

    -- Aba Painel Eletrônico
    usar_painel_eletronico BOOLEAN DEFAULT FALSE,
    tempo_atualizacao_painel INTEGER DEFAULT 30,
    exibir_nome_completo_painel BOOLEAN DEFAULT FALSE,

    -- Exportação e-SUS
    exportar_esus BOOLEAN DEFAULT FALSE,
    caminho_exportacao_esus VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,

    FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id)
);

-- Tabela de Materiais de Exame
CREATE TABLE IF NOT EXISTS lab_material_exame (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE,
    sigla VARCHAR(10) NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Tabela de Grupos de Exames
CREATE TABLE IF NOT EXISTS lab_grupo_exame (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE,
    nome VARCHAR(200) NOT NULL,
    descricao VARCHAR(500),
    ordem INTEGER,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Tabela de Mapas do Laboratório
CREATE TABLE IF NOT EXISTS lab_mapa (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE,
    descricao VARCHAR(200) NOT NULL,
    setor VARCHAR(100),
    ordem INTEGER,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Tabela de Profissionais do Mapa
CREATE TABLE IF NOT EXISTS lab_mapa_profissional (
    id BIGSERIAL PRIMARY KEY,
    mapa_id BIGINT NOT NULL,
    profissional_id BIGINT NOT NULL,
    ordem INTEGER,
    responsavel BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (mapa_id) REFERENCES lab_mapa(id),
    FOREIGN KEY (profissional_id) REFERENCES profissionais(id)
);

-- Tabela de Exames
CREATE TABLE IF NOT EXISTS lab_exame (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    nome_resumido VARCHAR(100),
    grupo_id BIGINT,
    sinonimo VARCHAR(200),
    codigo_sigtap VARCHAR(20),
    codigo_tuss VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,

    -- Validações
    idade_minima INTEGER,
    idade_maxima INTEGER,
    sexo_permitido VARCHAR(20),
    dias_validade INTEGER,

    -- Agendamento/Atendimento
    permite_agendamento BOOLEAN DEFAULT TRUE,
    exame_urgencia BOOLEAN DEFAULT FALSE,
    tempo_realizacao_minutos INTEGER,
    qtd_sessoes INTEGER,
    orientacoes_paciente TEXT,
    preparo TEXT,

    -- Mapa
    mapa_id BIGINT,
    ordem_mapa INTEGER,

    -- Digitação
    tipo_digitacao VARCHAR(20) DEFAULT 'POR_CAMPO',
    modelo_laudo TEXT,
    usar_assinatura_eletronica BOOLEAN DEFAULT FALSE,

    -- Faturamento
    valor_particular DECIMAL(10, 2),
    valor_sus DECIMAL(10, 2),
    tipo_faturamento VARCHAR(20),

    -- Interfaceamento
    codigo_equipamento VARCHAR(50),
    usa_interfaceamento BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,

    FOREIGN KEY (grupo_id) REFERENCES lab_grupo_exame(id),
    FOREIGN KEY (mapa_id) REFERENCES lab_mapa(id)
);

-- Corrigir tipos de colunas TEXT que podem ter sido criadas como OID
-- (isso pode acontecer se a tabela já existia com estrutura diferente)
DO $$
BEGIN
    -- Corrigir orientacoes_paciente se for OID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lab_exame' 
        AND column_name = 'orientacoes_paciente'
        AND data_type = 'oid'
    ) THEN
        ALTER TABLE lab_exame DROP COLUMN orientacoes_paciente;
        ALTER TABLE lab_exame ADD COLUMN orientacoes_paciente TEXT;
    END IF;

    -- Corrigir preparo se for OID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lab_exame' 
        AND column_name = 'preparo'
        AND data_type = 'oid'
    ) THEN
        ALTER TABLE lab_exame DROP COLUMN preparo;
        ALTER TABLE lab_exame ADD COLUMN preparo TEXT;
    END IF;

    -- Corrigir modelo_laudo se for OID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lab_exame' 
        AND column_name = 'modelo_laudo'
        AND data_type = 'oid'
    ) THEN
        ALTER TABLE lab_exame DROP COLUMN modelo_laudo;
        ALTER TABLE lab_exame ADD COLUMN modelo_laudo TEXT;
    END IF;
END $$;

-- Tabela de Materiais do Exame (Relacionamento)
CREATE TABLE IF NOT EXISTS lab_exame_material (
    id BIGSERIAL PRIMARY KEY,
    exame_id BIGINT NOT NULL,
    material_id BIGINT NOT NULL,
    quantidade INTEGER DEFAULT 1,
    obrigatorio BOOLEAN DEFAULT TRUE,
    ordem INTEGER,

    FOREIGN KEY (exame_id) REFERENCES lab_exame(id),
    FOREIGN KEY (material_id) REFERENCES lab_material_exame(id)
);

-- Tabela de Exames Complementares
CREATE TABLE IF NOT EXISTS lab_exame_complementar (
    exame_id BIGINT NOT NULL,
    exame_complementar_id BIGINT NOT NULL,

    PRIMARY KEY (exame_id, exame_complementar_id),
    FOREIGN KEY (exame_id) REFERENCES lab_exame(id),
    FOREIGN KEY (exame_complementar_id) REFERENCES lab_exame(id)
);

-- Tabela de Campos Dinâmicos do Exame
CREATE TABLE IF NOT EXISTS lab_campo_exame (
    id BIGSERIAL PRIMARY KEY,
    exame_id BIGINT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    tipo_campo VARCHAR(20) NOT NULL,
    ordem INTEGER NOT NULL,
    obrigatorio BOOLEAN DEFAULT FALSE,
    tamanho_maximo INTEGER,
    opcoes_lista TEXT,
    valor_padrao VARCHAR(500),
    unidade_medida VARCHAR(20),
    casas_decimais INTEGER,
    valor_minimo DOUBLE PRECISION,
    valor_maximo DOUBLE PRECISION,
    mascara VARCHAR(50),
    mostrar_laudo BOOLEAN DEFAULT TRUE,
    ativo BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (exame_id) REFERENCES lab_exame(id)
);

-- Tabela de Métodos/Valores de Referência
CREATE TABLE IF NOT EXISTS lab_metodo_exame (
    id BIGSERIAL PRIMARY KEY,
    exame_id BIGINT NOT NULL,
    nome_metodo VARCHAR(200) NOT NULL,
    descricao VARCHAR(500),
    sexo VARCHAR(20),
    idade_minima_meses INTEGER,
    idade_maxima_meses INTEGER,
    valor_referencia_min DOUBLE PRECISION,
    valor_referencia_max DOUBLE PRECISION,
    valor_referencia_texto TEXT,
    unidade_medida VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,

    FOREIGN KEY (exame_id) REFERENCES lab_exame(id)
);

-- Tabela de Textos Prontos
CREATE TABLE IF NOT EXISTS lab_texto_pronto (
    id BIGSERIAL PRIMARY KEY,
    exame_id BIGINT,
    abreviatura VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,

    FOREIGN KEY (exame_id) REFERENCES lab_exame(id)
);

-- Tabela de Motivos de Exame
CREATE TABLE IF NOT EXISTS lab_motivo_exame (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE,
    descricao VARCHAR(200) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Tabela de Motivos de Nova Coleta
CREATE TABLE IF NOT EXISTS lab_motivo_nova_coleta (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE,
    descricao VARCHAR(200) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Tabela de Recepção de Exames
CREATE TABLE IF NOT EXISTS lab_recepcao_exame (
    id BIGSERIAL PRIMARY KEY,
    numero_recepcao VARCHAR(20) UNIQUE NOT NULL,
    codigo_barras VARCHAR(50) UNIQUE,
    paciente_id BIGINT NOT NULL,
    unidade_id BIGINT NOT NULL,
    profissional_solicitante_id BIGINT,
    agendamento_id BIGINT,
    data_recepcao TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'RECEPCIONADO',
    urgente BOOLEAN DEFAULT FALSE,
    observacoes TEXT,

    -- Biometria
    biometria_coletada BOOLEAN DEFAULT FALSE,
    biometria_template VARCHAR(5000),

    -- Convênio
    convenio_id BIGINT,
    numero_carteirinha VARCHAR(50),
    tipo_atendimento VARCHAR(20),

    -- Auditoria
    operador_recepcao_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,

    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id),
    FOREIGN KEY (profissional_solicitante_id) REFERENCES profissionais(id),
    FOREIGN KEY (operador_recepcao_id) REFERENCES operador(id)
);

-- Tabela de Exames da Recepção
CREATE TABLE IF NOT EXISTS lab_exame_recepcao (
    id BIGSERIAL PRIMARY KEY,
    recepcao_id BIGINT NOT NULL,
    exame_id BIGINT NOT NULL,
    motivo_exame_id BIGINT,
    quantidade INTEGER DEFAULT 1,
    sessao_numero INTEGER,
    autorizado BOOLEAN DEFAULT FALSE,
    numero_autorizacao VARCHAR(50),
    valor_exame DECIMAL(10, 2),
    observacoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'AGUARDANDO_COLETA',

    FOREIGN KEY (recepcao_id) REFERENCES lab_recepcao_exame(id),
    FOREIGN KEY (exame_id) REFERENCES lab_exame(id),
    FOREIGN KEY (motivo_exame_id) REFERENCES lab_motivo_exame(id)
);

-- Tabela de Coleta de Material
CREATE TABLE IF NOT EXISTS lab_coleta_material (
    id BIGSERIAL PRIMARY KEY,
    recepcao_id BIGINT NOT NULL,
    data_coleta TIMESTAMP NOT NULL,
    operador_coleta_id BIGINT NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,

    FOREIGN KEY (recepcao_id) REFERENCES lab_recepcao_exame(id),
    FOREIGN KEY (operador_coleta_id) REFERENCES operador(id)
);

-- Tabela de Materiais Coletados
CREATE TABLE IF NOT EXISTS lab_material_coletado (
    id BIGSERIAL PRIMARY KEY,
    coleta_id BIGINT NOT NULL,
    exame_recepcao_id BIGINT NOT NULL,
    material_id BIGINT NOT NULL,
    quantidade INTEGER DEFAULT 1,
    codigo_tubo VARCHAR(50),
    etiqueta_impressa BOOLEAN DEFAULT FALSE,
    observacoes TEXT,

    -- Nova coleta
    nova_coleta BOOLEAN DEFAULT FALSE,
    motivo_nova_coleta_id BIGINT,
    data_nova_coleta TIMESTAMP,

    FOREIGN KEY (coleta_id) REFERENCES lab_coleta_material(id),
    FOREIGN KEY (exame_recepcao_id) REFERENCES lab_exame_recepcao(id),
    FOREIGN KEY (material_id) REFERENCES lab_material_exame(id),
    FOREIGN KEY (motivo_nova_coleta_id) REFERENCES lab_motivo_nova_coleta(id)
);

-- Tabela de Resultados de Exames
CREATE TABLE IF NOT EXISTS lab_resultado_exame (
    id BIGSERIAL PRIMARY KEY,
    exame_recepcao_id BIGINT NOT NULL UNIQUE,
    metodo_id BIGINT,
    data_resultado TIMESTAMP NOT NULL,
    operador_digitacao_id BIGINT,

    -- Resultado textual
    resultado_texto TEXT,

    -- Laudo
    laudo_gerado TEXT,
    laudo_liberado BOOLEAN DEFAULT FALSE,
    data_liberacao TIMESTAMP,

    -- Assinatura
    assinado BOOLEAN DEFAULT FALSE,
    profissional_assinatura_id BIGINT,
    data_assinatura TIMESTAMP,
    assinatura_digital VARCHAR(5000),
    certificado_digital VARCHAR(5000),

    -- Impressão
    impresso BOOLEAN DEFAULT FALSE,
    data_impressao TIMESTAMP,
    quantidade_impressoes INTEGER DEFAULT 0,

    -- Interfaceamento
    importado_equipamento BOOLEAN DEFAULT FALSE,
    data_importacao TIMESTAMP,
    dados_equipamento TEXT,

    observacoes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,

    FOREIGN KEY (exame_recepcao_id) REFERENCES lab_exame_recepcao(id),
    FOREIGN KEY (metodo_id) REFERENCES lab_metodo_exame(id),
    FOREIGN KEY (operador_digitacao_id) REFERENCES operador(id),
    FOREIGN KEY (profissional_assinatura_id) REFERENCES profissionais(id)
);

-- Tabela de Valores dos Campos do Resultado
CREATE TABLE IF NOT EXISTS lab_valor_campo_resultado (
    id BIGSERIAL PRIMARY KEY,
    resultado_id BIGINT NOT NULL,
    campo_id BIGINT NOT NULL,
    valor VARCHAR(5000),
    valor_numerico DOUBLE PRECISION,
    valor_texto TEXT,
    alterado BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (resultado_id) REFERENCES lab_resultado_exame(id),
    FOREIGN KEY (campo_id) REFERENCES lab_campo_exame(id)
);

-- Tabela de Entrega de Exames
CREATE TABLE IF NOT EXISTS lab_entrega_exame (
    id BIGSERIAL PRIMARY KEY,
    recepcao_id BIGINT NOT NULL,
    data_entrega TIMESTAMP NOT NULL,
    operador_entrega_id BIGINT NOT NULL,

    -- Identificação de quem retirou
    nome_retirou VARCHAR(200) NOT NULL,
    documento_retirou VARCHAR(20) NOT NULL,
    parentesco_retirou VARCHAR(50),

    -- Validação
    biometria_validada BOOLEAN DEFAULT FALSE,
    documento_validado BOOLEAN DEFAULT FALSE,
    assinatura_retirada VARCHAR(5000),

    observacoes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (recepcao_id) REFERENCES lab_recepcao_exame(id),
    FOREIGN KEY (operador_entrega_id) REFERENCES operador(id)
);

-- Tabela de Exames Entregues
CREATE TABLE IF NOT EXISTS lab_exame_entregue (
    id BIGSERIAL PRIMARY KEY,
    entrega_id BIGINT NOT NULL,
    exame_recepcao_id BIGINT NOT NULL,
    vias_impressas INTEGER DEFAULT 1,

    FOREIGN KEY (entrega_id) REFERENCES lab_entrega_exame(id),
    FOREIGN KEY (exame_recepcao_id) REFERENCES lab_exame_recepcao(id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_lab_exame_codigo ON lab_exame(codigo);
CREATE INDEX IF NOT EXISTS idx_lab_exame_ativo ON lab_exame(ativo);
CREATE INDEX IF NOT EXISTS idx_lab_exame_grupo ON lab_exame(grupo_id);
CREATE INDEX IF NOT EXISTS idx_lab_recepcao_numero ON lab_recepcao_exame(numero_recepcao);
CREATE INDEX IF NOT EXISTS idx_lab_recepcao_codigo_barras ON lab_recepcao_exame(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_lab_recepcao_paciente ON lab_recepcao_exame(paciente_id);
CREATE INDEX IF NOT EXISTS idx_lab_recepcao_data ON lab_recepcao_exame(data_recepcao);
CREATE INDEX IF NOT EXISTS idx_lab_recepcao_status ON lab_recepcao_exame(status);
CREATE INDEX IF NOT EXISTS idx_lab_resultado_exame_recepcao ON lab_resultado_exame(exame_recepcao_id);
CREATE INDEX IF NOT EXISTS idx_lab_resultado_liberado ON lab_resultado_exame(laudo_liberado);
CREATE INDEX IF NOT EXISTS idx_lab_resultado_assinado ON lab_resultado_exame(assinado);

-- Comentários nas tabelas
COMMENT ON TABLE lab_configuracao IS 'Configurações do módulo de laboratório por unidade';
COMMENT ON TABLE lab_exame IS 'Cadastro de exames laboratoriais';
COMMENT ON TABLE lab_recepcao_exame IS 'Recepção de pacientes para realização de exames';
COMMENT ON TABLE lab_resultado_exame IS 'Resultados dos exames realizados';
COMMENT ON TABLE lab_entrega_exame IS 'Controle de entrega de exames aos pacientes';