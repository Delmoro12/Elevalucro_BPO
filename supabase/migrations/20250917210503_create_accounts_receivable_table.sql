-- Create accounts_receivable table
CREATE TABLE IF NOT EXISTS accounts_receivable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key para a empresa
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Informacoes da conta a receber
    pix_number VARCHAR(255),
    bank_slip_code VARCHAR(255),
    payment_method VARCHAR(100),
    
    -- Foreign key para cliente
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
    
    -- Status de recebimento da conta
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'cancelled')),
    
    -- Campos de recebimento
    receipt_date DATE,
    received_amount DECIMAL(15,2),
    financial_account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
    
    -- Campos de recorrência
    parent_account_id UUID REFERENCES accounts_receivable(id) ON DELETE CASCADE,
    series_id UUID,
    recurrence_config JSONB,
    installment_number INTEGER,
    installment_total INTEGER,
    installment_day INTEGER,
    recurrence_day_of_week INTEGER,
    recurrence_day_of_month INTEGER,
    
    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_company_id ON accounts_receivable(company_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_companies_clients_suppliers_id ON accounts_receivable(companies_clients_suppliers_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_category_id ON accounts_receivable(category_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_due_date ON accounts_receivable(due_date);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_created_at ON accounts_receivable(created_at);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_status ON accounts_receivable(status);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_parent_account_id ON accounts_receivable(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_series_id ON accounts_receivable(series_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_financial_account_id ON accounts_receivable(financial_account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_receipt_date ON accounts_receivable(receipt_date);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_accounts_receivable_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_accounts_receivable_updated_at
    BEFORE UPDATE ON accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION update_accounts_receivable_updated_at();

-- Comments
COMMENT ON TABLE accounts_receivable IS 'Contas a receber da empresa';
COMMENT ON COLUMN accounts_receivable.company_id IS 'Referencia para a empresa dona da conta';
COMMENT ON COLUMN accounts_receivable.pix_number IS 'Numero do PIX para recebimento';
COMMENT ON COLUMN accounts_receivable.bank_slip_code IS 'Codigo do boleto bancario';
COMMENT ON COLUMN accounts_receivable.payment_method IS 'Metodo de recebimento';
COMMENT ON COLUMN accounts_receivable.companies_clients_suppliers_id IS 'Referencia para cliente';
COMMENT ON COLUMN accounts_receivable.due_date IS 'Data de vencimento da conta';
COMMENT ON COLUMN accounts_receivable.value IS 'Valor da conta a receber';
COMMENT ON COLUMN accounts_receivable.date_of_issue IS 'Data de emissao da conta';
COMMENT ON COLUMN accounts_receivable.number_of_document IS 'Numero do documento';
COMMENT ON COLUMN accounts_receivable.notes IS 'Observacoes da conta';
COMMENT ON COLUMN accounts_receivable.category_id IS 'Referencia para categoria financeira';
COMMENT ON COLUMN accounts_receivable.occurrence IS 'Tipo de ocorrencia da conta';
COMMENT ON COLUMN accounts_receivable.status IS 'Status de recebimento da conta (pending, received, cancelled)';
COMMENT ON COLUMN accounts_receivable.receipt_date IS 'Data em que a conta foi recebida';
COMMENT ON COLUMN accounts_receivable.received_amount IS 'Valor efetivamente recebido (pode ser diferente do valor original)';
COMMENT ON COLUMN accounts_receivable.financial_account_id IS 'Conta financeira usada para o recebimento';
COMMENT ON COLUMN accounts_receivable.parent_account_id IS 'ID da conta pai para contas recorrentes';
COMMENT ON COLUMN accounts_receivable.series_id IS 'UUID unico para identificar toda a serie de contas recorrentes';
COMMENT ON COLUMN accounts_receivable.recurrence_config IS 'Configuracao completa da recorrencia em JSON';
COMMENT ON COLUMN accounts_receivable.installment_number IS 'Numero da parcela atual (para contas parceladas)';
COMMENT ON COLUMN accounts_receivable.installment_total IS 'Numero total de parcelas';
COMMENT ON COLUMN accounts_receivable.installment_day IS 'Dia do mes para vencimento das parcelas';
COMMENT ON COLUMN accounts_receivable.recurrence_day_of_week IS 'Dia da semana para recorrencia semanal (0=domingo, 1=segunda, etc)';
COMMENT ON COLUMN accounts_receivable.recurrence_day_of_month IS 'Dia do mes para recorrencia mensal';
COMMENT ON COLUMN accounts_receivable.created_by IS 'Usuario que criou o registro';
COMMENT ON COLUMN accounts_receivable.updated_by IS 'Usuario que editou o registro';