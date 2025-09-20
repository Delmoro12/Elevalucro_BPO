import { supabase } from '@/src/lib/supabase';

export interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
  url?: string;
}

export interface DownloadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const useStorageService = () => {
  
  // Upload de arquivo para o storage
  const uploadFile = async (
    file: File, 
    companyId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> => {
    try {
      console.log('📤 Starting file upload:', file.name);
      
      // Validar arquivo
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'Arquivo muito grande. Tamanho máximo: 50MB'
        };
      }

      // Tipos permitidos
      const allowedTypes = [
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
      ];

      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: `Tipo de arquivo não permitido: ${file.type}`
        };
      }

      // Gerar nome único do arquivo usando a função SQL
      const { data: fileNameData, error: nameError } = await supabase
        .rpc('generate_document_filename', {
          company_id: companyId,
          original_filename: file.name
        });

      if (nameError || !fileNameData) {
        console.error('❌ Error generating filename:', nameError);
        return {
          success: false,
          error: 'Erro ao gerar nome do arquivo'
        };
      }

      const filePath = fileNameData;
      console.log('📝 Generated file path:', filePath);

      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload error:', error);
        return {
          success: false,
          error: `Erro no upload: ${error.message}`
        };
      }

      console.log('✅ File uploaded successfully:', data.path);

      // Obter URL pública (mesmo sendo privado, para visualização)
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(data.path);

      return {
        success: true,
        filePath: data.path,
        url: urlData.publicUrl
      };

    } catch (error) {
      console.error('❌ Upload service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no upload'
      };
    }
  };

  // Download de arquivo do storage
  const downloadFile = async (filePath: string): Promise<DownloadResult> => {
    try {
      console.log('📥 Starting file download:', filePath);

      // Obter URL assinada para download seguro (válida por 1 hora)
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600); // 1 hora

      if (error) {
        console.error('❌ Download error:', error);
        return {
          success: false,
          error: `Erro no download: ${error.message}`
        };
      }

      console.log('✅ Download URL created:', data.signedUrl);

      return {
        success: true,
        url: data.signedUrl
      };

    } catch (error) {
      console.error('❌ Download service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no download'
      };
    }
  };

  // Deletar arquivo do storage
  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      console.log('🗑️ Deleting file:', filePath);

      const { error } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (error) {
        console.error('❌ Delete error:', error);
        return false;
      }

      console.log('✅ File deleted successfully');
      return true;

    } catch (error) {
      console.error('❌ Delete service error:', error);
      return false;
    }
  };

  // Obter URL de visualização (para preview)
  const getFileUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  // Listar arquivos de uma empresa
  const listCompanyFiles = async (companyId: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .list(companyId, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('❌ Error listing files:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ List files error:', error);
      return [];
    }
  };

  return {
    uploadFile,
    downloadFile,
    deleteFile,
    getFileUrl,
    listCompanyFiles
  };
};