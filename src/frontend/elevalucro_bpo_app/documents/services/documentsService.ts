import { supabase } from '@/src/lib/supabase';
import { Document, CreateDocumentRequest, UpdateDocumentRequest } from '../types';
import { useAuth } from '../../auth/contexts/AuthContext';

export const useDocumentsService = () => {
  const { companyId } = useAuth();
  const client = supabase;

  if (!companyId) {
    throw new Error('User must be authenticated with a valid company_id to use documents service');
  }

  // Criar um novo documento
  const createDocument = async (data: CreateDocumentRequest): Promise<Document> => {
    try {
      console.log('📄 Creating document:', data.nome);
      
      // Converter valor formatado para decimal se necessario
      let valorDecimal: number | undefined;
      if (data.valor) {
        const cleanValue = data.valor
          .replace(/[R$\s]/g, '')
          .replace(/\./g, '')
          .replace(',', '.');
        valorDecimal = parseFloat(cleanValue);
      }

      const documentPayload = {
        ...data,
        company_id: companyId,
        valor_decimal: valorDecimal || data.valor_decimal,
        status: 'processado' as const // Marca como processado apos confirmacao do chat
      };

      const { data: document, error } = await client
        .from('documents')
        .insert([documentPayload])
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error creating document:', error);
        throw new Error(`Failed to create document: ${error.message}`);
      }

      console.log('✅ Document created successfully:', document.id);
      return document;
    } catch (error) {
      console.error('❌ Error in createDocument:', error);
      throw error;
    }
  };

  // Buscar documentos da empresa do usuario logado
  const getDocuments = async (): Promise<Document[]> => {
    try {
      console.log('📋 Fetching documents...');
      
      const { data: documents, error } = await client
        .from('documents')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching documents:', error);
        throw new Error(`Failed to fetch documents: ${error.message}`);
      }

      console.log('✅ Documents fetched:', documents?.length || 0);
      return documents || [];
    } catch (error) {
      console.error('❌ Error in getDocuments:', error);
      throw error;
    }
  };

  // Buscar documento por ID
  const getDocument = async (id: string): Promise<Document | null> => {
    try {
      console.log('📄 Fetching document:', id);
      
      const { data: document, error } = await client
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('company_id', companyId)
        .single();

      if (error) {
        console.error('❌ Error fetching document:', error);
        return null;
      }

      console.log('✅ Document fetched:', document?.nome);
      return document;
    } catch (error) {
      console.error('❌ Error in getDocument:', error);
      return null;
    }
  };

  // Atualizar documento
  const updateDocument = async (id: string, data: UpdateDocumentRequest): Promise<Document> => {
    try {
      console.log('📝 Updating document:', id);
      
      // Converter valor formatado para decimal se necessario
      let valorDecimal: number | undefined;
      if (data.valor) {
        const cleanValue = data.valor
          .replace(/[R$\s]/g, '')
          .replace(/\./g, '')
          .replace(',', '.');
        valorDecimal = parseFloat(cleanValue);
      }

      const updatePayload = {
        ...data,
        valor_decimal: valorDecimal || data.valor_decimal,
        updated_at: new Date().toISOString()
      };

      // Remove o ID do payload
      const { id: _, ...updateData } = updatePayload;

      const { data: document, error } = await client
        .from('documents')
        .update(updateData)
        .eq('id', id)
        .eq('company_id', companyId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error updating document:', error);
        throw new Error(`Failed to update document: ${error.message}`);
      }

      console.log('✅ Document updated successfully');
      return document;
    } catch (error) {
      console.error('❌ Error in updateDocument:', error);
      throw error;
    }
  };

  // Deletar documento
  const deleteDocument = async (id: string): Promise<void> => {
    try {
      console.log('🗑️ Deleting document:', id);
      
      const { error } = await client
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (error) {
        console.error('❌ Error deleting document:', error);
        throw new Error(`Failed to delete document: ${error.message}`);
      }

      console.log('✅ Document deleted successfully');
    } catch (error) {
      console.error('❌ Error in deleteDocument:', error);
      throw error;
    }
  };

  // Buscar documentos por status
  const getDocumentsByStatus = async (status: 'pendente' | 'processado' | 'conciliado' | 'erro'): Promise<Document[]> => {
    try {
      console.log('📋 Fetching documents by status:', status);
      
      const { data: documents, error } = await client
        .from('documents')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching documents by status:', error);
        throw new Error(`Failed to fetch documents by status: ${error.message}`);
      }

      console.log('✅ Documents by status fetched:', documents?.length || 0);
      return documents || [];
    } catch (error) {
      console.error('❌ Error in getDocumentsByStatus:', error);
      throw error;
    }
  };

  // Buscar documentos por categoria
  const getDocumentsByCategory = async (categoria: 'entrada' | 'saida'): Promise<Document[]> => {
    try {
      console.log('📋 Fetching documents by category:', categoria);
      
      const { data: documents, error } = await client
        .from('documents')
        .select('*')
        .eq('company_id', companyId)
        .eq('categoria', categoria)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching documents by category:', error);
        throw new Error(`Failed to fetch documents by category: ${error.message}`);
      }

      console.log('✅ Documents by category fetched:', documents?.length || 0);
      return documents || [];
    } catch (error) {
      console.error('❌ Error in getDocumentsByCategory:', error);
      throw error;
    }
  };

  // Buscar documentos com dados incompletos
  const getIncompleteDocuments = async (): Promise<Document[]> => {
    try {
      console.log('📋 Fetching incomplete documents...');
      
      const { data: documents, error } = await client
        .from('documents')
        .select('*')
        .eq('company_id', companyId)
        .eq('dados_completos', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching incomplete documents:', error);
        throw new Error(`Failed to fetch incomplete documents: ${error.message}`);
      }

      console.log('✅ Incomplete documents fetched:', documents?.length || 0);
      return documents || [];
    } catch (error) {
      console.error('❌ Error in getIncompleteDocuments:', error);
      throw error;
    }
  };

  // Atualizar status do documento
  const updateDocumentStatus = async (id: string, status: 'pendente' | 'processado' | 'conciliado' | 'erro'): Promise<void> => {
    try {
      console.log('📝 Updating document status:', id, status);
      
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      // Status será atualizado conforme o valor recebido

      const { error } = await client
        .from('documents')
        .update(updateData)
        .eq('id', id)
        .eq('company_id', companyId);

      if (error) {
        console.error('❌ Error updating document status:', error);
        throw new Error(`Failed to update document status: ${error.message}`);
      }

      console.log('✅ Document status updated successfully');
    } catch (error) {
      console.error('❌ Error in updateDocumentStatus:', error);
      throw error;
    }
  };

  // Buscar por texto (full-text search)
  const searchDocuments = async (query: string): Promise<Document[]> => {
    try {
      console.log('🔍 Searching documents:', query);
      
      const { data: documents, error } = await client
        .from('documents')
        .select('*')
        .eq('company_id', companyId)
        .or(`nome.ilike.%${query}%,fornecedor.ilike.%${query}%,cliente.ilike.%${query}%,descricao.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error searching documents:', error);
        throw new Error(`Failed to search documents: ${error.message}`);
      }

      console.log('✅ Documents search completed:', documents?.length || 0);
      return documents || [];
    } catch (error) {
      console.error('❌ Error in searchDocuments:', error);
      throw error;
    }
  };

  return {
    createDocument,
    getDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
    getDocumentsByStatus,
    getDocumentsByCategory,
    getIncompleteDocuments,
    updateDocumentStatus,
    searchDocuments
  };
};