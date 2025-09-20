-- Add payment fields to accounts_payable table
ALTER TABLE accounts_payable 
ADD COLUMN IF NOT EXISTS payment_date DATE,
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS financial_account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_accounts_payable_financial_account_id ON accounts_payable(financial_account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_payment_date ON accounts_payable(payment_date);

-- Add comments for new columns
COMMENT ON COLUMN accounts_payable.payment_date IS 'Data em que a conta foi paga';
COMMENT ON COLUMN accounts_payable.paid_amount IS 'Valor efetivamente pago (pode ser diferente do valor original)';
COMMENT ON COLUMN accounts_payable.financial_account_id IS 'Conta financeira usada para o pagamento';