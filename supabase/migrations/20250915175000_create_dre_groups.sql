-- =============================================================================
-- Migration: Create DRE Groups Table
-- Generated at: 2025-09-15 17:50:00
-- =============================================================================
-- Cria tabela para grupos de segmentação das categorias no DRE

BEGIN;

-- Criar tabela dre_groups
CREATE TABLE IF NOT EXISTS dre_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key para a empresa
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Informações do grupo
    description TEXT NOT NULL, -- Descrição do grupo
    sort_order INTEGER NOT NULL DEFAULT 0, -- Ordenação numérica
    
    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dre_groups_company_id ON dre_groups(company_id);
CREATE INDEX IF NOT EXISTS idx_dre_groups_sort_order ON dre_groups(sort_order);
CREATE INDEX IF NOT EXISTS idx_dre_groups_created_at ON dre_groups(created_at);

-- Unique constraint para evitar duplicação de ordenação por empresa
CREATE UNIQUE INDEX IF NOT EXISTS idx_dre_groups_unique_sort_order 
ON dre_groups(company_id, sort_order);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_dre_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dre_groups_updated_at
    BEFORE UPDATE ON dre_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_dre_groups_updated_at();

-- Comments
COMMENT ON TABLE dre_groups IS 'Grupos para segmentação das categorias no DRE';
COMMENT ON COLUMN dre_groups.company_id IS 'Referência para a empresa dona do grupo';
COMMENT ON COLUMN dre_groups.description IS 'Descrição do grupo DRE';
COMMENT ON COLUMN dre_groups.sort_order IS 'Ordem de exibição no DRE';
COMMENT ON COLUMN dre_groups.created_by IS 'Usuário que criou o registro';
COMMENT ON COLUMN dre_groups.updated_by IS 'Usuário que editou o registro';

COMMIT;