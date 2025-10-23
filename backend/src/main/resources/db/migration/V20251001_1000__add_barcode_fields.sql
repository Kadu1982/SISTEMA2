-- Adiciona campos de código de barras para Agendamento, SADT e RecepcaoExame

-- Agendamentos
ALTER TABLE agendamentos
ADD COLUMN IF NOT EXISTS codigo_barras VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS codigo_barras_imagem BYTEA;

CREATE INDEX IF NOT EXISTS idx_agendamentos_codigo_barras ON agendamentos(codigo_barras);

-- SADT
ALTER TABLE sadt
ADD COLUMN IF NOT EXISTS codigo_barras VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS codigo_barras_imagem BYTEA;

CREATE INDEX IF NOT EXISTS idx_sadt_codigo_barras ON sadt(codigo_barras);

-- RecepcaoExame (já tem codigo_barras, apenas garantir que existe o índice)
CREATE INDEX IF NOT EXISTS idx_lab_recepcao_exame_codigo_barras ON lab_recepcao_exame(codigo_barras);

-- Comentários
COMMENT ON COLUMN agendamentos.codigo_barras IS 'Código de barras único do agendamento para leitura rápida';
COMMENT ON COLUMN agendamentos.codigo_barras_imagem IS 'Imagem PNG do código de barras';
COMMENT ON COLUMN sadt.codigo_barras IS 'Código de barras único do SADT para leitura rápida';
COMMENT ON COLUMN sadt.codigo_barras_imagem IS 'Imagem PNG do código de barras';
