-- Tabela de perfil público dos usuários (complementa auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- Dados pessoais
    email VARCHAR(255) UNIQUE NOT NULL, -- Email sincronizado do auth.users
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),

    -- Contato adicional
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    
    -- Relacionamentos
    role_id UUID NOT NULL REFERENCES roles(id),
    profile_id UUID REFERENCES profiles(id),
    
    -- Status do usuário
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false, -- Verificação de identidade
    verification_level VARCHAR(20) DEFAULT 'none', -- none, email, phone, document, full
    
    -- Termos e políticas
    terms_accepted_at TIMESTAMPTZ,
    privacy_policy_accepted_at TIMESTAMPTZ,
    marketing_consent_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_profile_id ON users(profile_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_verification_level ON users(verification_level);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

