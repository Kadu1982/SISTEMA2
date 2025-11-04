-- ============================================================================
-- SCRIPT CORRIGIDO: Adicionar Módulo UPA ao teste.operador
-- ============================================================================
-- Usa a estrutura correta da tabela: operador_perfis (operador_id, perfil VARCHAR)
-- ============================================================================

DO $$
DECLARE
    v_operador_id BIGINT;
    v_perfil_tipo VARCHAR(255);
    v_perfil_id BIGINT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '      CONFIGURAÇÃO: teste.operador - Acesso ao Módulo UPA';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';

    -- ========================================================================
    -- ETAPA 1: BUSCAR OPERADOR
    -- ========================================================================
    RAISE NOTICE '📋 ETAPA 1: Buscando operador teste.operador...';

    SELECT id INTO v_operador_id
    FROM operador
    WHERE login = 'teste.operador'
    LIMIT 1;

    IF v_operador_id IS NULL THEN
        RAISE EXCEPTION '❌ ERRO: Operador teste.operador NÃO ENCONTRADO!';
    END IF;

    RAISE NOTICE '   ✅ Operador ENCONTRADO: ID=%', v_operador_id;

    -- ========================================================================
    -- ETAPA 2: VERIFICAR PERFIL ATUAL
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '📋 ETAPA 2: Verificando perfil atual...';

    SELECT perfil INTO v_perfil_tipo
    FROM operador_perfis
    WHERE operador_id = v_operador_id
    LIMIT 1;

    IF v_perfil_tipo IS NOT NULL THEN
        RAISE NOTICE '   ℹ️  Perfil atual (VARCHAR): %', v_perfil_tipo;

        -- Buscar ID do perfil correspondente
        SELECT id INTO v_perfil_id
        FROM perfis
        WHERE tipo = v_perfil_tipo
        LIMIT 1;

        IF v_perfil_id IS NOT NULL THEN
            RAISE NOTICE '   ✅ Perfil encontrado na tabela perfis: ID=%', v_perfil_id;
        ELSE
            RAISE NOTICE '   ⚠️  Perfil % não existe na tabela perfis, criando...', v_perfil_tipo;

            -- Criar perfil
            INSERT INTO perfis (tipo, nome, ativo, sistema_perfil, nome_customizado)
            VALUES (v_perfil_tipo, v_perfil_tipo, TRUE, FALSE, v_perfil_tipo)
            RETURNING id INTO v_perfil_id;

            RAISE NOTICE '   ✅ Perfil criado: ID=%', v_perfil_id;
        END IF;
    ELSE
        RAISE NOTICE '   ⚠️  Operador SEM PERFIL associado, criando ENFERMEIRO...';

        -- Criar perfil ENFERMEIRO
        INSERT INTO perfis (tipo, nome, ativo, sistema_perfil, nome_customizado)
        VALUES ('ENFERMEIRO', 'ENFERMEIRO', TRUE, FALSE, 'Enfermeiro(a)')
        ON CONFLICT DO NOTHING
        RETURNING id INTO v_perfil_id;

        IF v_perfil_id IS NULL THEN
            SELECT id INTO v_perfil_id FROM perfis WHERE tipo = 'ENFERMEIRO' LIMIT 1;
        END IF;

        -- Associar operador ao perfil
        INSERT INTO operador_perfis (operador_id, perfil)
        VALUES (v_operador_id, 'ENFERMEIRO');

        v_perfil_tipo := 'ENFERMEIRO';
        RAISE NOTICE '   ✅ Perfil ENFERMEIRO criado e associado';
    END IF;

    -- ========================================================================
    -- ETAPA 3: ADICIONAR MÓDULO UPA
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '📋 ETAPA 3: Adicionando módulo UPA ao perfil...';

    INSERT INTO perfil_acesso_modulos (perfil_id, modulo)
    VALUES (v_perfil_id, 'UPA')
    ON CONFLICT DO NOTHING;

    IF FOUND THEN
        RAISE NOTICE '   ✅ Módulo UPA ADICIONADO';
    ELSE
        RAISE NOTICE '   ℹ️  Módulo UPA já estava associado';
    END IF;

    -- ========================================================================
    -- ETAPA 4: ADICIONAR PERMISSÕES
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '📋 ETAPA 4: Adicionando permissões...';

    -- Limpar permissões antigas
    DELETE FROM perfil_acesso_permissoes WHERE perfil_id = v_perfil_id;

    -- Adicionar permissões
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
    ]);

    RAISE NOTICE '   ✅ Permissões ADICIONADAS';

    -- ========================================================================
    -- RESUMO
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '                    ✅ CONFIGURAÇÃO CONCLUÍDA!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Login: teste.operador';
    RAISE NOTICE 'Perfil: % (ID=%)', v_perfil_tipo, v_perfil_id;
    RAISE NOTICE 'Módulo: UPA';
    RAISE NOTICE 'Permissões: 10 adicionadas';
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';

END $$;

-- Verificação
SELECT
    o.login,
    o.nome,
    op.perfil AS perfil_string,
    STRING_AGG(DISTINCT pam.modulo, ', ') AS modulos
FROM operador o
LEFT JOIN operador_perfis op ON o.id = op.operador_id
LEFT JOIN perfis p ON op.perfil = p.tipo
LEFT JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
WHERE o.login = 'teste.operador'
GROUP BY o.login, o.nome, op.perfil;
