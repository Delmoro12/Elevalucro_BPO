-- Create financial_categories table
CREATE TABLE IF NOT EXISTS financial_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key para a empresa
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Informacoes da categoria
    description TEXT NOT NULL,
    
    -- Foreign key para grupo DRE
    dre_groups_id UUID REFERENCES dre_groups(id) ON DELETE SET NULL,
    
    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_financial_categories_company_id ON financial_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_categories_dre_groups_id ON financial_categories(dre_groups_id);
CREATE INDEX IF NOT EXISTS idx_financial_categories_created_at ON financial_categories(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_financial_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_financial_categories_updated_at
    BEFORE UPDATE ON financial_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_categories_updated_at();

-- Comments
COMMENT ON TABLE financial_categories IS 'Categorias financeiras para classificacao de receitas e despesas';
COMMENT ON COLUMN financial_categories.company_id IS 'Referencia para a empresa dona da categoria';
COMMENT ON COLUMN financial_categories.description IS 'Descricao da categoria financeira';
COMMENT ON COLUMN financial_categories.dre_groups_id IS 'Referencia para o grupo DRE ao qual a categoria pertence';
COMMENT ON COLUMN financial_categories.created_by IS 'Usuario que criou o registro';
COMMENT ON COLUMN financial_categories.updated_by IS 'Usuario que editou o registro';