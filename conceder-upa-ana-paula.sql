-- ============================================================================
-- Script: Conceder Módulo UPA para Ana Paula Branco
-- ============================================================================

DO $$
DECLARE
    v_operador_id BIGINT;
    v_perfil_upa_id BIGINT;
    v_perfil_enfermeiro_id BIGINT;
BEGIN
    -- Buscar ID da Ana Paula
    SELECT id INTO v_operador_id
    FROM operador
    WHERE nome ILIKE '%Ana Paula%'
    LIMIT 1;

    IF v_operador_id IS NULL THEN
        RAISE EXCEPTION 'Operador Ana Paula não encontrado';
    END IF;

    RAISE NOTICE 'Operador Ana Paula encontrado: ID=%', v_operador_id;

    -- Buscar ou criar perfil UPA_ENFERMEIRO
    SELECT id INTO v_perfil_upa_id
    FROM perfis
    WHERE nome = 'UPA_ENFERMEIRO' OR tipo = 'ENFERMEIRO';

    IF v_perfil_upa_id IS NULL THEN
        -- Criar perfil ENFERMEIRO se não existir
        INSERT INTO perfis (tipo, nome, ativo, sistema_perfil)
        VALUES ('ENFERMEIRO', 'ENFERMEIRO', TRUE, FALSE)
        RETURNING id INTO v_perfil_enfermeiro_id;

        RAISE NOTICE 'Perfil ENFERMEIRO criado: ID=%', v_perfil_enfermeiro_id;
        v_perfil_upa_id := v_perfil_enfermeiro_id;
    END IF;

    -- Associar operador ao perfil (se ainda não estiver)
    INSERT INTO operador_perfis (operador_id, perfil_id)
    SELECT v_operador_id, v_perfil_upa_id
    WHERE NOT EXISTS (
        SELECT 1 FROM operador_perfis
        WHERE operador_id = v_operador_id
        AND perfil_id = v_perfil_upa_id
    );

    RAISE NOTICE 'Perfil associado ao operador';

    -- Adicionar módulo UPA ao perfil
    INSERT INTO perfil_acesso_modulos (perfil_id, modulo)
    SELECT v_perfil_upa_id, 'UPA'
    WHERE NOT EXISTS (
        SELECT 1 FROM perfil_acesso_modulos
        WHERE perfil_id = v_perfil_upa_id
        AND modulo = 'UPA'
    );

    RAISE NOTICE 'Módulo UPA adicionado ao perfil';

    -- Adicionar permissões básicas ao perfil
    INSERT INTO perfil_acesso_permissoes (perfil_id, permissao)
    SELECT v_perfil_upa_id, unnest(ARRAY['MEDICO_ATENDER', 'ENFERMAGEM_ATENDER', 'VISUALIZAR_RELATORIOS'])
    WHERE NOT EXISTS (
        SELECT 1 FROM perfil_acesso_permissoes
        WHERE perfil_id = v_perfil_upa_id
        AND permissao = ANY(ARRAY['MEDICO_ATENDER', 'ENFERMAGEM_ATENDER', 'VISUALIZAR_RELATORIOS'])
    );

    RAISE NOTICE 'Permissões básicas adicionadas';

    -- Verificar resultado final
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Configuração concluída!';
    RAISE NOTICE 'Operador: Ana Paula Branco (ID=%)' v_operador_id;
    RAISE NOTICE 'Perfil: ID=%', v_perfil_upa_id;
    RAISE NOTICE 'Módulo: UPA';
    RAISE NOTICE '====================================';

END $$;

-- Verificar se funcionou
SELECT
    o.nome AS operador,
    p.nome AS perfil,
    pam.modulo,
    pap.permissao
FROM operador o
JOIN operador_perfis op ON o.id = op.operador_id
JOIN perfis p ON op.perfil_id = p.id
LEFT JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
LEFT JOIN perfil_acesso_permissoes pap ON p.id = pap.perfil_id
WHERE o.nome ILIKE '%Ana Paula%';
