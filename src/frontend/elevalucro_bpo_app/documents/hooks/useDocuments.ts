import { useState, useEffect } from 'react';
import { useDocumentsService } from '../services/documentsService';
import { Document } from '../types';
import { useAuth } from '../../auth/contexts/AuthContext';

export interface DocumentFilters {
  status?: 'pendente' | 'processado' | 'conciliado' | 'erro';
  categoria?: 'entrada' | 'saida';
  tipo_documento?: 'fiscal' | 'nao_fiscal';
  searchTerm?: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DocumentFilters>({});
  
  const { companyId } = useAuth();
  const documentsService = useDocumentsService();

  const fetchDocuments = async (currentFilters?: DocumentFilters) => {
    // Se não tem companyId ainda, não tenta buscar
    if (!companyId) {
      console.log('⏳ Aguardando companyId para buscar documentos...');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const filtersToUse = currentFilters || filters;
      
      // Buscar todos os documentos
      let docs = await documentsService.getDocuments();
      
      // Aplicar filtros localmente se necessário
      if (filtersToUse.status) {
        docs = docs.filter(doc => doc.status === filtersToUse.status);
      }
      
      if (filtersToUse.categoria) {
        console.log('🔍 Filtrando por categoria:', filtersToUse.categoria);
        docs = docs.filter(doc => doc.categoria === filtersToUse.categoria);
      }
      
      if (filtersToUse.tipo_documento) {
        console.log('🔍 Filtrando por tipo_documento:', filtersToUse.tipo_documento);
        docs = docs.filter(doc => doc.tipo_documento === filtersToUse.tipo_documento);
      }
      
      if (filtersToUse.searchTerm) {
        const term = filtersToUse.searchTerm.toLowerCase();
        docs = docs.filter(doc => 
          doc.nome?.toLowerCase().includes(term) ||
          doc.fornecedor?.toLowerCase().includes(term) ||
          doc.cliente?.toLowerCase().includes(term) ||
          doc.descricao?.toLowerCase().includes(term)
        );
      }
      
      setDocuments(docs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar documentos';
      setError(errorMessage);
      console.error('Erro ao carregar documentos:', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      console.log('🗑️ Hook: Deleting document:', id);
      await documentsService.deleteDocument(id);
      
      // Atualiza o estado local removendo o documento
      setDocuments(prev => {
        const filtered = prev.filter(doc => doc.id !== id);
        console.log('📋 Documents after deletion:', filtered.length, 'remaining');
        return filtered;
      });
      
      console.log('✅ Hook: Document deleted and state updated');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar documento';
      console.error('❌ Hook: Delete error:', err);
      setError(errorMessage);
      return false;
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'pendente' | 'processado' | 'conciliado' | 'erro') => {
    try {
      await documentsService.updateDocumentStatus(id, newStatus);
      
      setDocuments(prev => prev.map(doc => 
        doc.id === id 
          ? { ...doc, status: newStatus, updated_at: new Date().toISOString() }
          : doc
      ));
      return true;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      return false;
    }
  };

  const updateFilters = (newFilters: DocumentFilters) => {
    setFilters(newFilters);
    fetchDocuments(newFilters);
  };

  const refreshDocuments = () => {
    fetchDocuments();
  };

  useEffect(() => {
    // Só busca documentos quando companyId estiver disponível
    if (companyId) {
      fetchDocuments();
    }
  }, [companyId]); // Reage quando companyId mudar

  return {
    documents,
    loading,
    error,
    filters,
    updateFilters,
    deleteDocument: handleDeleteDocument,
    updateStatus: handleUpdateStatus,
    refreshDocuments,
  };
}