-- Add pdf_base64 column to sadt table
ALTER TABLE sadt ADD COLUMN pdf_base64 TEXT;

-- Note: This script needs to be executed manually since Flyway is disabled in the development environment.
-- You can execute this script using a database client like pgAdmin or DBeaver.
-- Alternatively, you can enable Flyway by setting spring.flyway.enabled=true in application-dev.properties
-- and placing this script in the db/migration directory with a proper version number (e.g., V1__add_pdf_base64_column_to_sadt.sql).