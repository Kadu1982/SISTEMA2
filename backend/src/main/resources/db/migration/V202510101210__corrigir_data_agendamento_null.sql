-- ============================================================================
-- Migration: Corrigir agendamentos com data_agendamento NULL
-- Data: 10/10/2025
-- Descrição: Corrige registros existentes e adiciona constraint para prevenir
--            que data_agendamento fique NULL no futuro
-- ============================================================================

-- Passo 1: Corrigir registros existentes com data_agendamento NULL
-- Copia o valor de data_hora para data_agendamento
UPDATE agendamentos 
SET data_agendamento = COALESCE(data_hora, CURRENT_TIMESTAMP) 
WHERE data_agendamento IS NULL;

-- Passo 2: Garantir que data_agendamento não aceite NULL (se ainda não estiver configurado)
-- Esta constraint previne que novos registros sejam criados sem data_agendamento
ALTER TABLE agendamentos 
ALTER COLUMN data_agendamento SET NOT NULL;

-- Passo 3: Criar trigger para garantir que data_agendamento seja sempre preenchido
-- Se não for informado, copia automaticamente de data_hora
CREATE OR REPLACE FUNCTION fn_validar_data_agendamento()
RETURNS TRIGGER AS $$
BEGIN
    -- Se data_agendamento for NULL, copia de data_hora
    IF NEW.data_agendamento IS NULL THEN
        NEW.data_agendamento := COALESCE(NEW.data_hora, CURRENT_TIMESTAMP);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger que executa antes de INSERT ou UPDATE
DROP TRIGGER IF EXISTS trg_validar_data_agendamento ON agendamentos;
CREATE TRIGGER trg_validar_data_agendamento
    BEFORE INSERT OR UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION fn_validar_data_agendamento();

-- Log de conclusão
DO $$
BEGIN
    RAISE NOTICE '✅ Migration concluída: data_agendamento corrigido e protegido contra NULL';
END $$;

