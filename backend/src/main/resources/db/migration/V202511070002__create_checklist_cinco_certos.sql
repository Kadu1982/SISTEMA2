-- ============================================================================
-- Migration: Criar tabela checklist_cinco_certos
-- Descrição: FASE 1 - Checklist dos 5 Certos para administração de medicamentos
--            Obrigatório conforme normas do COFEN
-- Versão: V202511070002
-- Data: 2025-11-07
-- ============================================================================

-- Criar tabela de checklist dos 5 certos
CREATE TABLE IF NOT EXISTS checklist_cinco_certos (
    id BIGSERIAL PRIMARY KEY,
    atividade_enfermagem_id BIGINT NOT NULL UNIQUE,
    
    -- Os 5 Certos
    paciente_certo BOOLEAN,
    medicamento_certo BOOLEAN,
    dose_certa BOOLEAN,
    via_certa BOOLEAN,
    horario_certo BOOLEAN,
    
    -- Auditoria
    data_validacao TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT fk_checklist_atividade
        FOREIGN KEY (atividade_enfermagem_id) 
        REFERENCES atividades_enfermagem (id) 
        ON DELETE CASCADE
);

-- Índice para busca por atividade
CREATE INDEX IF NOT EXISTS idx_checklist_atividade ON checklist_cinco_certos(atividade_enfermagem_id);

-- Índice para buscar checklists incompletos
CREATE INDEX IF NOT EXISTS idx_checklist_incompleto ON checklist_cinco_certos(
    paciente_certo, 
    medicamento_certo, 
    dose_certa, 
    via_certa, 
    horario_certo
) WHERE 
    paciente_certo IS NOT TRUE OR
    medicamento_certo IS NOT TRUE OR
    dose_certa IS NOT TRUE OR
    via_certa IS NOT TRUE OR
    horario_certo IS NOT TRUE;

-- Comentários
COMMENT ON TABLE checklist_cinco_certos IS 'Checklist dos 5 Certos para administração segura de medicamentos (COFEN)';
COMMENT ON COLUMN checklist_cinco_certos.paciente_certo IS '1º Certo: Validação de que é o paciente correto';
COMMENT ON COLUMN checklist_cinco_certos.medicamento_certo IS '2º Certo: Validação de que é o medicamento correto';
COMMENT ON COLUMN checklist_cinco_certos.dose_certa IS '3º Certo: Validação de que é a dose correta';
COMMENT ON COLUMN checklist_cinco_certos.via_certa IS '4º Certo: Validação de que é a via correta';
COMMENT ON COLUMN checklist_cinco_certos.horario_certo IS '5º Certo: Validação de que é o horário correto';
COMMENT ON COLUMN checklist_cinco_certos.data_validacao IS 'Timestamp da validação do checklist';

-- ============================================================================
-- Fim da migration
-- ============================================================================

