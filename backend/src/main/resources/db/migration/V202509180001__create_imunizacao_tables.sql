-- =====================================================
-- MÓDULO IMUNIZAÇÃO - Sistema de Vacinas
-- Conforme regras de negócio PDF SAUDE-89155 e SAUDE-89087
-- Data: 2025-09-18
-- =====================================================

-- Tabela de vacinas
CREATE TABLE imun_vacinas (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nome VARCHAR(200) NOT NULL,
    descricao VARCHAR(500),
    tipo_vacina VARCHAR(50) NOT NULL,
    codigo_ledi_esus VARCHAR(20),
    codigo_pni VARCHAR(20),
    ativa BOOLEAN DEFAULT TRUE NOT NULL,
    exportar_sipni BOOLEAN DEFAULT FALSE NOT NULL,
    exportar_rnds BOOLEAN DEFAULT FALSE NOT NULL,
    calendario_vacinal BOOLEAN DEFAULT TRUE NOT NULL,
    idade_minima_dias INTEGER,
    idade_maxima_dias INTEGER,
    intervalo_minimo_doses_dias INTEGER,
    numero_doses_esquema INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Índices para vacinas
CREATE INDEX idx_vacinas_codigo ON imun_vacinas(codigo);
CREATE INDEX idx_vacinas_ativa ON imun_vacinas(ativa);
CREATE INDEX idx_vacinas_tipo ON imun_vacinas(tipo_vacina);
CREATE INDEX idx_vacinas_calendario ON imun_vacinas(calendario_vacinal);

-- Tabela de configurações de imunização por unidade
CREATE TABLE imun_configuracoes (
    id BIGSERIAL PRIMARY KEY,
    unidade_id BIGINT NOT NULL REFERENCES unidades_saude(id),
    exportar_rnds BOOLEAN DEFAULT FALSE NOT NULL,
    exportar_esus_ab BOOLEAN DEFAULT FALSE NOT NULL,
    exportar_sipni BOOLEAN DEFAULT TRUE NOT NULL,
    url_webservice_rnds VARCHAR(500),
    token_rnds VARCHAR(1000),
    certificado_digital_path VARCHAR(500),
    senha_certificado VARCHAR(255),
    intervalo_exportacao_minutos INTEGER DEFAULT 60,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Índices para configurações
CREATE UNIQUE INDEX idx_config_unidade ON imun_configuracoes(unidade_id);
CREATE INDEX idx_config_exportar_rnds ON imun_configuracoes(exportar_rnds);
CREATE INDEX idx_config_exportar_esus ON imun_configuracoes(exportar_esus_ab);

-- Tabela de aplicações de vacinas
CREATE TABLE imun_aplicacoes_vacinas (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL REFERENCES pacientes(id),
    vacina_id BIGINT NOT NULL REFERENCES imun_vacinas(id),
    unidade_id BIGINT NOT NULL REFERENCES unidades_saude(id),
    profissional_id BIGINT REFERENCES profissionais(id),
    operador_id BIGINT NOT NULL REFERENCES operador(id),
    data_aplicacao DATE NOT NULL,
    hora_aplicacao VARCHAR(10),
    estrategia_vacinacao VARCHAR(50) NOT NULL,
    local_atendimento VARCHAR(50) NOT NULL,
    dose VARCHAR(50),
    lote VARCHAR(50),
    fabricante VARCHAR(100),
    data_validade DATE,
    via_administracao VARCHAR(50),
    local_aplicacao VARCHAR(100),
    observacoes VARCHAR(500),
    exportado_esus BOOLEAN DEFAULT FALSE NOT NULL,
    exportado_sipni BOOLEAN DEFAULT FALSE NOT NULL,
    exportado_rnds BOOLEAN DEFAULT FALSE NOT NULL,
    data_exportacao_esus TIMESTAMP,
    data_exportacao_sipni TIMESTAMP,
    data_exportacao_rnds TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Índices para aplicações
CREATE INDEX idx_aplicacoes_paciente ON imun_aplicacoes_vacinas(paciente_id);
CREATE INDEX idx_aplicacoes_vacina ON imun_aplicacoes_vacinas(vacina_id);
CREATE INDEX idx_aplicacoes_unidade ON imun_aplicacoes_vacinas(unidade_id);
CREATE INDEX idx_aplicacoes_data ON imun_aplicacoes_vacinas(data_aplicacao);
CREATE INDEX idx_aplicacoes_estrategia ON imun_aplicacoes_vacinas(estrategia_vacinacao);
CREATE INDEX idx_aplicacoes_local_atend ON imun_aplicacoes_vacinas(local_atendimento);
CREATE INDEX idx_aplicacoes_exportado_rnds ON imun_aplicacoes_vacinas(exportado_rnds);
CREATE INDEX idx_aplicacoes_exportado_esus ON imun_aplicacoes_vacinas(exportado_esus);
CREATE INDEX idx_aplicacoes_exportado_sipni ON imun_aplicacoes_vacinas(exportado_sipni);

-- Comentários nas tabelas
COMMENT ON TABLE imun_vacinas IS 'Cadastro de vacinas do sistema de imunização';
COMMENT ON TABLE imun_configuracoes IS 'Configurações de exportação por unidade de saúde - SAUDE-89155';
COMMENT ON TABLE imun_aplicacoes_vacinas IS 'Registro de aplicações de vacinas - SAUDE-89087';

-- Comentários em campos importantes
COMMENT ON COLUMN imun_vacinas.codigo_ledi_esus IS 'Código LEDI do e-SUS conforme recomendação';
COMMENT ON COLUMN imun_vacinas.exportar_sipni IS 'FALSE para exportar via RNDS conforme regra';
COMMENT ON COLUMN imun_configuracoes.exportar_rnds IS 'Exportar para RNDS - Rede Nacional de Dados em Saúde';
COMMENT ON COLUMN imun_configuracoes.exportar_esus_ab IS 'Exportar para e-SUS AB - Atenção Básica';
COMMENT ON COLUMN imun_aplicacoes_vacinas.local_atendimento IS 'NENHUM quando unidade não exporta e-SUS - SAUDE-89155';

-- =====================================================
-- DADOS INICIAIS - Vacinas do Calendário Nacional
-- =====================================================

-- Inserir algumas vacinas básicas do calendário
INSERT INTO imun_vacinas (codigo, nome, tipo_vacina, calendario_vacinal, ativa, exportar_rnds, exportar_sipni, numero_doses_esquema) VALUES
('BCG', 'BCG - Bacilo Calmette-Guérin', 'CALENDARIO_INFANTIL', true, true, true, false, 1),
('HEPA-B', 'Hepatite B', 'CALENDARIO_INFANTIL', true, true, true, false, 3),
('PENTA', 'Pentavalente (DTP/Hib/HepB)', 'CALENDARIO_INFANTIL', true, true, true, false, 3),
('VIP', 'Vacina Inativada Poliomielite', 'CALENDARIO_INFANTIL', true, true, true, false, 3),
('VOP', 'Vacina Oral Poliomielite', 'CALENDARIO_INFANTIL', true, true, true, false, 2),
('ROTA', 'Rotavírus Humano', 'CALENDARIO_INFANTIL', true, true, true, false, 2),
('PNEUMO10', 'Pneumocócica 10-valente', 'CALENDARIO_INFANTIL', true, true, true, false, 3),
('MENINGO-C', 'Meningocócica C', 'CALENDARIO_INFANTIL', true, true, true, false, 2),
('SRC', 'Sarampo, Caxumba, Rubéola', 'CALENDARIO_INFANTIL', true, true, true, false, 2),
('TETRA', 'Tetravalente (DTP/Hib)', 'CALENDARIO_INFANTIL', true, true, true, false, 1),
('DTP', 'Tríplice Bacteriana', 'CALENDARIO_INFANTIL', true, true, true, false, 1),
('COVID-19', 'COVID-19', 'COVID19', false, true, false, false, 2),
('INFLUENZA', 'Influenza', 'CAMPANHA', true, true, true, false, 1),
('HEPATITE-A', 'Hepatite A', 'CALENDARIO_INFANTIL', true, true, true, false, 1);

-- Configuração padrão para unidades (será ajustada por unidade)
-- Esta inserção deve ser feita após ter pelo menos uma unidade cadastrada
-- INSERT INTO imun_configuracoes (unidade_id, exportar_rnds, exportar_esus_ab, exportar_sipni)
-- SELECT id, true, false, false FROM unidades_saude LIMIT 1;