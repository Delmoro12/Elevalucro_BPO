-- ======================================
-- Add Segmento Column to Companies Table
-- ======================================

-- Add segmento column if it doesn't exist
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS segmento VARCHAR(100);

-- Add comment
COMMENT ON COLUMN companies.segmento IS 'Segmento de mercado da empresa';

-- Log completion
DO $$ 
BEGIN 
  RAISE NOTICE 'Added segmento column to companies table';
END $$;