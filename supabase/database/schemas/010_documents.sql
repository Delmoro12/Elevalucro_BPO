-- Tabela de documentos (PDFs, fotos e planilhas)
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Referência à empresa
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Dados básicos do documento
    nome VARCHAR(255) NOT NULL,
    arquivo VARCHAR(500) NOT NULL, -- Caminho/URL do arquivo
    tipo_documento VARCHAR(30) NOT NULL CHECK (tipo_documento IN ('nfe', 'cupom_fiscal', 'recibo', 'boleto', 'extrato', 'outro')),
    categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('entrada', 'saida')),
    
    -- Dados financeiros extraídos pela IA
    valor VARCHAR(50), -- Valor formatado (ex: "R$ 1.234,56")
    valor_decimal DECIMAL(15,2), -- Valor numérico para cálculos
    data_documento DATE, -- Data do documento (extraída do conteúdo)
    
    -- Dados das partes envolvidas (extraídos pela IA)
    fornecedor VARCHAR(255), -- Nome do fornecedor/emissor
    cliente VARCHAR(255), -- Nome do cliente/destinatário
    cnpj VARCHAR(18), -- CNPJ formatado XX.XXX.XXX/XXXX-XX
    
    -- Dados específicos do documento (extraídos pela IA)
    numero_nota VARCHAR(100), -- Número da nota fiscal/documento
    descricao TEXT, -- Descrição dos produtos/serviços
    
    -- Dados complementares (preenchidos pelo usuário)
    forma_pagamento VARCHAR(100), -- PIX, cartão, dinheiro, etc
    centro_custo VARCHAR(100), -- Centro de custo para classificação
    
    -- Metadados do arquivo
    tamanho VARCHAR(20), -- Tamanho formatado (ex: "2.5 MB")
    tamanho_bytes BIGINT, -- Tamanho em bytes para cálculos
    data_upload TIMESTAMPTZ DEFAULT now(),
    
    -- Status de processamento
    status VARCHAR(30) NOT NULL DEFAULT 'pendente' 
        CHECK (status IN ('pendente', 'processado', 'conciliado', 'erro')),
    
    -- Dados do processamento pela IA
    confianca_ia INTEGER, -- Nível de confiança da IA (0-100)
    dados_completos BOOLEAN DEFAULT false, -- Se todos os campos obrigatórios estão preenchidos
    processamento_ia JSONB, -- Dados completos extraídos pela IA
    
    -- Dados específicos para planilhas Excel
    linhas_processadas INTEGER, -- Para acompanhar progresso em planilhas
    linhas_total INTEGER,
    erros_excel TEXT[], -- Erros específicos de planilhas
    
    -- Classificação e organização
    tags TEXT[], -- Tags para classificação
    observacoes TEXT, -- Observações manuais do usuário
    
    -- Auditoria
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_tipo_documento ON documents(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_documents_categoria ON documents(categoria);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_data_documento ON documents(data_documento);
CREATE INDEX IF NOT EXISTS idx_documents_data_upload ON documents(data_upload);
CREATE INDEX IF NOT EXISTS idx_documents_fornecedor ON documents(fornecedor);
CREATE INDEX IF NOT EXISTS idx_documents_cliente ON documents(cliente);
CREATE INDEX IF NOT EXISTS idx_documents_cnpj ON documents(cnpj);
CREATE INDEX IF NOT EXISTS idx_documents_valor_decimal ON documents(valor_decimal);
CREATE INDEX IF NOT EXISTS idx_documents_dados_completos ON documents(dados_completos);

-- Índices para busca de texto
CREATE INDEX IF NOT EXISTS idx_documents_nome_text ON documents USING gin(to_tsvector('portuguese', nome));
CREATE INDEX IF NOT EXISTS idx_documents_fornecedor_text ON documents USING gin(to_tsvector('portuguese', fornecedor));
CREATE INDEX IF NOT EXISTS idx_documents_cliente_text ON documents USING gin(to_tsvector('portuguese', cliente));
CREATE INDEX IF NOT EXISTS idx_documents_descricao_text ON documents USING gin(to_tsvector('portuguese', descricao));
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING gin(tags);