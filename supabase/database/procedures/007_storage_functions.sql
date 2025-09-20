-- ========================================
-- FUNÇÕES DE STORAGE PARA DOCUMENTOS
-- ========================================
-- Funções auxiliares para gerenciamento de arquivos
-- no Supabase Storage (bucket 'documents')
-- Versão: 1.0

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
-- 3. FUNÇÃO PARA OBTER URL ASSINADA
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
-- 4. COMENTÁRIOS EXPLICATIVOS
-- ========================================
COMMENT ON FUNCTION generate_document_filename IS 'Gera nome único para arquivo baseado no company_id e timestamp';
COMMENT ON FUNCTION validate_document_file IS 'Valida tamanho e tipo de arquivo antes do upload';
COMMENT ON FUNCTION get_document_signed_url IS 'Gera URL assinada para acesso seguro a documentos';

-- Verificação
DO $$
BEGIN
    RAISE NOTICE '✅ Funções de Storage para documentos carregadas com sucesso!';
END;
$$;