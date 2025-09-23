-- Adicionar campo 'type' na tabela dre_groups
ALTER TABLE dre_groups 
ADD COLUMN type VARCHAR(10) CHECK (type IN ('receita', 'despesa'));

-- Atualizar grupos existentes com valor padrão 'despesa'
UPDATE dre_groups SET type = 'despesa' WHERE type IS NULL;

-- Tornar o campo obrigatório após popular os dados existentes
ALTER TABLE dre_groups 
ALTER COLUMN type SET NOT NULL;

-- Adicionar comentário
COMMENT ON COLUMN dre_groups.type IS 'Tipo do grupo: receita ou despesa';