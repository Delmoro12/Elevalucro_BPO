-- =============================================================================
-- Migration: Create Companies Clients/Suppliers Table
-- Generated at: 2025-09-15 08:40:00
-- =============================================================================
-- Cria tabela para cadastro de clientes e fornecedores das empresas

BEGIN;

-- Criar tabela companies_clients_suppliers
CREATE TABLE IF NOT EXISTS companies_clients_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key para a empresa
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Informações básicas
    name TEXT NOT NULL, -- Nome do cliente/fornecedor
    type VARCHAR(20) NOT NULL CHECK (type IN ('client', 'supplier')), -- Tipo: cliente ou fornecedor
    cnpj VARCHAR(18), -- CNPJ (opcional para pessoas físicas)
    cpf VARCHAR(14), -- CPF (para pessoas físicas)
    
    -- Contatos
    email_billing TEXT, -- Email para cobranças/faturamento
    whatsapp VARCHAR(20), -- WhatsApp para contato
    phone VARCHAR(20), -- Telefone adicional
    pix TEXT, -- Chave PIX
    
    -- Endereço
    address TEXT, -- Endereço completo
    city VARCHAR(100), -- Cidade
    state VARCHAR(2), -- Estado (UF)
    zip_code VARCHAR(9), -- CEP
    
    -- Informações adicionais
    observations TEXT, -- Observações gerais
    
    -- Status e controle
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_companies_clients_suppliers_company_id ON companies_clients_suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_clients_suppliers_type ON companies_clients_suppliers(type);
CREATE INDEX IF NOT EXISTS idx_companies_clients_suppliers_name ON companies_clients_suppliers(name);
CREATE INDEX IF NOT EXISTS idx_companies_clients_suppliers_cnpj ON companies_clients_suppliers(cnpj);
CREATE INDEX IF NOT EXISTS idx_companies_clients_suppliers_cpf ON companies_clients_suppliers(cpf);
CREATE INDEX IF NOT EXISTS idx_companies_clients_suppliers_is_active ON companies_clients_suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_clients_suppliers_created_at ON companies_clients_suppliers(created_at);

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_clients_suppliers_unique_cnpj 
ON companies_clients_suppliers(company_id, cnpj) 
WHERE cnpj IS NOT NULL AND is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_clients_suppliers_unique_cpf 
ON companies_clients_suppliers(company_id, cpf) 
WHERE cpf IS NOT NULL AND is_active = true;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_companies_clients_suppliers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_companies_clients_suppliers_updated_at
    BEFORE UPDATE ON companies_clients_suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_companies_clients_suppliers_updated_at();

-- Comments
COMMENT ON TABLE companies_clients_suppliers IS 'Cadastro de clientes e fornecedores das empresas';
COMMENT ON COLUMN companies_clients_suppliers.company_id IS 'Referência para a empresa dona do cadastro';
COMMENT ON COLUMN companies_clients_suppliers.name IS 'Nome/Razão social do cliente ou fornecedor';
COMMENT ON COLUMN companies_clients_suppliers.type IS 'Tipo: client (cliente) ou supplier (fornecedor)';
COMMENT ON COLUMN companies_clients_suppliers.cnpj IS 'CNPJ para pessoas jurídicas';
COMMENT ON COLUMN companies_clients_suppliers.cpf IS 'CPF para pessoas físicas';
COMMENT ON COLUMN companies_clients_suppliers.email_billing IS 'Email principal para cobranças e faturamento';
COMMENT ON COLUMN companies_clients_suppliers.whatsapp IS 'WhatsApp para contato direto';
COMMENT ON COLUMN companies_clients_suppliers.phone IS 'Telefone adicional para contato';
COMMENT ON COLUMN companies_clients_suppliers.pix IS 'Chave PIX para pagamentos';
COMMENT ON COLUMN companies_clients_suppliers.address IS 'Endereço completo';
COMMENT ON COLUMN companies_clients_suppliers.observations IS 'Observações e notas sobre o cliente/fornecedor';

COMMIT;