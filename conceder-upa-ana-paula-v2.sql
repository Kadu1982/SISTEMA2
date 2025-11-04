-- ============================================================================
-- Script MELHORADO: Conceder Módulo UPA para Ana Paula Branco
-- ============================================================================
-- Este script cria/atualiza o perfil e módulo para que Ana Paula veja UPA no menu

DO $$
DECLARE
    v_operador_id BIGINT;
    v_perfil_id BIGINT;
    v_senha_hash TEXT := '$2b$10$6bDU05OeQ1rwYlMKJ7BufOuRXuQgxGJSSSWscn9UF6fVhPF/GSesG'; -- Teste@123
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'INICIANDO CONFIGURAÇÃO PARA ANA PAULA BRANCO';
    RAISE NOTICE '============================================================================';

    -- 1. BUSCAR OU CRIAR OPERADOR ANA PAULA
    SELECT id INTO v_operador_id
    FROM operador
    WHERE nome ILIKE '%Ana Paula%' OR login = 'operador.teste'
    LIMIT 1;

    IF v_operador_id IS NULL THEN
        -- Criar operador Ana Paula
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

        RAISE NOTICE '✅ Operador Ana Paula CRIADO: ID=%', v_operador_id;
    ELSE
        -- Atualizar senha e ativar
        UPDATE operador
        SET senha = v_senha_hash,
            ativo = TRUE
        WHERE id = v_operador_id;

        RAISE NOTICE '✅ Operador Ana Paula ENCONTRADO: ID=%', v_operador_id;
    END IF;

    -- 2. BUSCAR OU CRIAR PERFIL ENFERMEIRO
    SELECT id INTO v_perfil_id
    FROM perfis
    WHERE tipo = 'ENFERMEIRO'
    LIMIT 1;

    IF v_perfil_id IS NULL THEN
        -- Criar perfil ENFERMEIRO
        INSERT INTO perfis (tipo, nome, ativo, sistema_perfil, nome_customizado)
        VALUES ('ENFERMEIRO', 'ENFERMEIRO', TRUE, FALSE, 'Enfermeiro(a)')
        RETURNING id INTO v_perfil_id;

        RAISE NOTICE '✅ Perfil ENFERMEIRO CRIADO: ID=%', v_perfil_id;
    ELSE
        RAISE NOTICE '✅ Perfil ENFERMEIRO ENCONTRADO: ID=%', v_perfil_id;
    END IF;

    -- 3. ASSOCIAR OPERADOR AO PERFIL
    INSERT INTO operador_perfis (operador_id, perfil_id)
    SELECT v_operador_id, v_perfil_id
    WHERE NOT EXISTS (
        SELECT 1 FROM operador_perfis
        WHERE operador_id = v_operador_id
        AND perfil_id = v_perfil_id
    );

    RAISE NOTICE '✅ Operador associado ao perfil ENFERMEIRO';

    -- 4. ADICIONAR MÓDULO UPA AO PERFIL
    INSERT INTO perfil_acesso_modulos (perfil_id, modulo)
    SELECT v_perfil_id, 'UPA'
    WHERE NOT EXISTS (
        SELECT 1 FROM perfil_acesso_modulos
        WHERE perfil_id = v_perfil_id
        AND modulo = 'UPA'
    );

    RAISE NOTICE '✅ Módulo UPA adicionado ao perfil';

    -- 5. ADICIONAR PERMISSÕES BÁSICAS
    INSERT INTO perfil_acesso_permissoes (perfil_id, permissao)
    SELECT v_perfil_id, unnest(ARRAY[
        'ENFERMAGEM_ATENDER',
        'MEDICO_ATENDER',
        'VISUALIZAR_RELATORIOS',
        'GERENCIAR_PACIENTES',
        'GERENCIAR_ATENDIMENTOS'
    ])
    WHERE NOT EXISTS (
        SELECT 1 FROM perfil_acesso_permissoes pap
        WHERE pap.perfil_id = v_perfil_id
    );

    RAISE NOTICE '✅ Permissões básicas adicionadas';

    -- 6. RESUMO FINAL
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Login: operador.teste';
    RAISE NOTICE 'Senha: Teste@123';
    RAISE NOTICE 'Perfil: ENFERMEIRO (ID=%)' v_perfil_id;
    RAISE NOTICE 'Módulo: UPA';
    RAISE NOTICE '============================================================================';

END $$;

-- VERIFICAÇÃO FINAL
SELECT
    o.id AS operador_id,
    o.login,
    o.nome,
    o.ativo,
    p.id AS perfil_id,
    p.nome AS perfil_nome,
    p.tipo AS perfil_tipo,
    pam.modulo,
    array_agg(DISTINCT pap.permissao) AS permissoes
FROM operador o
LEFT JOIN operador_perfis op ON o.id = op.operador_id
LEFT JOIN perfis p ON op.perfil_id = p.id
LEFT JOIN perfil_acesso_modulos pam ON p.id = pam.perfil_id
LEFT JOIN perfil_acesso_permissoes pap ON p.id = pap.perfil_id
WHERE o.nome ILIKE '%Ana Paula%' OR o.login = 'operador.teste'
GROUP BY o.id, o.login, o.nome, o.ativo, p.id, p.nome, p.tipo, pam.modulo;
