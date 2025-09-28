-- Tornar os campos contact_cpf, cnpj, plan e monthly_value opcionais na tabela prospects
-- Estas mudanças são necessárias para permitir a criação de leads com dados mínimos

-- Remover restrição NOT NULL do campo contact_cpf
ALTER TABLE prospects ALTER COLUMN contact_cpf DROP NOT NULL;

-- Remover restrição NOT NULL do campo cnpj
ALTER TABLE prospects ALTER COLUMN cnpj DROP NOT NULL;

-- Remover restrição NOT NULL do campo plan
ALTER TABLE prospects ALTER COLUMN plan DROP NOT NULL;

-- Remover restrição NOT NULL do campo monthly_value
ALTER TABLE prospects ALTER COLUMN monthly_value DROP NOT NULL;