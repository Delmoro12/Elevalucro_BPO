-- ======================================
-- Add All Missing Columns to Users Table
-- ======================================

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_level VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ;

-- Add check constraint for verification_level
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_verification_level_check'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_verification_level_check 
    CHECK (verification_level IN ('none', 'email', 'phone', 'document', 'full'));
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN users.first_name IS 'Primeiro nome do usuário';
COMMENT ON COLUMN users.last_name IS 'Sobrenome do usuário';
COMMENT ON COLUMN users.whatsapp IS 'Número do WhatsApp';
COMMENT ON COLUMN users.is_verified IS 'Verificação de identidade';
COMMENT ON COLUMN users.verification_level IS 'Nível de verificação: none, email, phone, document, full';
COMMENT ON COLUMN users.terms_accepted_at IS 'Data de aceite dos termos de uso';
COMMENT ON COLUMN users.privacy_policy_accepted_at IS 'Data de aceite da política de privacidade';
COMMENT ON COLUMN users.marketing_consent_at IS 'Data de consentimento para marketing';

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_level ON users(verification_level);

-- Log completion
DO $$ 
BEGIN 
  RAISE NOTICE 'Added all missing columns to users table (first_name, last_name, whatsapp, is_verified, verification_level, terms/privacy dates)';
END $$;