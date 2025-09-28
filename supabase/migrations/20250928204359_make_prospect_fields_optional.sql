-- Tornar os campos contact_cpf, cnpj, plan e monthly_value opcionais na tabela prospects
-- Estas mudan�as s�o necess�rias para permitir a cria��o de leads com dados m�nimos

-- Remover restri��o NOT NULL do campo contact_cpf
ALTER TABLE prospects ALTER COLUMN contact_cpf DROP NOT NULL;

-- Remover restri��o NOT NULL do campo cnpj
ALTER TABLE prospects ALTER COLUMN cnpj DROP NOT NULL;

-- Remover restri��o NOT NULL do campo plan
ALTER TABLE prospects ALTER COLUMN plan DROP NOT NULL;

-- Remover restri��o NOT NULL do campo monthly_value
ALTER TABLE prospects ALTER COLUMN monthly_value DROP NOT NULL;