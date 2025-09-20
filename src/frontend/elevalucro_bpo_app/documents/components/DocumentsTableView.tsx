'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText,
  FileSpreadsheet,
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle,
  Trash2,
  Loader2
} from 'lucide-react';
import { DataTable, Column, FilterOption, ActionButton, BulkAction } from '../../shared/components/DataTable';
import { DocumentViewModal } from './DocumentViewModal';
import { useDocuments, DocumentFilters } from '../hooks/useDocuments';
import { Document } from '../types';

type FilterStatus = 'todos' | 'processado' | 'pendente' | 'conciliado' | 'erro';
type TabType = 'pdfs_fotos' | 'excel';

interface DocumentsTableViewProps {
  onOpenDocumentModal: () => void;
  onOpenExcelModal: () => void;
}

// Função helper para formatar data
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
};

// Função helper para formatar data e hora
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

// Função helper para formatar tamanho de arquivo
const formatFileSize = (bytes?: number) => {
  if (!bytes) return '-';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const DocumentsTableView: React.FC<DocumentsTableViewProps> = ({ 
  onOpenDocumentModal, 
  onOpenExcelModal 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('pdfs_fotos');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('todos');
  const [tipoFilter, setTipoFilter] = useState<'todos' | 'fiscal' | 'nao_fiscal'>('todos');
  const [categoriaFilter, setCategoriaFilter] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Hook para buscar documentos reais
  const {
    documents,
    loading,
    error,
    updateFilters,
    deleteDocument,
    updateStatus,
    refreshDocuments
  } = useDocuments();
  
  // Atualizar filtros de seleção (dropdowns) imediatamente
  useEffect(() => {
    const filters: DocumentFilters = {};
    
    if (statusFilter !== 'todos') {
      filters.status = statusFilter as 'pendente' | 'processado' | 'conciliado' | 'erro';
    }
    
    if (tipoFilter !== 'todos') {
      filters.tipo_documento = tipoFilter as 'fiscal' | 'nao_fiscal';
    }
    
    if (categoriaFilter !== 'todos') {
      filters.categoria = categoriaFilter as 'entrada' | 'saida';
    }
    
    console.log('🔍 Aplicando filtros (dropdowns):', filters);
    updateFilters(filters);
  }, [statusFilter, tipoFilter, categoriaFilter]);

  // Debounce para busca de texto
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters: DocumentFilters = {};
      
      if (statusFilter !== 'todos') {
        filters.status = statusFilter as 'pendente' | 'processado' | 'conciliado' | 'erro';
      }
      
      if (tipoFilter !== 'todos') {
        filters.tipo_documento = tipoFilter as 'fiscal' | 'nao_fiscal';
      }
      
      if (categoriaFilter !== 'todos') {
        filters.categoria = categoriaFilter as 'entrada' | 'saida';
      }
      
      if (searchTerm) {
        filters.searchTerm = searchTerm;
      }
      
      console.log('🔍 Aplicando filtros com busca:', filters);
      updateFilters(filters);
    }, 300); // 300ms de debounce
    
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, tipoFilter, categoriaFilter]);

  // Callback estável para search
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Função para obter o tipo de documento formatado
  const getDocumentTypeLabel = (tipo?: string) => {
    const typeMap: Record<string, string> = {
      'fiscal': 'Fiscal',
      'nao_fiscal': 'Não Fiscal'
    };
    return typeMap[tipo || ''] || tipo || 'N/A';
  };


  const getStatusText = (status: string) => {
    switch (status) {
      case 'processado':
        return 'Processado';
      case 'pendente':
        return 'Pendente';
      case 'conciliado':
        return 'Conciliado';
      case 'erro':
        return 'Erro';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400';
      case 'processado':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400';
      case 'conciliado':
        return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400';
      case 'erro':
        return 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };

  // Handlers para modal
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedDocument(null);
    setSelectedExcelFile(null);
  };

  const handleBulkDelete = async (items: Document[]) => {
    if (!items || items.length === 0) return;
    
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir ${items.length} documento${items.length > 1 ? 's' : ''}?`
    );
    
    if (!confirmed) return;
    
    console.log('🗑️ Table: Starting bulk delete for documents:', items.map(d => d.id));
    
    try {
      // Delete cada documento individualmente e aguarda resultado
      const results = [];
      for (const document of items) {
        const id = document.id;
        console.log(`🗑️ Table: Deleting document ${id}...`);
        const result = await deleteDocument(id);
        results.push(result);
        console.log(`${result ? '✅' : '❌'} Table: Document ${id} deletion result:`, result);
      }
      
      // Verificar se todos foram deletados com sucesso
      const allDeleted = results.every(result => result);
      
      if (allDeleted) {
        // Limpa seleção após exclusão bem-sucedida
        setSelectedDocuments(new Set());
        console.log('✅ Table: All documents deleted successfully');
      } else {
        console.warn('⚠️ Table: Some documents failed to delete');
        alert('Alguns documentos não puderam ser excluídos. Verifique o console para detalhes.');
      }
      
    } catch (error) {
      console.error('❌ Table: Error in bulk delete:', error);
      alert('Erro ao excluir documentos. Tente novamente.');
    }
  };

  // Colunas para a tabela de PDFs e Fotos
  const documentColumns: Column<Document>[] = [
    {
      key: 'nome',
      label: 'Nome do Documento',
      render: (value, row) => (
        <div>
          <div className="text-sm font-medium text-slate-900 dark:text-white">
            {row.nome}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {row.cliente || 'Cliente não informado'} • {row.tamanho}
          </div>
        </div>
      )
    },
    {
      key: 'tipo_documento',
      label: 'Tipo',
      render: (value, row) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.tipo_documento === 'fiscal'
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
        }`}>
          {row.tipo_documento === 'fiscal' ? 'Fiscal' : 'Não Fiscal'}
        </span>
      )
    },
    {
      key: 'categoria',
      label: 'Categoria',
      render: (value, row) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.categoria === 'entrada'
            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
            : 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
        }`}>
          {row.categoria === 'entrada' ? 'Entrada' : 'Saída'}
        </span>
      )
    },
    {
      key: 'valor',
      label: 'Valor',
      render: (value) => (
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {value || '-'}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {getStatusText(row.status)}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Upload',
      render: (value) => (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {formatDateTime(value)}
        </div>
      )
    }
  ];

  // Colunas para a tabela de Excel
  const excelColumns: Column<ExcelFile>[] = [
    {
      key: 'nome',
      label: 'Nome do Arquivo',
      render: (value, row) => (
        <div className="flex items-center">
          <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-2" />
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              {row.nome}
            </div>
            {row.erros && row.erros.length > 0 && (
              <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                {row.erros[0]}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {getStatusText(row.status)}
        </span>
      )
    },
    {
      key: 'progresso',
      label: 'Progresso',
      render: (value, row) => {
        if (row.status === 'processando' && row.linhasProcessadas && row.linhasTotal) {
          return (
            <div className="w-32">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span>{row.linhasProcessadas}/{row.linhasTotal}</span>
                <span>{Math.round((row.linhasProcessadas / row.linhasTotal) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div 
                  className="bg-emerald-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${(row.linhasProcessadas / row.linhasTotal) * 100}%` }}
                />
              </div>
            </div>
          );
        } else if (row.linhasTotal) {
          return (
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {row.linhasTotal} linhas
            </span>
          );
        }
        return <span className="text-sm text-slate-400">-</span>;
      }
    },
    {
      key: 'dataUpload',
      label: 'Data Upload',
      render: (value) => (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {value}
        </div>
      )
    },
    {
      key: 'tamanho',
      label: 'Tamanho',
      render: (value) => (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {value}
        </div>
      )
    }
  ];

  // Filtros baseados em dados reais
  const getFilters = (): FilterOption[] => {
    // Filtrar documentos baseado na tab ativa
    const filteredByTab = activeTab === 'excel' 
      ? documents.filter(d => d.arquivo?.includes('.xls') || d.arquivo?.includes('.xlsx') || d.arquivo?.includes('.csv'))
      : documents.filter(d => !d.arquivo?.includes('.xls') && !d.arquivo?.includes('.xlsx') && !d.arquivo?.includes('.csv'));
    
    const counts = {
      todos: filteredByTab.length,
      processado: filteredByTab.filter(d => d.status === 'processado').length,
      pendente: filteredByTab.filter(d => d.status === 'pendente').length,
      conciliado: filteredByTab.filter(d => d.status === 'conciliado').length,
      erro: filteredByTab.filter(d => d.status === 'erro').length
    };

    return [
      { key: 'todos', label: 'Todos', count: counts.todos },
      { key: 'processado', label: 'Processados', count: counts.processado },
      { key: 'pendente', label: 'Pendentes', count: counts.pendente },
      { key: 'conciliado', label: 'Conciliados', count: counts.conciliado },
      { key: 'erro', label: 'Com Erro', count: counts.erro }
    ];
  };

  // Ações para documentos
  const documentActions: ActionButton[] = [
    {
      key: 'view',
      icon: Eye,
      label: 'Visualizar',
      onClick: (item) => handleViewDocument(item)
    },
    {
      key: 'download',
      icon: Download,
      label: 'Download',
      onClick: (item) => console.log('Download:', item)
    },
    {
      key: 'reprocess',
      icon: RefreshCw,
      label: 'Reprocessar',
      onClick: (item) => console.log('Reprocessar:', item),
      showWhen: (item) => item.status === 'erro'
    }
  ];

  // Ações para Excel
  const excelActions: ActionButton[] = [
    {
      key: 'view',
      icon: Eye,
      label: 'Visualizar',
      onClick: (item) => handleViewExcelFile(item)
    },
    {
      key: 'validate',
      icon: CheckCircle,
      label: 'Validar',
      onClick: (item) => console.log('Validar:', item),
      variant: 'primary',
      showWhen: (item) => item.status === 'aguardando_validacao'
    },
    {
      key: 'reprocess',
      icon: RefreshCw,
      label: 'Reprocessar',
      onClick: (item) => console.log('Reprocessar Excel:', item),
      showWhen: (item) => item.status === 'erro'
    }
  ];

  // Ações em massa
  const bulkActions: BulkAction[] = [
    {
      key: 'delete',
      label: 'Excluir Selecionados',
      icon: Trash2,
      variant: 'danger',
      onClick: handleBulkDelete
    }
  ];

  return (
    <div className="relative">
      {/* Tabs */}
      <div className="flex mb-0">
        <button
          onClick={() => setActiveTab('pdfs_fotos')}
          className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'pdfs_fotos'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-t border-l border-r border-slate-200 dark:border-slate-700'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            PDFs e Fotos
          </div>
        </button>
        <button
          onClick={() => setActiveTab('excel')}
          className={`px-6 py-3 font-medium text-sm rounded-t-lg ml-2 transition-colors ${
            activeTab === 'excel'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-t border-l border-r border-slate-200 dark:border-slate-700'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Arquivos Excel
          </div>
        </button>
      </div>

      {/* Filtros Adicionais */}
      <div className="bg-white dark:bg-slate-800 p-4 border-l border-r border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tipo:
            </label>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value as 'todos' | 'fiscal' | 'nao_fiscal')}
              className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="todos">Todos</option>
              <option value="fiscal">Fiscal</option>
              <option value="nao_fiscal">Não Fiscal</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Categoria:
            </label>
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value as 'todos' | 'entrada' | 'saida')}
              className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="todos">Todos</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-lg rounded-tl-none rounded-tr-none">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={refreshDocuments}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <DataTable
            data={activeTab === 'excel' 
              ? documents.filter(d => d.arquivo?.includes('.xls') || d.arquivo?.includes('.xlsx') || d.arquivo?.includes('.csv'))
              : documents.filter(d => !d.arquivo?.includes('.xls') && !d.arquivo?.includes('.xlsx') && !d.arquivo?.includes('.csv'))
            }
            columns={documentColumns}
            selectable
            selectedItems={selectedDocuments}
            onSelectionChange={setSelectedDocuments}
            searchable
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Buscar documentos..."
            filters={getFilters()}
            activeFilter={statusFilter}
            onFilterChange={(filter) => setStatusFilter(filter as FilterStatus)}
            actions={documentActions}
            bulkActions={bulkActions}
            primaryAction={{
              label: activeTab === 'excel' ? 'Importar Excel' : 'Adicionar Documento',
              onClick: activeTab === 'excel' ? onOpenExcelModal : onOpenDocumentModal
            }}
            emptyStateIcon={FileText}
            emptyStateTitle={activeTab === 'excel' ? "Nenhum arquivo Excel encontrado" : "Nenhum documento encontrado"}
            emptyStateDescription={activeTab === 'excel' ? "Clique em 'Importar Excel' para começar" : "Clique em 'Adicionar Documento' para começar"}
          />
        )}
      </div>

      {/* Modal de Visualização */}
      {isViewModalOpen && selectedDocument && (
        <DocumentViewModal
          isOpen={isViewModalOpen}
          onClose={handleCloseModal}
          document={selectedDocument}
        />
      )}
    </div>
  );
};