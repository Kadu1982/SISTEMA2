-- ============================================================================
-- Migration: Criar tabela para vincular módulos a unidades específicas
-- Descrição: Permite configurar em quais unidades cada módulo deve aparecer
--            Se um módulo não tiver unidades vinculadas, aparece em todas
-- Versão: V202511100006
-- Data: 2025-11-10
-- ============================================================================

-- Tabela para vincular módulos a unidades específicas
CREATE TABLE IF NOT EXISTS operador_modulo_unidade (
    operador_id BIGINT NOT NULL,
    modulo VARCHAR(100) NOT NULL,
    unidade_id BIGINT NOT NULL,
    PRIMARY KEY (operador_id, modulo, unidade_id),
    CONSTRAINT fk_modulo_unidade_operador FOREIGN KEY (operador_id) REFERENCES operador(id) ON DELETE CASCADE,
    CONSTRAINT fk_modulo_unidade_unidade FOREIGN KEY (unidade_id) REFERENCES unidades_saude(id) ON DELETE CASCADE
);

-- Índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_modulo_unidade_operador ON operador_modulo_unidade(operador_id);
CREATE INDEX IF NOT EXISTS idx_modulo_unidade_modulo ON operador_modulo_unidade(operador_id, modulo);

COMMENT ON TABLE operador_modulo_unidade IS 'Vincula módulos do operador a unidades específicas. Se um módulo não tiver unidades vinculadas, aparece em todas as unidades do operador.';

