-- Migration: Create financial_transactions table
-- Description: Tabela unificada para transações financeiras (substitui accounts_payable e accounts_receivable)

-- ======================================
-- Tabela: financial_transactions
-- Descrição: Tabela unificada para transações financeiras (entradas e saídas)
-- Substitui: accounts_payable e accounts_receivable
-- ======================================

CREATE TABLE financial_transactions (
    -- Campos básicos
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('receivable', 'payable')),
    created_by_side VARCHAR(20) NOT NULL CHECK (created_by_side IN ('bpo_side', 'client_side')),
    
    -- Informações financeiras
    value DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    date_of_issue DATE,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    
    -- Dados de pagamento
    pix_number TEXT,
    bank_slip_code TEXT,
    payment_date DATE,
    paid_amount DECIMAL(15,2),
    financial_account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
    
    -- Relacionamentos
    companies_clients_suppliers_id UUID REFERENCES companies_clients_suppliers(id) ON DELETE SET NULL,
    category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
    
    -- Documentação
    number_of_document VARCHAR(255),
    notes TEXT,
    documents JSONB DEFAULT '[]',
    
    -- Recorrência
    occurrence VARCHAR(20) DEFAULT 'unique' CHECK (occurrence IN ('unique', 'weekly', 'monthly', 'installments')),
    recurrence_config JSONB,
    parent_account_id UUID REFERENCES financial_transactions(id) ON DELETE CASCADE,
    series_id UUID,
    installment_number INTEGER,
    installment_total INTEGER,
    
    -- Validação BPO
    validated BOOLEAN DEFAULT FALSE,
    validated_at TIMESTAMPTZ,
    validated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ======================================
-- Índices otimizados
-- ======================================

CREATE INDEX idx_financial_transactions_company_type ON financial_transactions(company_id, type);
CREATE INDEX idx_financial_transactions_validated ON financial_transactions(validated, company_id);
CREATE INDEX idx_financial_transactions_status ON financial_transactions(status, company_id);
CREATE INDEX idx_financial_transactions_due_date ON financial_transactions(due_date);
CREATE INDEX idx_financial_transactions_created_by_side ON financial_transactions(created_by_side);
CREATE INDEX idx_financial_transactions_parent ON financial_transactions(parent_account_id);
CREATE INDEX idx_financial_transactions_series ON financial_transactions(series_id);
CREATE INDEX idx_financial_transactions_occurrence ON financial_transactions(occurrence);

-- ======================================
-- Trigger para updated_at
-- ======================================

CREATE OR REPLACE FUNCTION update_financial_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_financial_transactions_updated_at
    BEFORE UPDATE ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_transactions_updated_at();

-- ======================================
-- Comentários
-- ======================================

COMMENT ON TABLE financial_transactions IS 'Tabela unificada para todas as transações financeiras (contas a pagar e receber)';
COMMENT ON COLUMN financial_transactions.type IS 'Tipo da transação: receivable (entrada) ou payable (saída)';
COMMENT ON COLUMN financial_transactions.created_by_side IS 'Lado que criou o registro: bpo_side (Tools) ou client_side (BPO-APP)';
COMMENT ON COLUMN financial_transactions.value IS 'Valor da transação em decimal';
COMMENT ON COLUMN financial_transactions.status IS 'Status da conta: pending, paid, cancelled';
COMMENT ON COLUMN financial_transactions.recurrence_config IS 'Configuração completa da recorrência em JSON';
COMMENT ON COLUMN financial_transactions.occurrence IS 'Tipo de ocorrência: unique, weekly, monthly, installments';
COMMENT ON COLUMN financial_transactions.validated IS 'Se foi validado pela equipe BPO';
COMMENT ON COLUMN financial_transactions.documents IS 'Array JSON com documentos anexados';
COMMENT ON COLUMN financial_transactions.parent_account_id IS 'Referência à conta pai para contas geradas por recorrência';
COMMENT ON COLUMN financial_transactions.series_id IS 'ID da série de recorrência para agrupar contas relacionadas';