-- Create cash_movements table
CREATE TABLE IF NOT EXISTS cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key para a empresa
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Foreign key para a conta financeira
    financial_account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE CASCADE,
    
    -- Informações da movimentação
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
    description TEXT NOT NULL,
    
    -- Referência para o que gerou a movimentação
    reference_type VARCHAR(50), -- 'account_payment', 'initial_balance', 'manual_adjustment', etc
    reference_id UUID, -- ID da conta a pagar, ou outro registro que gerou a movimentação
    
    -- Data da movimentação
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Auditoria
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cash_movements_company_id ON cash_movements(company_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_financial_account_id ON cash_movements(financial_account_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_date ON cash_movements(date);
CREATE INDEX IF NOT EXISTS idx_cash_movements_type ON cash_movements(type);
CREATE INDEX IF NOT EXISTS idx_cash_movements_reference ON cash_movements(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_created_at ON cash_movements(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_cash_movements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cash_movements_updated_at
    BEFORE UPDATE ON cash_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_cash_movements_updated_at();

-- Comments
COMMENT ON TABLE cash_movements IS 'Movimentações financeiras das contas da empresa';
COMMENT ON COLUMN cash_movements.company_id IS 'Referência para a empresa dona da movimentação';
COMMENT ON COLUMN cash_movements.financial_account_id IS 'Referência para a conta financeira movimentada';
COMMENT ON COLUMN cash_movements.amount IS 'Valor da movimentação (sempre positivo)';
COMMENT ON COLUMN cash_movements.type IS 'Tipo da movimentação (credit para entrada, debit para saída)';
COMMENT ON COLUMN cash_movements.description IS 'Descrição da movimentação';
COMMENT ON COLUMN cash_movements.reference_type IS 'Tipo de referência que gerou a movimentação';
COMMENT ON COLUMN cash_movements.reference_id IS 'ID do registro que gerou a movimentação';
COMMENT ON COLUMN cash_movements.date IS 'Data da movimentação';
COMMENT ON COLUMN cash_movements.created_by IS 'Usuário que criou o registro';
COMMENT ON COLUMN cash_movements.updated_by IS 'Usuário que editou o registro';