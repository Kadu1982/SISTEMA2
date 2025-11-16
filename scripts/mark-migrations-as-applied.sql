-- Script para marcar migrations problemáticas como aplicadas no Flyway
-- Execute este script diretamente no PostgreSQL da VPS:
-- docker exec -i saude_postgres psql -U postgres -d saude_db < scripts/mark-migrations-as-applied.sql
-- 
-- Isso permite que o backend inicie sem ter que corrigir cada migration individualmente
-- As migrations listadas já estão na baseline e não precisam ser executadas

DO $$
DECLARE
    next_rank INTEGER;
    migration_record RECORD;
BEGIN
    -- Obter o próximo installed_rank
    SELECT COALESCE(MAX(installed_rank), 0) + 1 INTO next_rank FROM flyway_schema_history;
    
    -- Lista de migrations problemáticas que já estão na baseline
    FOR migration_record IN
        SELECT * FROM (VALUES
            ('30', 'create laboratorio module', 'V30__create_laboratorio_module.sql'),
            ('31', 'insert laboratorio initial data', 'V31__insert_laboratorio_initial_data.sql'),
            ('33', 'fix perfis tipo field', 'V33__fix_perfis_tipo_field.sql'),
            ('35', 'corrigir perfis tipo invalidos', 'V35__corrigir_perfis_tipo_invalidos.sql'),
            ('20250125.0001', 'criar tabela triagens', 'V20250125_0001__criar_tabela_triagens.sql'),
            ('20250821.1700', 'profissionais', 'V20250821_1700__profissionais.sql'),
            ('20250827.1900', 'prontuario documentos', 'V20250827_1900__prontuario_documentos.sql'),
            ('20250907', 'operador restricoes json', 'V20250907__operador_restricoes_json.sql'),
            ('20250907.1', 'create audit evento', 'V20250907.1__create_audit_evento.sql'),
            ('20250908', 'ciap atendimento', 'V20250908__ciap_atendimento.sql')
        ) AS t(version, description, script)
    LOOP
        -- Verificar se a migration já existe
        IF NOT EXISTS (
            SELECT 1 FROM flyway_schema_history 
            WHERE version = migration_record.version
        ) THEN
            -- Inserir a migration como aplicada
            INSERT INTO flyway_schema_history (
                installed_rank,
                version,
                description,
                type,
                script,
                checksum,
                installed_by,
                installed_on,
                execution_time,
                success
            ) VALUES (
                next_rank,
                migration_record.version,
                migration_record.description,
                'SQL',
                migration_record.script,
                NULL,
                'postgres',
                NOW(),
                0,
                true
            );
            
            next_rank := next_rank + 1;
            
            RAISE NOTICE 'Migration % marcada como aplicada', migration_record.version;
        ELSE
            RAISE NOTICE 'Migration % já existe no histórico', migration_record.version;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Script concluído!';
END $$;

-- Verificar migrations marcadas
SELECT version, description, installed_on, success 
FROM flyway_schema_history 
WHERE version IN ('30', '31', '33', '35', '20250125.0001', '20250821.1700', '20250827.1900', '20250907', '20250907.1', '20250908')
ORDER BY installed_rank;

