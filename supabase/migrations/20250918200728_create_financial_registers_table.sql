-- Migration: Create financial_registers table
-- Description: Tabela para registros financeiros lançados pelos clientes do BPO para validação

-- ======================================
-- Create financial_registers table
-- ======================================

CREATE TABLE IF NOT EXISTS financial_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key para a empresa
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Tipo de registro (entrada ou saída)
    type VARCHAR(20) NOT NULL CHECK (type IN ('receivable', 'payable')),
    
    -- Informações de pagamento
    pix_number VARCHAR(255),
    bank_slip_code VARCHAR(255),
    payment_method VARCHAR(100),
    
    -- Foreign key para cliente/fornecedor
    companies_clients_suppliers_id UUID REFERENCES companies_clients_suppliers(id) ON DELETE SET NULL,
    
    -- Informações financeiras
    due_date DATE,
    value DECIMAL(15,2),
    date_of_issue DATE,
    number_of_document VARCHAR(100),
    notes TEXT,
    
    -- Foreign key para categoria financeira
    category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
    
    -- Campo de ocorrência
    occurrence VARCHAR(50),
    
    -- Status do registro
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_validation', 'validated', 'rejected')),
    
    -- Campos de pagamento/recebimento
    payment_date DATE,
    paid_amount DECIMAL(15,2),
    financial_account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
    
    -- Campos de recorrência
    parent_account_id UUID REFERENCES financial_registers(id) ON DELETE CASCADE,
    series_id UUID,
    recurrence_config JSONB,
    installment_number INTEGER,
    
    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- ======================================
-- Create indexes
-- ======================================

CREATE INDEX IF NOT EXISTS idx_financial_registers_company_id ON financial_registers(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_registers_type ON financial_registers(type);
CREATE INDEX IF NOT EXISTS idx_financial_registers_companies_clients_suppliers_id ON financial_registers(companies_clients_suppliers_id);
CREATE INDEX IF NOT EXISTS idx_financial_registers_category_id ON financial_registers(category_id);
CREATE INDEX IF NOT EXISTS idx_financial_registers_due_date ON financial_registers(due_date);
CREATE INDEX IF NOT EXISTS idx_financial_registers_created_at ON financial_registers(created_at);
CREATE INDEX IF NOT EXISTS idx_financial_registers_status ON financial_registers(status);
CREATE INDEX IF NOT EXISTS idx_financial_registers_parent_account_id ON financial_registers(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_financial_registers_series_id ON financial_registers(series_id);

-- ======================================
-- Create trigger for updated_at
-- ======================================

CREATE OR REPLACE FUNCTION update_financial_registers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_financial_registers_updated_at
    BEFORE UPDATE ON financial_registers
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_registers_updated_at();

-- ======================================
-- Add comments
-- ======================================

COMMENT ON TABLE financial_registers IS 'Registros financeiros lancados pelos clientes do BPO para validacao';
COMMENT ON COLUMN financial_registers.company_id IS 'Referencia para a empresa dona do registro';
COMMENT ON COLUMN financial_registers.type IS 'Tipo de registro: receivable (a receber) ou payable (a pagar)';
COMMENT ON COLUMN financial_registers.pix_number IS 'Numero do PIX para pagamento/recebimento';
COMMENT ON COLUMN financial_registers.bank_slip_code IS 'Codigo do boleto bancario';
COMMENT ON COLUMN financial_registers.payment_method IS 'Metodo de pagamento/recebimento';
COMMENT ON COLUMN financial_registers.companies_clients_suppliers_id IS 'Referencia para cliente/fornecedor';
COMMENT ON COLUMN financial_registers.due_date IS 'Data de vencimento';
COMMENT ON COLUMN financial_registers.value IS 'Valor do registro';
COMMENT ON COLUMN financial_registers.date_of_issue IS 'Data de emissao';
COMMENT ON COLUMN financial_registers.number_of_document IS 'Numero do documento';
COMMENT ON COLUMN financial_registers.notes IS 'Observacoes do registro';
COMMENT ON COLUMN financial_registers.category_id IS 'Referencia para categoria financeira';
COMMENT ON COLUMN financial_registers.occurrence IS 'Tipo de ocorrencia do registro';
COMMENT ON COLUMN financial_registers.status IS 'Status do registro (draft, pending_validation, validated, rejected)';
COMMENT ON COLUMN financial_registers.payment_date IS 'Data em que foi pago/recebido';
COMMENT ON COLUMN financial_registers.paid_amount IS 'Valor efetivamente pago/recebido';
COMMENT ON COLUMN financial_registers.financial_account_id IS 'Conta financeira usada';
COMMENT ON COLUMN financial_registers.parent_account_id IS 'ID do registro pai para registros recorrentes';
COMMENT ON COLUMN financial_registers.series_id IS 'UUID unico para identificar toda a serie de registros recorrentes';
COMMENT ON COLUMN financial_registers.recurrence_config IS 'Configuracao completa da recorrencia em JSON';
COMMENT ON COLUMN financial_registers.installment_number IS 'Numero da parcela atual (para registros parcelados)';
COMMENT ON COLUMN financial_registers.created_by IS 'Usuario que criou o registro';
COMMENT ON COLUMN financial_registers.updated_by IS 'Usuario que editou o registro';