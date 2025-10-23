-- =====================================================
-- SCRIPT DE VERIFICAÇÃO COMPLETA DO BANCO DE DADOS
-- Data: 05/10/2025 19:00
-- Objetivo: Verificar integridade e completude do banco
-- =====================================================

\echo '=========================================='
\echo 'VERIFICAÇÃO COMPLETA DO BANCO saude_db'
\echo '=========================================='
\echo ''

-- =====================================================
-- 1. INFORMAÇÕES GERAIS
-- =====================================================

\echo '1. INFORMAÇÕES GERAIS DO BANCO'
\echo '------------------------------------------'

SELECT
    current_database() as "Banco de Dados",
    current_user as "Usuário Conectado",
    version() as "Versão PostgreSQL",
    now() as "Data/Hora Verificação";

\echo ''

-- =====================================================
-- 2. HISTÓRICO FLYWAY
-- =====================================================

\echo '2. HISTÓRICO DE MIGRATIONS FLYWAY'
\echo '------------------------------------------'

SELECT
    installed_rank as "Rank",
    version as "Versão",
    description as "Descrição",
    type as "Tipo",
    script as "Script",
    installed_on as "Data Execução",
    execution_time as "Tempo (ms)",
    success as "Sucesso"
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 10;

\echo ''
\echo 'Total de migrations executadas:'
SELECT COUNT(*) as "Total Migrations" FROM flyway_schema_history WHERE success = true;

\echo ''
\echo 'Migrations com falha (se houver):'
SELECT
    version as "Versão",
    description as "Descrição",
    installed_on as "Data"
FROM flyway_schema_history
WHERE success = false
ORDER BY installed_rank;

\echo ''

-- =====================================================
-- 3. CONTAGEM DE TABELAS
-- =====================================================

\echo '3. CONTAGEM TOTAL DE TABELAS'
\echo '------------------------------------------'

SELECT COUNT(*) as "Total de Tabelas"
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

\echo ''

-- =====================================================
-- 4. VERIFICAÇÃO DE TABELAS CRÍTICAS
-- =====================================================

\echo '4. VERIFICAÇÃO DE TABELAS CRÍTICAS'
\echo '------------------------------------------'

WITH tabelas_criticas AS (
    SELECT unnest(ARRAY[
        'unidades_saude',
        'pacientes',
        'operador',
        'perfis',
        'agendamentos',
        'profissionais',
        'atendimentos',
        'classificacao_risco',
        'triagens',
        'horarios_exames',
        'cid',
        'especialidades',
        'prontuario_documento',
        'sadt',
        'procedimento_sadt'
    ]) as tabela_esperada
)
SELECT
    tc.tabela_esperada as "Tabela",
    CASE
        WHEN t.table_name IS NOT NULL THEN '✓ EXISTE'
        ELSE '✗ FALTANDO'
    END as "Status"
FROM tabelas_criticas tc
LEFT JOIN information_schema.tables t
    ON tc.tabela_esperada = t.table_name
    AND t.table_schema = 'public'
ORDER BY
    CASE WHEN t.table_name IS NOT NULL THEN 1 ELSE 0 END,
    tc.tabela_esperada;

\echo ''

-- =====================================================
-- 5. CONTAGEM DE REGISTROS EM TABELAS PRINCIPAIS
-- =====================================================

\echo '5. CONTAGEM DE REGISTROS EM TABELAS PRINCIPAIS'
\echo '------------------------------------------'

SELECT 'unidades_saude' as "Tabela", COUNT(*) as "Registros" FROM unidades_saude
UNION ALL
SELECT 'pacientes', COUNT(*) FROM pacientes
UNION ALL
SELECT 'operador', COUNT(*) FROM operador
UNION ALL
SELECT 'perfis', COUNT(*) FROM perfis
UNION ALL
SELECT 'agendamentos', COUNT(*) FROM agendamentos
UNION ALL
SELECT 'profissionais', COUNT(*) FROM profissionais
UNION ALL
SELECT 'atendimentos', COUNT(*) FROM atendimentos
UNION ALL
SELECT 'especialidades', COUNT(*) FROM especialidades
UNION ALL
SELECT 'cid', COUNT(*) FROM cid
ORDER BY "Tabela";

\echo ''

-- =====================================================
-- 6. VERIFICAÇÃO DE DADOS DE REFERÊNCIA
-- =====================================================

\echo '6. VERIFICAÇÃO DE DADOS DE REFERÊNCIA'
\echo '------------------------------------------'

\echo 'Perfis do sistema:'
SELECT id, nome, sistema_perfil, ativo
FROM perfis
WHERE sistema_perfil = TRUE
ORDER BY id;

\echo ''
\echo 'Especialidades cadastradas:'
SELECT COUNT(*) as "Total Especialidades" FROM especialidades WHERE ativo = TRUE;

\echo ''
\echo 'Status de agendamento:'
SELECT COUNT(*) as "Total Status" FROM status_agendamento WHERE ativo = TRUE;

\echo ''
\echo 'Tipos de consulta:'
SELECT COUNT(*) as "Total Tipos" FROM tipo_consulta WHERE ativo = TRUE;

\echo ''

-- =====================================================
-- 7. VERIFICAÇÃO DE FOREIGN KEYS CRÍTICAS
-- =====================================================

\echo '7. VERIFICAÇÃO DE FOREIGN KEYS CRÍTICAS'
\echo '------------------------------------------'

SELECT
    tc.table_name as "Tabela",
    kcu.column_name as "Coluna",
    ccu.table_name as "Referencia",
    ccu.column_name as "Coluna Ref"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('agendamentos', 'profissionais', 'atendimentos', 'triagens', 'classificacao_risco')
ORDER BY tc.table_name, kcu.column_name;

\echo ''

-- =====================================================
-- 8. VERIFICAÇÃO DE ÍNDICES
-- =====================================================

\echo '8. VERIFICAÇÃO DE ÍNDICES PRINCIPAIS'
\echo '------------------------------------------'

SELECT
    t.tablename as "Tabela",
    COUNT(*) as "Qtd Índices"
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('pacientes', 'agendamentos', 'profissionais', 'atendimentos')
GROUP BY t.tablename
ORDER BY t.tablename;

\echo ''

-- =====================================================
-- 9. VERIFICAÇÃO DE COLUNAS ESPERADAS
-- =====================================================

\echo '9. VERIFICAÇÃO DE COLUNAS EM TABELAS CRÍTICAS'
\echo '------------------------------------------'

\echo 'Colunas da tabela agendamentos:'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'agendamentos'
AND table_schema = 'public'
ORDER BY ordinal_position;

\echo ''
\echo 'Colunas da tabela profissionais:'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profissionais'
AND table_schema = 'public'
ORDER BY ordinal_position
LIMIT 10;

\echo ''
\echo 'Colunas da tabela classificacao_risco:'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'classificacao_risco'
AND table_schema = 'public'
ORDER BY ordinal_position
LIMIT 15;

\echo ''

-- =====================================================
-- 10. VERIFICAÇÃO DE POSSÍVEIS PROBLEMAS
-- =====================================================

\echo '10. VERIFICAÇÃO DE POSSÍVEIS PROBLEMAS'
\echo '------------------------------------------'

\echo 'Tabelas sem primary key:'
SELECT t.table_name as "Tabela Sem PK"
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints tc
    ON t.table_name = tc.table_name
    AND tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
AND tc.constraint_name IS NULL
AND t.table_name NOT LIKE 'flyway%';

\echo ''
\echo 'Foreign keys órfãs (referenciando tabelas inexistentes):'
SELECT DISTINCT
    tc.table_name as "Tabela",
    kcu.column_name as "Coluna FK",
    ccu.table_name as "Tabela Referenciada"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.tables t
    ON ccu.table_name = t.table_name
    AND t.table_schema = 'public'
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND t.table_name IS NULL;

\echo ''

-- =====================================================
-- 11. VERIFICAÇÃO DE CONSISTÊNCIA DE DADOS
-- =====================================================

\echo '11. VERIFICAÇÃO DE CONSISTÊNCIA DE DADOS'
\echo '------------------------------------------'

\echo 'Operador master existe?'
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM operador WHERE login = 'admin.master')
        THEN '✓ Operador master encontrado'
        ELSE '✗ Operador master NÃO encontrado'
    END as "Status Operador Master";

\echo ''
\echo 'Unidade de saúde padrão existe?'
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM unidades_saude WHERE id = 1)
        THEN '✓ Unidade padrão (ID=1) encontrada'
        ELSE '✗ Unidade padrão (ID=1) NÃO encontrada'
    END as "Status Unidade Padrão";

\echo ''

-- =====================================================
-- 12. RESUMO FINAL
-- =====================================================

\echo '=========================================='
\echo 'RESUMO FINAL DA VERIFICAÇÃO'
\echo '=========================================='

WITH verificacao AS (
    SELECT
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tabelas,
        (SELECT COUNT(*) FROM flyway_schema_history WHERE success = true) as migrations_sucesso,
        (SELECT COUNT(*) FROM flyway_schema_history WHERE success = false) as migrations_falha,
        (SELECT COUNT(*) FROM perfis) as total_perfis,
        (SELECT COUNT(*) FROM especialidades) as total_especialidades,
        (SELECT COUNT(*) FROM pacientes) as total_pacientes,
        (SELECT COUNT(*) FROM profissionais) as total_profissionais,
        (SELECT COUNT(*) FROM agendamentos) as total_agendamentos
)
SELECT
    '✓ Total de Tabelas: ' || total_tabelas as "Informação"
FROM verificacao
UNION ALL
SELECT '✓ Migrations Executadas com Sucesso: ' || migrations_sucesso FROM verificacao
UNION ALL
SELECT '✗ Migrations com Falha: ' || migrations_falha FROM verificacao
UNION ALL
SELECT '✓ Perfis Cadastrados: ' || total_perfis FROM verificacao
UNION ALL
SELECT '✓ Especialidades: ' || total_especialidades FROM verificacao
UNION ALL
SELECT '✓ Pacientes: ' || total_pacientes FROM verificacao
UNION ALL
SELECT '✓ Profissionais: ' || total_profissionais FROM verificacao
UNION ALL
SELECT '✓ Agendamentos: ' || total_agendamentos FROM verificacao;

\echo ''
\echo '=========================================='
\echo 'VERIFICAÇÃO CONCLUÍDA'
\echo '=========================================='
\echo ''
\echo 'Execute este script no PgAdmin com: \\i VERIFICACAO-COMPLETA.sql'
\echo 'Ou copie e cole no Query Tool do PgAdmin'
\echo ''

-- =====================================================
-- FIM DO SCRIPT DE VERIFICAÇÃO
-- =====================================================
