-- ============================================================================
-- SCRIPT: Adicionar Módulo UPA ao operador teste.operador (Ana Paula Branco)
-- ============================================================================
-- Este script assume que o operador JÁ EXISTE no banco
-- ============================================================================

DO $$
DECLARE
    v_operador_id BIGINT;
    v_perfil_id BIGINT;
    v_perfil_atual TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '      CONFIGURAÇÃO: teste.operador - Acesso ao Módulo UPA';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';

    -- ========================================================================
    -- ETAPA 1: BUSCAR OPERADOR EXISTENTE
    -- ========================================================================
    RAISE NOTICE '📋 ETAPA 1: Buscando operador teste.operador...';

    SELECT id INTO v_operador_id
    FROM operador
    WHERE login = 'teste.operador'
    LIMIT 1;

    IF v_operador_id IS NULL THEN
        RAISE EXCEPTION '❌ ERRO: Operador teste.operador NÃO ENCONTRADO no banco de dados!';
    END IF;

    RAISE NOTICE '   ✅ Operador ENCONTRADO: ID=%', v_operador_id;

    -- Mostrar dados do operador
    SELECT
        '   📄 Login: ' || login ||
        ' | Nome: ' || COALESCE(nome, 'N/A') ||
        ' | Ativo: ' || ativo::text
    INTO v_perfil_atual
    FROM operador
    WHERE id = v_operador_id;

    RAISE NOTICE '%', v_perfil_atual;

    -- ========================================================================
    -- ETAPA 2: VERIFICAR PERFIL ATUAL
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '📋 ETAPA 2: Verificando perfil atual do operador...';

    SELECT p.tipo INTO v_perfil_atual
    FROM operador_perfis op
    JOIN perfis p ON op.perfil_id = p.id
    WHERE op.operador_id = v_operador_id
    LIMIT 1;

    IF v_perfil_atual IS NOT NULL THEN
        RAISE NOTICE '   ℹ️  Perfil atual: %', v_perfil_atual;

        -- Buscar ID do perfil
        SELECT id INTO v_perfil_id
        FROM perfis
        WHERE tipo = v_perfil_atual
        LIMIT 1;
    ELSE
        RAISE NOTICE '   ⚠️  Operador SEM PERFIL associado';
        RAISE NOTICE '   ➤ Criando perfil ENFERMEIRO...';

        -- Criar perfil ENFERMEIRO se não existir
        INSERT INTO perfis (tipo, nome, ativo, sistema_perfil, nome_customizado)
        VALUES ('ENFERMEIRO', 'ENFERMEIRO', TRUE, FALSE, 'Enfermeiro(a)')
        ON CONFLICT DO NOTHING;

        SELECT id INTO v_perfil_id
        FROM perfis
        WHERE tipo = 'ENFERMEIRO'
        LIMIT 1;

        -- Associar operador ao perfil
        INSERT INTO operador_perfis (operador_id, perfil_id)
        VALUES (v_operador_id, v_perfil_id);

        RAISE NOTICE '   ✅ Perfil ENFERMEIRO associado ao operador';
    END IF;

    -- ========================================================================
    -- ETAPA 3: ADICIONAR MÓDULO UPA AO PERFIL
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '📋 ETAPA 3: Adicionando módulo UPA ao perfil...';

    INSERT INTO perfil_acesso_modulos (perfil_id, modulo)
    VALUES (v_perfil_id, 'UPA')
    ON CONFLICT DO NOTHING;

    -- Verificar se foi adicionado
    IF EXISTS (
        SELECT 1 FROM perfil_acesso_modulos
        WHERE perfil_id = v_perfil_id AND modulo = 'UPA'
    ) THEN
        RAISE NOTICE '   ✅ Módulo UPA ADICIONADO/CONFIRMADO no perfil';
    ELSE
        RAISE WARNING '   ⚠️  Não foi possível adicionar módulo UPA';
    END IF;

    -- ========================================================================
    -- ETAPA 4: ADICIONAR PERMISSÕES NECESSÁRIAS
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '📋 ETAPA 4: Adicionando permissões ao perfil...';

    INSERT INTO perfil_acesso_permissoes (perfil_id, permissao)
    SELECT v_perfil_id, unnest(ARRAY[
        'ENFERMAGEM_ATENDER',
        'MEDICO_ATENDER',
        'VISUALIZAR_RELATORIOS',
        'GERENCIAR_PACIENTES',
        'GERENCIAR_ATENDIMENTOS',
        'UPA_ACESSAR',
        'UPA_ATENDER',
        'UPA_VISUALIZAR',
        'TRIAGEM_REALIZAR',
        'CLASSIFICACAO_RISCO'
    ])
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '   ✅ Permissões ADICIONADAS ao perfil';

    -- ========================================================================
    -- RESUMO FINAL
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '                    ✅ CONFIGURAÇÃO CONCLUÍDA!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '👤 Operador:';
    RAISE NOTICE '   Login: teste.operador';
    RAISE NOTICE '   ID: %', v_operador_id;
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Perfil:';
    RAISE NOTICE '   Tipo: %', v_perfil_atual;
    RAISE NOTICE '   ID: %', v_perfil_id;
    RAISE NOTICE '';
    RAISE NOTICE '📦 Módulos:';
    RAISE NOTICE '   • UPA';
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';

END $$;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT
    'VERIFICACAO FINAL' as status,
    o.login,
    o.nome,
    o.ativo,
    p.tipo AS perfil,
    STRING_AGG(DISTINCT pam.modulo, ', ') AS modulos
FROM operador o
LEFT JOIN operador_perfis op ON o.id = op.operador_id
LEFT JOIN perfis p ON op.perfil_id = p.id
LEFT JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
WHERE o.login = 'teste.operador'
GROUP BY o.login, o.nome, o.ativo, p.tipo;
