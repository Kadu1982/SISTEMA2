-- ============================================================================
-- Migration: Adicionar alergias de teste para vários pacientes
-- Descrição: Adiciona alergias de teste para verificar a funcionalidade de exibição
-- Versão: V202511100002
-- Data: 2025-11-10
-- ============================================================================

-- Adicionar alergias de teste para vários pacientes da lista
-- Isso permite testar a funcionalidade com diferentes pacientes

-- Ana Paula Branco (ID 12196)
UPDATE pacientes 
SET alergias = 'PENICILINA, DIPIRONA, IBUPROFENO'
WHERE id = 12196 AND (alergias IS NULL OR alergias = '');

-- TIAGO LUIZ BENTO (ID 2074) - penúltimo da lista
UPDATE pacientes 
SET alergias = 'PARACETAMOL, ASPIRINA, SULFONAMIDAS'
WHERE id = 2074 AND (alergias IS NULL OR alergias = '');

-- VALENTINA BRANCO RODRIGUES (ID provável baseado na lista)
UPDATE pacientes 
SET alergias = 'AMOXICILINA, CEFALEXINA'
WHERE nome_completo ILIKE '%VALENTINA BRANCO RODRIGUES%' 
  AND (alergias IS NULL OR alergias = '');

-- MARIA FERNANDA ALVES CARDOSO
UPDATE pacientes 
SET alergias = 'DIPIRONA, IBUPROFENO'
WHERE nome_completo ILIKE '%MARIA FERNANDA ALVES CARDOSO%' 
  AND (alergias IS NULL OR alergias = '');

-- CAROLINE FIRMANO ROMERO
UPDATE pacientes 
SET alergias = 'PENICILINA, AMOXICILINA'
WHERE nome_completo ILIKE '%CAROLINE FIRMANO ROMERO%' 
  AND (alergias IS NULL OR alergias = '');

-- NICOLE FREITAS MARCIANO (primeiro da lista)
UPDATE pacientes 
SET alergias = 'DIPIRONA, PARACETAMOL, ASPIRINA'
WHERE nome_completo ILIKE '%NICOLE FREITAS MARCIANO%' 
  AND (alergias IS NULL OR alergias = '');

-- FELIPE VIEIRA SILVA (segundo da lista)
UPDATE pacientes 
SET alergias = 'PENICILINA, SULFONAMIDAS'
WHERE nome_completo ILIKE '%FELIPE VIEIRA SILVA%' 
  AND (alergias IS NULL OR alergias = '');

