-- ============================================================================
-- CORREÇÃO: Criar perfis faltantes e associar unidade de saúde
-- ============================================================================

DO $$
DECLARE
    v_operador_id BIGINT := 9;
    v_perfil_upa_id BIGINT;
    v_unidade_id BIGINT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '      CORREÇÃO: Criar perfis faltantes para teste.operador';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';

    -- ========================================================================
    -- ETAPA 1: CRIAR PERFIL "UPA" NA TABELA perfis
    -- ========================================================================
    RAISE NOTICE '📋 ETAPA 1: Criando perfil UPA na tabela perfis...';

    INSERT INTO perfis (tipo, nome, ativo, sistema_perfil, nome_customizado)
    VALUES ('UPA', 'UPA', TRUE, FALSE, 'Operador UPA')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_perfil_upa_id;

    IF v_perfil_upa_id IS NULL THEN
        SELECT id INTO v_perfil_upa_id FROM perfis WHERE tipo = 'UPA';
        RAISE NOTICE '   ℹ️  Perfil UPA já existia: ID=%', v_perfil_upa_id;
    ELSE
        RAISE NOTICE '   ✅ Perfil UPA criado: ID=%', v_perfil_upa_id;
    END IF;

    -- ========================================================================
    -- ETAPA 2: ADICIONAR MÓDULO UPA AO PERFIL UPA
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '📋 ETAPA 2: Adicionando módulo UPA ao perfil UPA...';

    INSERT INTO perfil_acesso_modulos (perfil_id, modulo)
    VALUES (v_perfil_upa_id, 'UPA')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '   ✅ Módulo UPA adicionado ao perfil UPA';

    -- ========================================================================
    -- ETAPA 3: ADICIONAR PERMISSÕES AO PERFIL UPA
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '📋 ETAPA 3: Adicionando permissões ao perfil UPA...';

    INSERT INTO perfil_acesso_permissoes (perfil_id, permissao)
    SELECT v_perfil_upa_id, unnest(ARRAY[
        'UPA_ACESSAR',
        'UPA_ATENDER',
        'UPA_VISUALIZAR',
        'TRIAGEM_REALIZAR',
        'CLASSIFICACAO_RISCO',
        'GERENCIAR_PACIENTES',
        'GERENCIAR_ATENDIMENTOS',
        'VISUALIZAR_RELATORIOS',
        'ENFERMAGEM_ATENDER',
        'MEDICO_ATENDER'
    ])
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '   ✅ Permissões adicionadas ao perfil UPA';

    -- ========================================================================
    -- ETAPA 4: CRIAR OUTROS PERFIS FALTANTES
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '📋 ETAPA 4: Criando outros perfis faltantes...';

    -- Dentista
    INSERT INTO perfis (tipo, nome, ativo, sistema_perfil, nome_customizado)
    VALUES ('Dentista', 'Dentista', TRUE, FALSE, 'Dentista')
    ON CONFLICT DO NOTHING;

    -- Médico ESF
    INSERT INTO perfis (tipo, nome, ativo, sistema_perfil, nome_customizado)
    VALUES ('Médico ESF', 'Médico ESF', TRUE, FALSE, 'Médico ESF')
    ON CONFLICT DO NOTHING;

    -- Médico UPA
    INSERT INTO perfis (tipo, nome, ativo, sistema_perfil, nome_customizado)
    VALUES ('Médico UPA', 'Médico UPA', TRUE, FALSE, 'Médico UPA')
    ON CONFLICT DO NOTHING;

    -- Adicionar módulo UPA ao Médico UPA
    INSERT INTO perfil_acesso_modulos (perfil_id, modulo)
    SELECT id, 'UPA'
    FROM perfis
    WHERE tipo = 'Médico UPA'
    ON CONFLICT DO NOTHING;

    -- Recepcionista UPA
    INSERT INTO perfis (tipo, nome, ativo, sistema_perfil, nome_customizado)
    VALUES ('Recepcionista UPA', 'Recepcionista UPA', TRUE, FALSE, 'Recepcionista UPA')
    ON CONFLICT DO NOTHING;

    -- Adicionar módulo UPA ao Recepcionista UPA
    INSERT INTO perfil_acesso_modulos (perfil_id, modulo)
    SELECT id, 'UPA'
    FROM perfis
    WHERE tipo = 'Recepcionista UPA'
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '   ✅ Todos os perfis criados';

    -- ========================================================================
    -- RESUMO
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '                    ✅ CORREÇÃO CONCLUÍDA!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Perfil UPA criado: ID=%', v_perfil_upa_id;
    RAISE NOTICE 'Módulos e permissões configurados';
    RAISE NOTICE 'Outros perfis criados: Dentista, Médico ESF, Médico UPA, Recepcionista UPA';
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';

END $$;

-- VERIFICAÇÃO FINAL
SELECT
    'VERIFICACAO FINAL' as status;

SELECT
    op.perfil AS perfil_varchar,
    p.id AS perfil_id,
    p.ativo,
    STRING_AGG(DISTINCT pam.modulo, ', ') AS modulos
FROM operador_perfis op
LEFT JOIN perfis p ON op.perfil = p.tipo
LEFT JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
WHERE op.operador_id = 9
GROUP BY op.perfil, p.id, p.ativo
ORDER BY op.perfil;
