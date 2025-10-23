-- =====================================================
-- ADICIONAR COLUNAS FALTANTES NA TABELA AGENDAMENTOS
-- Data: 05/10/2025 21:00
-- Descrição: Adiciona colunas que existem na entidade mas não no banco
-- =====================================================

-- Adicionar comprovante_pdf_base64 (usado pela entidade Agendamento)
ALTER TABLE agendamentos
ADD COLUMN IF NOT EXISTS comprovante_pdf_base64 TEXT;

-- Adicionar outras colunas que podem estar faltando
ALTER TABLE agendamentos
ADD COLUMN IF NOT EXISTS triagem_id BIGINT;

ALTER TABLE agendamentos
ADD COLUMN IF NOT EXISTS data_hora TIMESTAMP;

ALTER TABLE agendamentos
ADD COLUMN IF NOT EXISTS especialidade VARCHAR(100);

ALTER TABLE agendamentos
ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT;

ALTER TABLE agendamentos
ADD COLUMN IF NOT EXISTS data_cancelamento TIMESTAMP;

ALTER TABLE agendamentos
ADD COLUMN IF NOT EXISTS operador_cancelamento_id BIGINT;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_agendamentos_triagem ON agendamentos(triagem_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora ON agendamentos(data_hora);

-- Adicionar foreign key para triagem se a tabela existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'triagens'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_agendamento_triagem'
        ) THEN
            ALTER TABLE agendamentos
            ADD CONSTRAINT fk_agendamento_triagem
            FOREIGN KEY (triagem_id) REFERENCES triagens(id);
        END IF;
    END IF;
END $$;

-- Comentários
COMMENT ON COLUMN agendamentos.comprovante_pdf_base64 IS 'Comprovante de agendamento em PDF codificado em base64';
COMMENT ON COLUMN agendamentos.triagem_id IS 'Referência para a triagem associada ao agendamento';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
