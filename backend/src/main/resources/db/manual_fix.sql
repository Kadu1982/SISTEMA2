-- Manual fix for missing pdf_base64 column in sadt table
-- Execute this script directly in your PostgreSQL database if you're having issues with Flyway migrations

-- Check if the column already exists to avoid errors
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'sadt' AND column_name = 'pdf_base64'
    ) THEN
        -- Add the missing column
        EXECUTE 'ALTER TABLE sadt ADD COLUMN pdf_base64 TEXT';
        RAISE NOTICE 'Column pdf_base64 added to sadt table successfully';
    ELSE
        RAISE NOTICE 'Column pdf_base64 already exists in sadt table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sadt' AND column_name = 'pdf_base64';