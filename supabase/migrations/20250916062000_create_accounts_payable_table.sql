-- Create accounts_payable table
CREATE TABLE IF NOT EXISTS accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key para a empresa
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Informacoes da conta a pagar
    pix_number VARCHAR(255),
    bank_slip_code VARCHAR(255),
    payment_method VARCHAR(100),
    
    -- Foreign key para cliente/fornecedor
    companies_clients_suppliers_id UUID REFERENCES companies_clients_suppliers(id) ON DELETE SET NULL,
    
    -- Informacoes financeiras
    due_date DATE,
    value DECIMAL(15,2),
    date_of_issue DATE,
    number_of_document VARCHAR(100),
    notes TEXT,
    
    -- Foreign key para categoria financeira
    category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
    
    -- Campo de ocorrencia (sera definido pelo front)
    occurrence VARCHAR(50),
    
    -- Status de pagamento da conta
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    
    -- Campos de pagamento
    payment_date DATE,
    paid_amount DECIMAL(15,2),
    financial_account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
    
    -- Campos de recorrência
    parent_account_id UUID REFERENCES accounts_payable(id) ON DELETE CASCADE,
    series_id UUID,
    recurrence_config JSONB,
    installment_number INTEGER,
    
    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_payable_company_id ON accounts_payable(company_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_companies_clients_suppliers_id ON accounts_payable(companies_clients_suppliers_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_category_id ON accounts_payable(category_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_due_date ON accounts_payable(due_date);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_created_at ON accounts_payable(created_at);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_status ON accounts_payable(status);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_parent_account_id ON accounts_payable(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_series_id ON accounts_payable(series_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_financial_account_id ON accounts_payable(financial_account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_payment_date ON accounts_payable(payment_date);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_accounts_payable_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_accounts_payable_updated_at
    BEFORE UPDATE ON accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION update_accounts_payable_updated_at();

-- Comments
COMMENT ON TABLE accounts_payable IS 'Contas a pagar da empresa';
COMMENT ON COLUMN accounts_payable.company_id IS 'Referencia para a empresa dona da conta';
COMMENT ON COLUMN accounts_payable.pix_number IS 'Numero do PIX para pagamento';
COMMENT ON COLUMN accounts_payable.bank_slip_code IS 'Codigo do boleto bancario';
COMMENT ON COLUMN accounts_payable.payment_method IS 'Metodo de pagamento';
COMMENT ON COLUMN accounts_payable.companies_clients_suppliers_id IS 'Referencia para cliente/fornecedor';
COMMENT ON COLUMN accounts_payable.due_date IS 'Data de vencimento da conta';
COMMENT ON COLUMN accounts_payable.value IS 'Valor da conta a pagar';
COMMENT ON COLUMN accounts_payable.date_of_issue IS 'Data de emissao da conta';
COMMENT ON COLUMN accounts_payable.number_of_document IS 'Numero do documento';
COMMENT ON COLUMN accounts_payable.notes IS 'Observacoes da conta';
COMMENT ON COLUMN accounts_payable.category_id IS 'Referencia para categoria financeira';
COMMENT ON COLUMN accounts_payable.occurrence IS 'Tipo de ocorrencia da conta';
COMMENT ON COLUMN accounts_payable.status IS 'Status de pagamento da conta (pending, paid, cancelled)';
COMMENT ON COLUMN accounts_payable.payment_date IS 'Data em que a conta foi paga';
COMMENT ON COLUMN accounts_payable.paid_amount IS 'Valor efetivamente pago (pode ser diferente do valor original)';
COMMENT ON COLUMN accounts_payable.financial_account_id IS 'Conta financeira usada para o pagamento';
COMMENT ON COLUMN accounts_payable.parent_account_id IS 'ID da conta pai para contas recorrentes';
COMMENT ON COLUMN accounts_payable.series_id IS 'UUID unico para identificar toda a serie de contas recorrentes';
COMMENT ON COLUMN accounts_payable.recurrence_config IS 'Configuracao completa da recorrencia em JSON';
COMMENT ON COLUMN accounts_payable.installment_number IS 'Numero da parcela atual (para contas parceladas)';
COMMENT ON COLUMN accounts_payable.created_by IS 'Usuario que criou o registro';
COMMENT ON COLUMN accounts_payable.updated_by IS 'Usuario que editou o registro';