CREATE TABLE prospects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Dados pessoais do contato
    contact_name VARCHAR(100) NOT NULL,
    contact_cpf VARCHAR(14),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    contact_role VARCHAR(100),
    
    -- Dados da empresa
    company_name VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18),
    address VARCHAR(255),
    number VARCHAR(20),
    neighborhood VARCHAR(100),
    zip_code VARCHAR(9),
    city VARCHAR(100),
    state VARCHAR(2),
    
    -- Dados técnicos/operacionais
    segment VARCHAR(100),
    areas TEXT[],
    banks TEXT[],
    tools TEXT[],
    suppliers TEXT[],
    organization TEXT[],
    reports TEXT[],
    
    -- Expectativas e objetivos
    success_expectations TEXT,
    
    -- Plano selecionado
    plan VARCHAR(20),
    monthly_value DECIMAL(10,2),
    
    -- Status (lead ou prospect)
    status VARCHAR(20) DEFAULT 'lead' CHECK (status IN ('lead', 'prospect')),
    
    -- Estágio no kanban
    kanban_stage VARCHAR(20) DEFAULT 'new',
    
    -- Vendedor responsável
    assigned_salesperson_id UUID REFERENCES users(id),
    
    -- Temperatura/nível de interesse
    temperature VARCHAR(20) DEFAULT 'cold' CHECK (temperature IN ('cold', 'warm', 'hot')),
    
    -- Contatos adicionais
    additional_contact_email VARCHAR(255),
    additional_contact_phone VARCHAR(20),
    
    
    -- Metadados
    lead_source VARCHAR(50),
    notes TEXT,
    
    -- Auditoria
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prospects_contact_email ON prospects(contact_email);
CREATE INDEX idx_prospects_cnpj ON prospects(cnpj);
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_kanban_stage ON prospects(kanban_stage);
CREATE INDEX idx_prospects_assigned_salesperson_id ON prospects(assigned_salesperson_id);
CREATE INDEX idx_prospects_temperature ON prospects(temperature);
CREATE INDEX idx_prospects_lead_source ON prospects(lead_source);
CREATE INDEX idx_prospects_plan ON prospects(plan);
CREATE INDEX idx_prospects_created_at ON prospects(created_at);