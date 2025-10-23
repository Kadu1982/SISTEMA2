# Database Migration Instructions

## Issue: Missing `pdf_base64` Column in `sadt` Table

The application is encountering the following error:

```
JDBC exception executing SQL [select s1_0."id",s1_0."agendamento_id",s1_0."created_at",s1_0."data_emissao",s1_0."estabelecimento_cnes",s1_0."estabelecimento_endereco",s1_0."estabelecimento_municipio",s1_0."estabelecimento_nome",s1_0."estabelecimento_telefone",s1_0."estabelecimento_uf",s1_0."numero_sadt",s1_0."observacoes",s1_0."operador",s1_0."paciente_id",s1_0."pdf_base64",s1_0."solicitante_cbo",s1_0."solicitante_conselho",s1_0."solicitante_nome",s1_0."solicitante_numero_conselho",s1_0."status",s1_0."tipo_sadt",s1_0."updated_at",s1_0."urgente"] [ERRO: coluna s1_0.pdf_base64 não existe\n  Posição: 330]
```

This error occurs because the `pdf_base64` column is defined in the `Sadt` entity class but doesn't exist in the database table.

## Solution

There are two ways to fix this issue:

### Option 1: Manual SQL Execution

You can use the provided `manual_fix.sql` script which safely adds the column if it doesn't exist:

1. Open your database client (pgAdmin or DBeaver)
2. Connect to your PostgreSQL database
3. Execute the `manual_fix.sql` script located in the `db` directory

Alternatively, you can simply run this SQL command:

```sql
ALTER TABLE sadt ADD COLUMN pdf_base64 TEXT;
```

### Option 2: Use Flyway Migration

The project already has a Flyway migration script set up to add this column:

1. Ensure Flyway is enabled in `application-dev.properties`:
   ```properties
   spring.flyway.enabled=true
   ```

2. Restart the application to apply the migration automatically.

## Verification

After applying either solution, you can verify that the column was added successfully by:

1. Connecting to the database and running:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'sadt' AND column_name = 'pdf_base64';
   ```

2. Restarting the application and confirming that the error no longer occurs.

## Troubleshooting

If the error persists after applying the solutions above:

1. Check if the migration was applied by querying the Flyway schema history table:
   ```sql
   SELECT * FROM flyway_schema_history;
   ```

2. If the migration is not listed, there might be an issue with the Flyway configuration. Try manually executing the SQL command as described in Option 1.

3. If you're still experiencing issues, you may need to check for any database connection issues or permission problems.
