-- ======================================
-- Add Missing Columns to Companies Table
-- ======================================

-- Add email column if it doesn't exist
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add phone column if it doesn't exist  
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add comments
COMMENT ON COLUMN companies.email IS 'Email principal da empresa';
COMMENT ON COLUMN companies.phone IS 'Telefone principal da empresa';

-- Update existing companies with placeholder data if needed
UPDATE companies 
SET 
  email = COALESCE(email, 'contato@' || slug || '.com.br'),
  phone = COALESCE(phone, '11999999999')
WHERE email IS NULL OR phone IS NULL;

-- Log completion
DO $$ 
BEGIN 
  RAISE NOTICE 'Added missing columns (email, phone) to companies table';
END $$;