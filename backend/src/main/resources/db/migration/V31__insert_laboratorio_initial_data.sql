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
('PARASITO', 'Parasitologia', 'Exames parasitológicos', 7, true, NOW())
ON CONFLICT (codigo) DO NOTHING;

-- Materiais de Exame
INSERT INTO lab_material_exame (codigo, sigla, descricao, ativo, created_at) VALUES
('SANG', 'SG', 'Sangue (tubo amarelo - soro)', true, NOW()),
('SANGFL', 'SF', 'Sangue (tubo roxo - EDTA)', true, NOW()),
('SANGCIT', 'SC', 'Sangue (tubo azul - citrato)', true, NOW()),
('URINA', 'UR', 'Urina (amostra única)', true, NOW()),
('URINA24', 'U24', 'Urina de 24 horas', true, NOW()),
('FEZES', 'FZ', 'Fezes', true, NOW()),
('ESCARRO', 'ES', 'Escarro', true, NOW()),
('SWAB', 'SW', 'Swab (diversos)', true, NOW())
ON CONFLICT (codigo) DO NOTHING;

-- Exames de Hematologia
INSERT INTO lab_exame (codigo, nome, nome_resumido, grupo_id, codigo_sigtap, ativo,
    sexo_permitido, dias_validade, permite_agendamento, tempo_realizacao_minutos,
    tipo_digitacao, valor_particular, valor_sus, created_at)
SELECT
    'HEM001', 'Hemograma Completo', 'Hemograma',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'HEMATO'),
    '0202010473', true, 'AMBOS', 90, true, 30, 'POR_CAMPO', 45.00, 10.20, NOW()
WHERE NOT EXISTS (SELECT 1 FROM lab_exame WHERE codigo = 'HEM001')
UNION ALL
SELECT
    'HEM002', 'Contagem de Plaquetas', 'Plaquetas',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'HEMATO'),
    '0202010481', true, 'AMBOS', 90, true, 20, 'POR_CAMPO', 30.00, 5.10, NOW()
WHERE NOT EXISTS (SELECT 1 FROM lab_exame WHERE codigo = 'HEM002')
UNION ALL
SELECT
    'HEM003', 'Tempo de Coagulação (TC)', 'TC',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'HEMATO'),
    '0202010520', true, 'AMBOS', 30, true, 15, 'POR_CAMPO', 25.00, 4.20, NOW()
WHERE NOT EXISTS (SELECT 1 FROM lab_exame WHERE codigo = 'HEM003')
UNION ALL
SELECT
    'HEM004', 'Tempo de Sangramento (TS)', 'TS',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'HEMATO'),
    '0202010538', true, 'AMBOS', 30, true, 15, 'POR_CAMPO', 25.00, 4.20, NOW()
WHERE NOT EXISTS (SELECT 1 FROM lab_exame WHERE codigo = 'HEM004');

-- Exames de Bioquímica
INSERT INTO lab_exame (codigo, nome, nome_resumido, grupo_id, codigo_sigtap, ativo,
    sexo_permitido, dias_validade, permite_agendamento, tempo_realizacao_minutos,
    orientacoes_paciente, tipo_digitacao, valor_particular, valor_sus, created_at)
SELECT
    'BIOQ001', 'Glicemia em Jejum', 'Glicemia',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'BIOQ'),
    '0202010376', true, 'AMBOS', 180, true, 20,
    'Jejum de 8 a 12 horas', 'POR_CAMPO', 15.00, 2.55, NOW()
WHERE NOT EXISTS (SELECT 1 FROM lab_exame WHERE codigo = 'BIOQ001')
UNION ALL
SELECT
    'BIOQ002', 'Colesterol Total', 'Colesterol',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'BIOQ'),
    '0202010309', true, 'AMBOS', 180, true, 20,
    'Jejum de 12 horas', 'POR_CAMPO', 18.00, 3.06, NOW()
WHERE NOT EXISTS (SELECT 1 FROM lab_exame WHERE codigo = 'BIOQ002')
UNION ALL
SELECT
    'BIOQ003', 'HDL Colesterol', 'HDL',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'BIOQ'),
    '0202010392', true, 'AMBOS', 180, true, 20,
    'Jejum de 12 horas', 'POR_CAMPO', 18.00, 3.06, NOW()
WHERE NOT EXISTS (SELECT 1 FROM lab_exame WHERE codigo = 'BIOQ003')
UNION ALL
SELECT
    'BIOQ004', 'LDL Colesterol', 'LDL',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'BIOQ'),
    '0202010430', true, 'AMBOS', 180, true, 20,
    'Jejum de 12 horas', 'POR_CAMPO', 18.00, 3.06, NOW()
WHERE NOT EXISTS (SELECT 1 FROM lab_exame WHERE codigo = 'BIOQ004')
UNION ALL
SELECT
    'BIOQ005', 'Triglicerídeos', 'Triglicerídeos',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'BIOQ'),
    '0202010562', true, 'AMBOS', 180, true, 20,
    'Jejum de 12 horas', 'POR_CAMPO', 18.00, 3.06, NOW()
WHERE NOT EXISTS (SELECT 1 FROM lab_exame WHERE codigo = 'BIOQ005')
UNION ALL
SELECT
    'BIOQ006', 'Ureia', 'Ureia',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'BIOQ'),
    '0202010570', true, 'AMBOS', 180, true, 20,
    'Jejum de 4 horas', 'POR_CAMPO', 15.00, 2.55, NOW()
WHERE NOT EXISTS (SELECT 1 FROM lab_exame WHERE codigo = 'BIOQ006')
UNION ALL
SELECT
    'BIOQ007', 'Creatinina', 'Creatinina',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'BIOQ'),
    '0202010325', true, 'AMBOS', 180, true, 20,
    'Jejum de 4 horas', 'POR_CAMPO', 15.00, 2.55, NOW()
WHERE NOT EXISTS (SELECT 1 FROM lab_exame WHERE codigo = 'BIOQ007');

-- Exames de Urina
INSERT INTO lab_exame (codigo, nome, nome_resumido, grupo_id, codigo_sigtap, ativo,
    sexo_permitido, dias_validade, permite_agendamento, tempo_realizacao_minutos,
    orientacoes_paciente, tipo_digitacao, valor_particular, valor_sus, created_at)
SELECT
    'URI001', 'Exame de Urina Tipo I (EAS)', 'EAS',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'URINA'),
    '0202010660', true, 'AMBOS', 90, true, 30,
    'Primeira urina da manhã. Higienizar a região genital antes da coleta.', 'POR_CAMPO', 20.00, 3.40, NOW()
WHERE NOT EXISTS (SELECT 1 FROM lab_exame WHERE codigo = 'URI001')
UNION ALL
SELECT
    'URI002', 'Urinocultura com Antibiograma', 'Urocultura',
    (SELECT id FROM lab_grupo_exame WHERE codigo = 'MICRO'),
    '0202070051', true, 'AMBOS', 30, true, 4320,
    'Primeira urina da manhã. Higienizar bem a região genital. Coletar jato médio.', 'MEMORANDO', 35.00, 7.48, NOW()
WHERE NOT EXISTS (SELECT 1 FROM lab_exame WHERE codigo = 'URI002');

-- Associar materiais aos exames
-- Hemograma - Sangue com EDTA
INSERT INTO lab_exame_material (exame_id, material_id, quantidade, obrigatorio, ordem)
SELECT
    (SELECT id FROM lab_exame WHERE codigo = 'HEM001'),
    (SELECT id FROM lab_material_exame WHERE codigo = 'SANGFL'),
    1, true, 1
WHERE NOT EXISTS (
    SELECT 1 FROM lab_exame_material lem
    WHERE lem.exame_id = (SELECT id FROM lab_exame WHERE codigo = 'HEM001')
    AND lem.material_id = (SELECT id FROM lab_material_exame WHERE codigo = 'SANGFL')
);

-- Glicemia - Sangue com soro
INSERT INTO lab_exame_material (exame_id, material_id, quantidade, obrigatorio, ordem)
SELECT
    (SELECT id FROM lab_exame WHERE codigo = 'BIOQ001'),
    (SELECT id FROM lab_material_exame WHERE codigo = 'SANG'),
    1, true, 1
WHERE NOT EXISTS (
    SELECT 1 FROM lab_exame_material lem
    WHERE lem.exame_id = (SELECT id FROM lab_exame WHERE codigo = 'BIOQ001')
    AND lem.material_id = (SELECT id FROM lab_material_exame WHERE codigo = 'SANG')
);

-- Colesterol Total - Sangue com soro
INSERT INTO lab_exame_material (exame_id, material_id, quantidade, obrigatorio, ordem)
SELECT
    (SELECT id FROM lab_exame WHERE codigo = 'BIOQ002'),
    (SELECT id FROM lab_material_exame WHERE codigo = 'SANG'),
    1, true, 1
WHERE NOT EXISTS (
    SELECT 1 FROM lab_exame_material lem
    WHERE lem.exame_id = (SELECT id FROM lab_exame WHERE codigo = 'BIOQ002')
    AND lem.material_id = (SELECT id FROM lab_material_exame WHERE codigo = 'SANG')
);

-- EAS - Urina
INSERT INTO lab_exame_material (exame_id, material_id, quantidade, obrigatorio, ordem)
SELECT
    (SELECT id FROM lab_exame WHERE codigo = 'URI001'),
    (SELECT id FROM lab_material_exame WHERE codigo = 'URINA'),
    1, true, 1
WHERE NOT EXISTS (
    SELECT 1 FROM lab_exame_material lem
    WHERE lem.exame_id = (SELECT id FROM lab_exame WHERE codigo = 'URI001')
    AND lem.material_id = (SELECT id FROM lab_material_exame WHERE codigo = 'URINA')
);

-- Urocultura - Urina
INSERT INTO lab_exame_material (exame_id, material_id, quantidade, obrigatorio, ordem)
SELECT
    (SELECT id FROM lab_exame WHERE codigo = 'URI002'),
    (SELECT id FROM lab_material_exame WHERE codigo = 'URINA'),
    1, true, 1
WHERE NOT EXISTS (
    SELECT 1 FROM lab_exame_material lem
    WHERE lem.exame_id = (SELECT id FROM lab_exame WHERE codigo = 'URI002')
    AND lem.material_id = (SELECT id FROM lab_material_exame WHERE codigo = 'URINA')
);

-- Motivos de Exame
INSERT INTO lab_motivo_exame (codigo, descricao, ativo, created_at) VALUES
('PREV', 'Prevenção', true, NOW()),
('DIAG', 'Diagnóstico', true, NOW()),
('ACOMP', 'Acompanhamento', true, NOW()),
('PREO', 'Pré-operatório', true, NOW()),
('URG', 'Urgência/Emergência', true, NOW())
ON CONFLICT (codigo) DO NOTHING;

-- Motivos de Nova Coleta
INSERT INTO lab_motivo_nova_coleta (codigo, descricao, ativo, created_at) VALUES
('INSUF', 'Amostra insuficiente', true, NOW()),
('HEMOL', 'Amostra hemolisada', true, NOW()),
('COAG', 'Amostra coagulada', true, NOW()),
('CONT', 'Amostra contaminada', true, NOW()),
('IDENT', 'Erro de identificação', true, NOW())
ON CONFLICT (codigo) DO NOTHING;