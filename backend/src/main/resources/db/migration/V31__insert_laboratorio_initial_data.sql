-- =====================================================
-- DADOS INICIAIS - MÓDULO DE LABORATÓRIO
-- =====================================================

-- Grupos de Exames
INSERT INTO lab_grupo_exame (codigo, nome, descricao, ordem, ativo, created_at) VALUES
('HEMATO', 'Hematologia', 'Exames hematológicos e coagulação', 1, true, NOW()),
('BIOQ', 'Bioquímica', 'Exames bioquímicos e metabólicos', 2, true, NOW()),
('URINA', 'Urinálise', 'Exames de urina', 3, true, NOW()),
('MICRO', 'Microbiologia', 'Culturas e antibiogramas', 4, true, NOW()),
('IMUNO', 'Imunologia', 'Exames imunológicos e sorológicos', 5, true, NOW()),
('HORM', 'Hormônios', 'Dosagens hormonais', 6, true, NOW()),
('PARASITO', 'Parasitologia', 'Exames parasitológicos', 7, true, NOW());

-- Materiais de Exame
INSERT INTO lab_material_exame (codigo, sigla, descricao, ativo, created_at) VALUES
('SANG', 'SG', 'Sangue (tubo amarelo - soro)', true, NOW()),
('SANGFL', 'SF', 'Sangue (tubo roxo - EDTA)', true, NOW()),
('SANGCIT', 'SC', 'Sangue (tubo azul - citrato)', true, NOW()),
('URINA', 'UR', 'Urina (amostra única)', true, NOW()),
('URINA24', 'U24', 'Urina de 24 horas', true, NOW()),
('FEZES', 'FZ', 'Fezes', true, NOW()),
('ESCARRO', 'ES', 'Escarro', true, NOW()),
('SWAB', 'SW', 'Swab (diversos)', true, NOW());

-- Exames de Hematologia
INSERT INTO lab_exame (codigo, nome, nome_resumido, grupo_id, codigo_sigtap, ativo,
    permite_agendamento, tempo_realizacao_minutos, valor_particular, valor_sus,
    tipo_digitacao, sexo_permitido, dias_validade, created_at)
VALUES
('HEM001', 'Hemograma Completo', 'Hemograma',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'HEMATO'),
    '0202010473', true, true, 30, 45.00, 10.20, 'POR_CAMPO', 'AMBOS', 90, NOW()),

('HEM002', 'Contagem de Plaquetas', 'Plaquetas',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'HEMATO'),
    '0202010481', true, true, 20, 30.00, 5.10, 'POR_CAMPO', 'AMBOS', 90, NOW()),

('HEM003', 'Tempo de Coagulação (TC)', 'TC',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'HEMATO'),
    '0202010520', true, true, 15, 25.00, 4.20, 'POR_CAMPO', 'AMBOS', 30, NOW()),

('HEM004', 'Tempo de Sangramento (TS)', 'TS',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'HEMATO'),
    '0202010538', true, true, 15, 25.00, 4.20, 'POR_CAMPO', 'AMBOS', 30, NOW());

-- Exames de Bioquímica
INSERT INTO lab_exame (codigo, nome, nome_resumido, grupo_id, codigo_sigtap, ativo,
    permite_agendamento, tempo_realizacao_minutos, valor_particular, valor_sus,
    tipo_digitacao, sexo_permitido, dias_validade, orientacoes_paciente, created_at)
VALUES
('BIOQ001', 'Glicemia em Jejum', 'Glicemia',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'BIOQ'),
    '0202010376', true, true, 20, 15.00, 2.55, 'POR_CAMPO', 'AMBOS', 180,
    'Jejum de 8 a 12 horas', NOW()),

('BIOQ002', 'Colesterol Total', 'Colesterol',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'BIOQ'),
    '0202010309', true, true, 20, 18.00, 3.06, 'POR_CAMPO', 'AMBOS', 180,
    'Jejum de 12 horas', NOW()),

('BIOQ003', 'HDL Colesterol', 'HDL',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'BIOQ'),
    '0202010392', true, true, 20, 18.00, 3.06, 'POR_CAMPO', 'AMBOS', 180,
    'Jejum de 12 horas', NOW()),

('BIOQ004', 'LDL Colesterol', 'LDL',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'BIOQ'),
    '0202010430', true, true, 20, 18.00, 3.06, 'POR_CAMPO', 'AMBOS', 180,
    'Jejum de 12 horas', NOW()),

('BIOQ005', 'Triglicerídeos', 'Triglicerídeos',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'BIOQ'),
    '0202010562', true, true, 20, 18.00, 3.06, 'POR_CAMPO', 'AMBOS', 180,
    'Jejum de 12 horas', NOW()),

('BIOQ006', 'Ureia', 'Ureia',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'BIOQ'),
    '0202010570', true, true, 20, 15.00, 2.55, 'POR_CAMPO', 'AMBOS', 180,
    'Jejum de 4 horas', NOW()),

('BIOQ007', 'Creatinina', 'Creatinina',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'BIOQ'),
    '0202010325', true, true, 20, 15.00, 2.55, 'POR_CAMPO', 'AMBOS', 180,
    'Jejum de 4 horas', NOW());

-- Exames de Urina
INSERT INTO lab_exame (codigo, nome, nome_resumido, grupo_id, codigo_sigtap, ativo,
    permite_agendamento, tempo_realizacao_minutos, valor_particular, valor_sus,
    tipo_digitacao, sexo_permitido, dias_validade, orientacoes_paciente, created_at)
VALUES
('URI001', 'Exame de Urina Tipo I (EAS)', 'EAS',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'URINA'),
    '0202010660', true, true, 30, 20.00, 3.40, 'POR_CAMPO', 'AMBOS', 90,
    'Primeira urina da manhã. Higienizar a região genital antes da coleta.', NOW()),

('URI002', 'Urinocultura com Antibiograma', 'Urocultura',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'MICRO'),
    '0202070051', true, true, 4320, 35.00, 7.48, 'MEMORANDO', 'AMBOS', 30,
    'Primeira urina da manhã. Higienizar bem a região genital. Coletar jato médio.', NOW());

-- Associar materiais aos exames
-- Hemograma - Sangue com EDTA
INSERT INTO lab_exame_material (exame_id, material_id, quantidade, obrigatorio, ordem)
SELECT
    (SELECT id FROM lab_exame WHERE codigo = 'HEM001'),
    (SELECT id FROM lab_material_exame WHERE codigo = 'SANGFL'),
    1, true, 1;

-- Glicemia - Sangue com soro
INSERT INTO lab_exame_material (exame_id, material_id, quantidade, obrigatorio, ordem)
SELECT
    (SELECT id FROM lab_exame WHERE codigo = 'BIOQ001'),
    (SELECT id FROM lab_material_exame WHERE codigo = 'SANG'),
    1, true, 1;

-- Colesterol Total - Sangue com soro
INSERT INTO lab_exame_material (exame_id, material_id, quantidade, obrigatorio, ordem)
SELECT
    (SELECT id FROM lab_exame WHERE codigo = 'BIOQ002'),
    (SELECT id FROM lab_material_exame WHERE codigo = 'SANG'),
    1, true, 1;

-- EAS - Urina
INSERT INTO lab_exame_material (exame_id, material_id, quantidade, obrigatorio, ordem)
SELECT
    (SELECT id FROM lab_exame WHERE codigo = 'URI001'),
    (SELECT id FROM lab_material_exame WHERE codigo = 'URINA'),
    1, true, 1;

-- Urocultura - Urina
INSERT INTO lab_exame_material (exame_id, material_id, quantidade, obrigatorio, ordem)
SELECT
    (SELECT id FROM lab_exame WHERE codigo = 'URI002'),
    (SELECT id FROM lab_material_exame WHERE codigo = 'URINA'),
    1, true, 1;

-- Motivos de Exame
INSERT INTO lab_motivo_exame (codigo, descricao, ativo, created_at) VALUES
('PREV', 'Prevenção', true, NOW()),
('DIAG', 'Diagnóstico', true, NOW()),
('ACOMP', 'Acompanhamento', true, NOW()),
('PREO', 'Pré-operatório', true, NOW()),
('URG', 'Urgência/Emergência', true, NOW());

-- Motivos de Nova Coleta
INSERT INTO lab_motivo_nova_coleta (codigo, descricao, ativo, created_at) VALUES
('INSUF', 'Amostra insuficiente', true, NOW()),
('HEMOL', 'Amostra hemolisada', true, NOW()),
('COAG', 'Amostra coagulada', true, NOW()),
('CONT', 'Amostra contaminada', true, NOW()),
('IDENT', 'Erro de identificação', true, NOW());