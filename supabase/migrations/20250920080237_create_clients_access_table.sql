-- ======================================
-- 31. Clients Access
-- ======================================
-- Tabela para armazenar acessos de clientes (credenciais, sistemas, etc.)

CREATE TABLE IF NOT EXISTS clients_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key para a empresa
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Informações do acesso
    description TEXT NOT NULL, -- Descrição do acesso (ex: "Portal do Banco", "Sistema Contábil")
    login TEXT NOT NULL, -- Login/usuário para acesso
    password TEXT NOT NULL, -- Senha (será criptografada no frontend)
    url TEXT, -- URL do sistema/portal (opcional)
    
    -- Controle de auditoria
    created_by UUID REFERENCES users(id), -- Usuário que criou o registro
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id), -- Usuário que fez a última atualização
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_access_company_id ON clients_access(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_access_description ON clients_access(description);
CREATE INDEX IF NOT EXISTS idx_clients_access_created_by ON clients_access(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_access_updated_by ON clients_access(updated_by);
CREATE INDEX IF NOT EXISTS idx_clients_access_created_at ON clients_access(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_clients_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_clients_access_updated_at
    BEFORE UPDATE ON clients_access
    FOR EACH ROW
    EXECUTE FUNCTION update_clients_access_updated_at();

-- Comments
COMMENT ON TABLE clients_access IS 'Armazenamento de credenciais e acessos dos clientes';
COMMENT ON COLUMN clients_access.company_id IS 'Referência para a empresa dona dos acessos';
COMMENT ON COLUMN clients_access.description IS 'Descrição do sistema ou portal de acesso';
COMMENT ON COLUMN clients_access.login IS 'Login/usuário para acesso ao sistema';
COMMENT ON COLUMN clients_access.password IS 'Senha para acesso (criptografada)';
COMMENT ON COLUMN clients_access.url IS 'URL do sistema/portal quando aplicável';
COMMENT ON COLUMN clients_access.created_by IS 'Usuário BPO que criou o registro';
COMMENT ON COLUMN clients_access.updated_by IS 'Usuário BPO que fez a última atualização';