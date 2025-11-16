-- Script para marcar migrations problemáticas como aplicadas no Flyway
-- Execute este script diretamente no PostgreSQL da VPS
-- Isso permite que o backend inicie sem ter que corrigir cada migration individualmente

-- Lista de migrations que já estão na baseline e não precisam ser executadas
-- Estas migrations tentam criar/modificar tabelas que já existem na baseline

INSERT INTO flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success)
SELECT 
    COALESCE((SELECT MAX(installed_rank) FROM flyway_schema_history), 0) + ROW_NUMBER() OVER (ORDER BY version),
    version,
    description,
    'SQL',
    script,
    checksum,
    'postgres',
    NOW(),
    0,
    true
FROM (
    VALUES
    ('30', 'create laboratorio module', 'V30__create_laboratorio_module.sql', -1),
    ('31', 'insert laboratorio initial data', 'V31__insert_laboratorio_initial_data.sql', -1),
    ('33', 'fix perfis tipo field', 'V33__fix_perfis_tipo_field.sql', -1),
    ('35', 'corrigir perfis tipo invalidos', 'V35__corrigir_perfis_tipo_invalidos.sql', -1),
    ('20250125.0001', 'criar tabela triagens', 'V20250125_0001__criar_tabela_triagens.sql', -1),
    ('20250821.1700', 'profissionais', 'V20250821_1700__profissionais.sql', -1),
    ('20250827.1900', 'prontuario documentos', 'V20250827_1900__prontuario_documentos.sql', -1),
    ('20250907', 'operador restricoes json', 'V20250907__operador_restricoes_json.sql', -1)
) AS t(version, description, script, checksum)
WHERE NOT EXISTS (
    SELECT 1 FROM flyway_schema_history 
    WHERE flyway_schema_history.version = t.version
)
ON CONFLICT DO NOTHING;

-- Verificar quantas migrations foram marcadas
SELECT COUNT(*) as migrations_marcadas 
FROM flyway_schema_history 
WHERE version IN ('30', '31', '33', '35', '20250125.0001', '20250821.1700', '20250827.1900', '20250907');

