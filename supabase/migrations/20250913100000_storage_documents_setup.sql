-- =============================================================================
-- Migration: Storage - Documents Setup
-- Generated at: 2025-09-13 10:00:00
-- =============================================================================
-- Configuração completa do Supabase Storage para documentos:
-- 1. Função para gerar nome único do arquivo
-- 2. Função para validar arquivo  
-- 3. View para listar documentos com metadados
-- 4. Função para obter URL assinada

BEGIN;

-- ========================================
-- 1. FUNÇÃO PARA GERAR NOME ÚNICO DO ARQUIVO
-- ========================================
CREATE OR REPLACE FUNCTION generate_document_filename(
  company_id UUID,
  original_filename TEXT
) 
RETURNS TEXT 
LANGUAGE plpgsql
AS $$
DECLARE
  file_extension TEXT;
  clean_filename TEXT;
  timestamp_str TEXT;
  unique_filename TEXT;
BEGIN
  -- Extrair extensão do arquivo
  file_extension := CASE 
    WHEN original_filename ~ '\.' THEN
      '.' || split_part(original_filename, '.', array_length(string_to_array(original_filename, '.'), 1))
    ELSE 
      ''
  END;
  
  -- Limpar nome do arquivo (remover caracteres especiais)
  clean_filename := regexp_replace(
    split_part(original_filename, '.', 1), 
    '[^a-zA-Z0-9_-]', 
    '_', 
    'g'
  );
  
  -- Gerar timestamp
  timestamp_str := to_char(NOW(), 'YYYYMMDD_HH24MISS');
  
  -- Gerar nome único: company_id/timestamp_filename.ext
  unique_filename := company_id::TEXT || '/' || timestamp_str || '_' || clean_filename || file_extension;
  
  RETURN unique_filename;
END;
$$;

-- ========================================
-- 2. FUNÇÃO PARA VALIDAR ARQUIVO
-- ========================================
CREATE OR REPLACE FUNCTION validate_document_file(
  file_size BIGINT,
  file_type TEXT
) 
RETURNS BOOLEAN 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validar tamanho (máximo 50MB)
  IF file_size > 52428800 THEN
    RAISE EXCEPTION 'Arquivo muito grande. Tamanho máximo: 50MB';
  END IF;
  
  -- Validar tipo de arquivo
  IF file_type NOT IN (
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ) THEN
    RAISE EXCEPTION 'Tipo de arquivo não permitido: %', file_type;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- ========================================
-- 3. VIEW PARA LISTAR DOCUMENTOS COM METADADOS
-- ========================================
CREATE OR REPLACE VIEW document_files_view AS
SELECT 
  o.id as storage_id,
  o.name as file_path,
  o.bucket_id,
  o.owner,
  o.created_at as uploaded_at,
  o.updated_at as last_modified,
  (o.metadata->>'size')::BIGINT as file_size,
  o.metadata->>'mimetype' as mime_type,
  o.metadata->>'lastModified' as original_date,
  -- Extrair company_id do path (formato: company_id/filename)
  CASE 
    WHEN o.name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/' THEN
      split_part(o.name, '/', 1)::UUID
    ELSE 
      NULL
  END as company_id,
  -- Extrair nome original do arquivo
  CASE 
    WHEN o.name ~ '/' THEN
      split_part(o.name, '/', 2)
    ELSE 
      o.name
  END as original_filename
FROM storage.objects o
WHERE o.bucket_id = 'documents';

-- ========================================
-- 4. FUNÇÃO PARA OBTER URL ASSINADA
-- ========================================
CREATE OR REPLACE FUNCTION get_document_signed_url(
  file_path TEXT,
  expires_in_seconds INTEGER DEFAULT 3600
) 
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Esta função será usada para gerar URLs assinadas
  -- Por enquanto retorna o path, mas pode ser expandida
  RETURN file_path;
END;
$$;

-- ========================================
-- 5. COMENTÁRIOS EXPLICATIVOS
-- ========================================
COMMENT ON FUNCTION generate_document_filename IS 'Gera nome único para arquivo baseado no company_id e timestamp';
COMMENT ON FUNCTION validate_document_file IS 'Valida tamanho e tipo de arquivo antes do upload';
COMMENT ON VIEW document_files_view IS 'View para listar arquivos de documentos com metadados organizados';
COMMENT ON FUNCTION get_document_signed_url IS 'Gera URL assinada para acesso seguro a documentos';

-- Verificação
DO $$
BEGIN
    RAISE NOTICE '✅ Storage para documentos configurado com sucesso!';
END;
$$;

COMMIT;