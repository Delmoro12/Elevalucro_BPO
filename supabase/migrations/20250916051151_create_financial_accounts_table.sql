-- Create financial_accounts table
CREATE TABLE IF NOT EXISTS financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key para a empresa
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Informacoes da conta
    description TEXT NOT NULL,
    
    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_financial_accounts_company_id ON financial_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_accounts_created_at ON financial_accounts(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_financial_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_financial_accounts_updated_at
    BEFORE UPDATE ON financial_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_accounts_updated_at();

-- Comments
COMMENT ON TABLE financial_accounts IS 'Contas financeiras para gestao de recursos';
COMMENT ON COLUMN financial_accounts.company_id IS 'Referencia para a empresa dona da conta';
COMMENT ON COLUMN financial_accounts.description IS 'Descricao da conta financeira';
COMMENT ON COLUMN financial_accounts.created_by IS 'Usuario que criou o registro';
COMMENT ON COLUMN financial_accounts.updated_by IS 'Usuario que editou o registro';