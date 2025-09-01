-- Migration para atualizar estrutura da tabela prospects
-- Baseada no arquivo supabase/database/schemas/008_prospects.sql

-- Primeiro, salvar dados existentes se houver
CREATE TABLE IF NOT EXISTS prospects_backup AS SELECT * FROM prospects;

-- Dropar a tabela antiga
DROP TABLE IF EXISTS prospects CASCADE;

-- Criar a tabela com a estrutura correta
CREATE TABLE prospects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Dados pessoais do contato
    nome_contato VARCHAR(100) NOT NULL,
    cpf_contato VARCHAR(14) NOT NULL,
    email_contato VARCHAR(255) NOT NULL,
    telefone_contato VARCHAR(20),
    cargo_contato VARCHAR(100),
    
    -- Dados da empresa
    nome_empresa VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18) NOT NULL,
    endereco VARCHAR(255),
    numero VARCHAR(20),
    bairro VARCHAR(100),
    cep VARCHAR(9),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    
    -- Dados técnicos/operacionais
    segmento VARCHAR(100),
    areas TEXT[],
    bancos TEXT[],
    ferramentas TEXT[],
    fornecedores TEXT[],
    organizacao TEXT[],
    relatorios TEXT[],
    
    -- Expectativas e objetivos
    expectativas_sucesso TEXT,
    
    -- Plano selecionado
    plano VARCHAR(20) NOT NULL,
    valor_mensal DECIMAL(10,2) NOT NULL,
    
    -- Status do prospect
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Metadados
    origem VARCHAR(50),
    observacoes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_prospects_email_contato ON prospects(email_contato);
CREATE INDEX idx_prospects_cnpj ON prospects(cnpj);
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_plano ON prospects(plano);
CREATE INDEX idx_prospects_created_at ON prospects(created_at);

-- Tentar restaurar dados existentes (mapeando colunas existentes)
INSERT INTO prospects (
    id,
    nome_contato,
    email_contato,
    telefone_contato,
    nome_empresa,
    cnpj,
    plano,
    valor_mensal,
    status,
    created_at,
    updated_at
)
SELECT 
    id,
    COALESCE(nome_contato, 'Nome não informado'),
    email_contato,
    telefone_contato,
    nome_empresa,
    cnpj,
    plano,
    valor_mensal,
    status,
    created_at,
    updated_at
FROM prospects_backup
WHERE EXISTS (SELECT 1 FROM prospects_backup);

-- Limpar backup
DROP TABLE IF EXISTS prospects_backup;