-- Tabela de perfil público dos usuários (complementa auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- Dados pessoais
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(100), -- Nome para exibição (pode ser diferente do nome completo)
    
    -- Documentos
    cpf VARCHAR(14) UNIQUE, -- CPF apenas números
    rg VARCHAR(20),
    birth_date DATE,
    
    -- Contato adicional
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    
    -- Endereço pessoal
    address_street VARCHAR(255),
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zipcode VARCHAR(9),
    address_country VARCHAR(50) DEFAULT 'Brasil',
    
    -- Perfil profissional
    job_title VARCHAR(100), -- Cargo principal
    bio TEXT, -- Biografia/descrição
    avatar_url TEXT,
    
    -- Configurações de usuário
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    language VARCHAR(5) DEFAULT 'pt-BR',
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Preferências de notificação
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    marketing_emails BOOLEAN DEFAULT false,
    
    -- Configurações de segurança
    two_factor_enabled BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    login_count INTEGER DEFAULT 0,
    
    -- Status do usuário
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false, -- Verificação de identidade
    verification_level VARCHAR(20) DEFAULT 'none', -- none, email, phone, document, full
    
    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 0,
    welcome_tour_completed BOOLEAN DEFAULT false,
    
    -- Termos e políticas
    terms_accepted_at TIMESTAMPTZ,
    privacy_policy_accepted_at TIMESTAMPTZ,
    marketing_consent_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT users_cpf_format CHECK (cpf ~ '^[0-9]{11}$'),
    CONSTRAINT users_verification_level_valid CHECK (verification_level IN ('none', 'email', 'phone', 'document', 'full')),
    CONSTRAINT users_onboarding_step_valid CHECK (onboarding_step >= 0 AND onboarding_step <= 10),
    CONSTRAINT users_currency_valid CHECK (currency IN ('BRL', 'USD', 'EUR')),
    CONSTRAINT users_language_valid CHECK (language IN ('pt-BR', 'en-US', 'es-ES'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_verification_level ON users(verification_level);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- Trigger para extrair first_name e last_name do full_name
CREATE OR REPLACE FUNCTION extract_user_names()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN
        -- Extrair primeiro nome
        NEW.first_name = COALESCE(NEW.first_name, SPLIT_PART(NEW.full_name, ' ', 1));
        
        -- Extrair último nome (tudo após o primeiro espaço)
        IF POSITION(' ' IN NEW.full_name) > 0 THEN
            NEW.last_name = COALESCE(NEW.last_name, SUBSTRING(NEW.full_name FROM POSITION(' ' IN NEW.full_name) + 1));
        END IF;
        
        -- Display name padrão é o primeiro nome
        NEW.display_name = COALESCE(NEW.display_name, NEW.first_name);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_extract_names_trigger
    BEFORE INSERT OR UPDATE OF full_name ON users
    FOR EACH ROW
    EXECUTE FUNCTION extract_user_names();

-- Comentários para documentação
COMMENT ON TABLE users IS 'Perfil público dos usuários (complementa auth.users do Supabase)';
COMMENT ON COLUMN users.id IS 'Referência para auth.users(id) - mesmo UUID';
COMMENT ON COLUMN users.display_name IS 'Nome para exibição na interface';
COMMENT ON COLUMN users.cpf IS 'CPF apenas números para validações';
COMMENT ON COLUMN users.verification_level IS 'Nível de verificação da identidade do usuário';
COMMENT ON COLUMN users.onboarding_step IS 'Etapa atual do processo de onboarding (0-10)';
COMMENT ON COLUMN users.login_count IS 'Contador de logins realizados';