-- ============================================================================
-- SCRIPT COMPLETO: Configurar Ana Paula Branco (operador.teste) com Módulo UPA
-- ============================================================================
-- Este script:
-- 1. Busca ou cria o operador operador.teste (Ana Paula Branco)
-- 2. Atualiza senha para Teste@123
-- 3. Busca ou cria perfil ENFERMEIRO
-- 4. Associa operador ao perfil ENFERMEIRO
-- 5. Adiciona módulo UPA ao perfil ENFERMEIRO
-- 6. Adiciona permissões necessárias
-- 7. Associa à uma unidade de saúde UPA (se disponível)
-- ============================================================================

DO $$
DECLARE
    v_operador_id BIGINT;
    v_perfil_id BIGINT;
    v_unidade_upa_id BIGINT;
    v_senha_hash TEXT := '$2b$10$6bDU05OeQ1rwYlMKJ7BufOuRXuQgxGJSSSWscn9UF6fVhPF/GSesG'; -- Teste@123
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '          CONFIGURAÇÃO: Ana Paula Branco - Módulo UPA';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';

    -- ========================================================================
    -- ETAPA 1: BUSCAR OU CRIAR OPERADOR
    -- ========================================================================
    RAISE NOTICE '📋 ETAPA 1: Verificando operador Ana Paula Branco...';

    SELECT id INTO v_operador_id
    FROM operador
    WHERE login = 'operador.teste' OR nome ILIKE '%Ana Paula%'
    LIMIT 1;

    IF v_operador_id IS NULL THEN
        -- Criar operador Ana Paula
        RAISE NOTICE '   ➤ Operador não encontrado, criando novo...';

        INSERT INTO operador (
            login,
            senha,
            nome,
            cargo,
            cpf,
            ativo,
            is_master,
            data_criacao,
            criado_por
        ) VALUES (
            'operador.teste',
            v_senha_hash,
            'Ana Paula Branco',
            'Enfermeira UPA',
            '11111111111',
            TRUE,
            FALSE,
            NOW(),
            'sistema'
        )
        RETURNING id INTO v_operador_id;

        RAISE NOTICE '   ✅ Operador CRIADO com sucesso! ID=%', v_operador_id;
    ELSE
        -- Atualizar senha e ativar operador existente
        RAISE NOTICE '   ➤ Operador ENCONTRADO: ID=%', v_operador_id;
        RAISE NOTICE '   ➤ Atualizando senha e ativando...';

        UPDATE operador
        SET senha = v_senha_hash,
            ativo = TRUE,
            login = 'operador.teste'
        WHERE id = v_operador_id;

        RAISE NOTICE '   ✅ Operador ATUALIZADO com sucesso!';
    END IF;

    -- ========================================================================
    -- ETAPA 2: BUSCAR OU CRIAR PERFIL ENFERMEIRO
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '📋 ETAPA 2: Verificando perfil ENFERMEIRO...';

    SELECT id INTO v_perfil_id
    FROM perfis
    WHERE tipo = 'ENFERMEIRO'
    LIMIT 1;

    IF v_perfil_id IS NULL THEN
        -- Criar perfil ENFERMEIRO
        RAISE NOTICE '   ➤ Perfil não encontrado, criando novo...';

        INSERT INTO perfis (tipo, nome, ativo, sistema_perfil, nome_customizado)
        VALUES ('ENFERMEIRO', 'ENFERMEIRO', TRUE, FALSE, 'Enfermeiro(a)')
        RETURNING id INTO v_perfil_id;

        RAISE NOTICE '   ✅ Perfil CRIADO com sucesso! ID=%', v_perfil_id;
    ELSE
        RAISE NOTICE '   ✅ Perfil ENCONTRADO: ID=%', v_perfil_id;
    END IF;

    -- ========================================================================
    -- ETAPA 3: ASSOCIAR OPERADOR AO PERFIL
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '📋 ETAPA 3: Associando operador ao perfil ENFERMEIRO...';

    -- Limpar associações antigas
    DELETE FROM operador_perfis WHERE operador_id = v_operador_id;
    RAISE NOTICE '   ➤ Associações antigas removidas';

    -- Criar nova associação
    INSERT INTO operador_perfis (operador_id, perfil_id)
    VALUES (v_operador_id, v_perfil_id);

    RAISE NOTICE '   ✅ Operador associado ao perfil ENFERMEIRO!';

    -- ========================================================================
    -- ETAPA 4: ADICIONAR MÓDULO UPA AO PERFIL
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '📋 ETAPA 4: Adicionando módulo UPA ao perfil ENFERMEIRO...';

    INSERT INTO perfil_acesso_modulos (perfil_id, modulo)
    SELECT v_perfil_id, 'UPA'
    WHERE NOT EXISTS (
        SELECT 1 FROM perfil_acesso_modulos
        WHERE perfil_id = v_perfil_id
        AND modulo = 'UPA'
    );

    IF FOUND THEN
        RAISE NOTICE '   ✅ Módulo UPA ADICIONADO ao perfil!';
    ELSE
        RAISE NOTICE '   ℹ️  Módulo UPA já estava associado ao perfil';
    END IF;

    -- ========================================================================
    -- ETAPA 5: ADICIONAR PERMISSÕES NECESSÁRIAS
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '📋 ETAPA 5: Adicionando permissões ao perfil...';

    -- Limpar permissões antigas
    DELETE FROM perfil_acesso_permissoes WHERE perfil_id = v_perfil_id;
    RAISE NOTICE '   ➤ Permissões antigas removidas';

    -- Adicionar permissões necessárias
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

    RAISE NOTICE '   ✅ Permissões ADICIONADAS com sucesso!';

    -- ========================================================================
    -- ETAPA 6: ASSOCIAR À UNIDADE DE SAÚDE UPA (se existir)
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '📋 ETAPA 6: Verificando unidade de saúde UPA...';

    SELECT id INTO v_unidade_upa_id
    FROM unidade_saude
    WHERE tipo = 'UPA' OR nome ILIKE '%UPA%'
    LIMIT 1;

    IF v_unidade_upa_id IS NOT NULL THEN
        UPDATE operador
        SET unidade_saude_id = v_unidade_upa_id
        WHERE id = v_operador_id;

        RAISE NOTICE '   ✅ Operador associado à unidade UPA: ID=%', v_unidade_upa_id;
    ELSE
        RAISE NOTICE '   ⚠️  Nenhuma unidade UPA encontrada no sistema';
    END IF;

    -- ========================================================================
    -- RESUMO FINAL
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '                    ✅ CONFIGURAÇÃO CONCLUÍDA!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Credenciais:';
    RAISE NOTICE '   Login: operador.teste';
    RAISE NOTICE '   Senha: Teste@123';
    RAISE NOTICE '';
    RAISE NOTICE '👤 Operador:';
    RAISE NOTICE '   ID: %', v_operador_id;
    RAISE NOTICE '   Nome: Ana Paula Branco';
    RAISE NOTICE '   Cargo: Enfermeira UPA';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Perfil:';
    RAISE NOTICE '   Tipo: ENFERMEIRO';
    RAISE NOTICE '   ID: %', v_perfil_id;
    RAISE NOTICE '';
    RAISE NOTICE '📦 Módulos:';
    RAISE NOTICE '   • UPA';
    RAISE NOTICE '';
    RAISE NOTICE '⚙️  Permissões:';
    RAISE NOTICE '   • ENFERMAGEM_ATENDER';
    RAISE NOTICE '   • MEDICO_ATENDER';
    RAISE NOTICE '   • VISUALIZAR_RELATORIOS';
    RAISE NOTICE '   • GERENCIAR_PACIENTES';
    RAISE NOTICE '   • GERENCIAR_ATENDIMENTOS';
    RAISE NOTICE '   • UPA_ACESSAR';
    RAISE NOTICE '   • UPA_ATENDER';
    RAISE NOTICE '   • UPA_VISUALIZAR';
    RAISE NOTICE '   • TRIAGEM_REALIZAR';
    RAISE NOTICE '   • CLASSIFICACAO_RISCO';
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';

END $$;

-- ============================================================================
-- VERIFICAÇÃO FINAL: Mostrar configuração completa
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo '                    VERIFICAÇÃO DOS DADOS'
\echo '============================================================================'
\echo ''

SELECT
    o.id AS operador_id,
    o.login,
    o.nome,
    o.cargo,
    o.ativo,
    o.unidade_saude_id,
    us.nome AS unidade_nome,
    p.id AS perfil_id,
    p.tipo AS perfil_tipo,
    p.nome AS perfil_nome
FROM operador o
LEFT JOIN unidade_saude us ON o.unidade_saude_id = us.id
LEFT JOIN operador_perfis op ON o.id = op.operador_id
LEFT JOIN perfis p ON op.perfil_id = p.id
WHERE o.login = 'operador.teste';

\echo ''
\echo 'MÓDULOS DISPONÍVEIS:'
SELECT pam.modulo
FROM operador o
JOIN operador_perfis op ON o.id = op.operador_id
JOIN perfis p ON op.perfil_id = p.id
JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
WHERE o.login = 'operador.teste';

\echo ''
\echo 'PERMISSÕES DISPONÍVEIS:'
SELECT pap.permissao
FROM operador o
JOIN operador_perfis op ON o.id = op.operador_id
JOIN perfis p ON op.perfil_id = p.id
JOIN perfil_acesso_permissoes pap ON p.id = pap.perfil_id
WHERE o.login = 'operador.teste'
ORDER BY pap.permissao;
