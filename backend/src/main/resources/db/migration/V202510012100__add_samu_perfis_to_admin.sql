-- ===========================================================
-- ADICIONAR PERFIS SAMU AOS OPERADORES ADMIN
-- ===========================================================

-- Adicionar perfis SAMU a todos os operadores com perfil ADMINISTRADOR_SISTEMA
INSERT INTO operador_perfis (operador_id, perfil)
SELECT DISTINCT op.operador_id, 'SAMU_OPERADOR'
FROM operador_perfis op
WHERE op.perfil = 'ADMINISTRADOR_SISTEMA'
  AND NOT EXISTS (
    SELECT 1 FROM operador_perfis op2
    WHERE op2.operador_id = op.operador_id
    AND op2.perfil = 'SAMU_OPERADOR'
  );

INSERT INTO operador_perfis (operador_id, perfil)
SELECT DISTINCT op.operador_id, 'SAMU_REGULADOR'
FROM operador_perfis op
WHERE op.perfil = 'ADMINISTRADOR_SISTEMA'
  AND NOT EXISTS (
    SELECT 1 FROM operador_perfis op2
    WHERE op2.operador_id = op.operador_id
    AND op2.perfil = 'SAMU_REGULADOR'
  );
