-- ============================================================================
-- Adicionar perfil UPA ao operador teste.operador
-- ============================================================================
-- O menu verifica se o operador tem um perfil com código "UPA"
-- ============================================================================

DO $$
DECLARE
    v_operador_id BIGINT := 9; -- ID do teste.operador
BEGIN
    RAISE NOTICE 'Adicionando perfil UPA ao operador teste.operador...';

    -- Adicionar perfil UPA ao operador (na coluna perfil VARCHAR)
    INSERT INTO operador_perfis (operador_id, perfil)
    VALUES (v_operador_id, 'UPA')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Perfil UPA adicionado!';

END $$;

-- Verificar
SELECT
    o.login,
    o.nome,
    op.perfil
FROM operador o
JOIN operador_perfis op ON o.id = op.operador_id
WHERE o.login = 'teste.operador'
ORDER BY op.perfil;
