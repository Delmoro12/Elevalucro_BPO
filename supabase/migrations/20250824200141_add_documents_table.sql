-- Tabela de documentos (PDFs, fotos e planilhas)
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Referencia a empresa
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Dados basicos do documento
    nome VARCHAR(255) NOT NULL,
    arquivo VARCHAR(500) NOT NULL, -- Caminho/URL do arquivo
    tipo_documento VARCHAR(30) NOT NULL CHECK (tipo_documento IN ('nfe', 'cupom_fiscal', 'recibo', 'boleto', 'extrato', 'outro')),
    categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('entrada', 'saida')),
    
    -- Dados financeiros extraidos pela IA
    valor VARCHAR(50), -- Valor formatado (ex: "R$ 1.234,56")
    valor_decimal DECIMAL(15,2), -- Valor numerico para calculos
    data_documento DATE, -- Data do documento (extraida do conteudo)
    
    -- Dados das partes envolvidas (extraidos pela IA)
    fornecedor VARCHAR(255), -- Nome do fornecedor/emissor
    cliente VARCHAR(255), -- Nome do cliente/destinatario
    cnpj VARCHAR(18), -- CNPJ formatado XX.XXX.XXX/XXXX-XX
    
    -- Dados especificos do documento (extraidos pela IA)
    numero_nota VARCHAR(100), -- Numero da nota fiscal/documento
    descricao TEXT, -- Descricao dos produtos/servicos
    
    -- Dados complementares (preenchidos pelo usuario)
    forma_pagamento VARCHAR(100), -- PIX, cartao, dinheiro, etc
    centro_custo VARCHAR(100), -- Centro de custo para classificacao
    
    -- Metadados do arquivo
    tamanho VARCHAR(20), -- Tamanho formatado (ex: "2.5 MB")
    tamanho_bytes BIGINT, -- Tamanho em bytes para calculos
    data_upload TIMESTAMPTZ DEFAULT now(),
    
    -- Status de processamento
    status VARCHAR(30) NOT NULL DEFAULT 'pendente' 
        CHECK (status IN ('processado', 'pendente', 'erro', 'processando')),
    
    -- Dados do processamento pela IA
    confianca_ia INTEGER, -- Nivel de confianca da IA (0-100)
    dados_completos BOOLEAN DEFAULT false, -- Se todos os campos obrigatorios estao preenchidos
    campos_faltantes TEXT[], -- Array com campos que ainda precisam ser preenchidos
    processamento_ia JSONB, -- Dados completos extraidos pela IA
    
    -- Dados especificos para planilhas Excel
    linhas_processadas INTEGER, -- Para acompanhar progresso em planilhas
    linhas_total INTEGER,
    erros_excel TEXT[], -- Erros especificos de planilhas
    
    -- Classificacao e organizacao
    tags TEXT[], -- Tags para classificacao
    observacoes TEXT, -- Observacoes manuais do usuario
    
    -- Auditoria
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ -- Quando foi processado pela IA
);

-- Indices para performance
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

-- Indices para busca de texto
CREATE INDEX IF NOT EXISTS idx_documents_nome_text ON documents USING gin(to_tsvector('portuguese', nome));
CREATE INDEX IF NOT EXISTS idx_documents_fornecedor_text ON documents USING gin(to_tsvector('portuguese', fornecedor));
CREATE INDEX IF NOT EXISTS idx_documents_cliente_text ON documents USING gin(to_tsvector('portuguese', cliente));
CREATE INDEX IF NOT EXISTS idx_documents_descricao_text ON documents USING gin(to_tsvector('portuguese', descricao));
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_documents_campos_faltantes ON documents USING gin(campos_faltantes);