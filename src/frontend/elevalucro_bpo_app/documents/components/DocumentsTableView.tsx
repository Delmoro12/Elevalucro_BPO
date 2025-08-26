'use client';

import React, { useState } from 'react';
import { 
  FileText,
  FileSpreadsheet,
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { DataTable, Column, FilterOption, ActionButton, BulkAction } from '../../shared/components/DataTable';
import { DocumentViewModal } from './DocumentViewModal';

type FilterStatus = 'todos' | 'processados' | 'pendentes' | 'erro';
type TabType = 'pdfs_fotos' | 'excel';

interface Document {
  id: string;
  nome: string;
  tipo: 'fiscal' | 'nao_fiscal';
  categoria: 'entrada' | 'saida';
  valor?: string;
  data: string;
  empresaPessoa?: string;
  status: 'processado' | 'pendente' | 'erro';
  arquivo: string;
  tamanho?: string;
  dataUpload?: string;
}

interface ExcelFile {
  id: string;
  nome: string;
  status: 'processando' | 'processado' | 'erro' | 'aguardando_validacao';
  dataUpload: string;
  tamanho: string;
  linhasProcessadas?: number;
  linhasTotal?: number;
  erros?: string[];
}

interface DocumentsTableViewProps {
  onOpenDocumentModal: () => void;
  onOpenExcelModal: () => void;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    nome: 'Nota Fiscal 123456',
    tipo: 'fiscal',
    categoria: 'entrada',
    valor: 'R$ 2.500,00',
    data: '15/01/2025',
    empresaPessoa: 'Tech Solutions Ltda',
    status: 'processado',
    arquivo: 'nf_123456.pdf',
    tamanho: '1.2 MB',
    dataUpload: '15/01/2025 14:30'
  },
  {
    id: '2',
    nome: 'Cupom Fiscal Loja ABC',
    tipo: 'fiscal',
    categoria: 'saida',
    valor: 'R$ 450,00',
    data: '14/01/2025',
    empresaPessoa: 'Loja ABC Material',
    status: 'processado',
    arquivo: 'cupom_abc.jpg',
    tamanho: '850 KB',
    dataUpload: '14/01/2025 10:15'
  },
  {
    id: '3',
    nome: 'Recibo Pagamento',
    tipo: 'nao_fiscal',
    categoria: 'saida',
    valor: 'R$ 1.200,00',
    data: '13/01/2025',
    empresaPessoa: 'João Silva Serviços',
    status: 'processado',
    arquivo: 'recibo_joao.pdf',
    tamanho: '320 KB',
    dataUpload: '13/01/2025 16:45'
  },
  {
    id: '4',
    nome: 'Extrato Bancário',
    tipo: 'nao_fiscal',
    categoria: 'entrada',
    data: '12/01/2025',
    empresaPessoa: 'Banco do Brasil',
    status: 'pendente',
    arquivo: 'extrato_jan.pdf',
    tamanho: '2.1 MB',
    dataUpload: '12/01/2025 09:00'
  },
  {
    id: '5',
    nome: 'NFe Venda Online',
    tipo: 'fiscal',
    categoria: 'entrada',
    valor: 'R$ 890,00',
    data: '11/01/2025',
    empresaPessoa: 'Maria Santos',
    status: 'processado',
    arquivo: 'nfe_venda.xml',
    tamanho: '45 KB',
    dataUpload: '11/01/2025 11:30'
  },
  {
    id: '6',
    nome: 'Conta de Luz',
    tipo: 'nao_fiscal',
    categoria: 'saida',
    valor: 'R$ 342,15',
    data: '10/01/2025',
    empresaPessoa: 'CEMIG',
    status: 'erro',
    arquivo: 'conta_luz_jan.pdf',
    tamanho: '180 KB',
    dataUpload: '10/01/2025 15:20'
  }
];

const mockExcelFiles: ExcelFile[] = [
  {
    id: '1',
    nome: 'Vendas_Janeiro_2025.xlsx',
    status: 'processado',
    dataUpload: '15/01/2025 14:00',
    tamanho: '3.5 MB',
    linhasProcessadas: 1250,
    linhasTotal: 1250
  },
  {
    id: '2',
    nome: 'Relatorio_Despesas_Q1.csv',
    status: 'aguardando_validacao',
    dataUpload: '14/01/2025 16:30',
    tamanho: '1.8 MB',
    linhasProcessadas: 450,
    linhasTotal: 450
  },
  {
    id: '3',
    nome: 'Planilha_Fornecedores.xls',
    status: 'processando',
    dataUpload: '15/01/2025 17:45',
    tamanho: '2.2 MB',
    linhasProcessadas: 120,
    linhasTotal: 300
  },
  {
    id: '4',
    nome: 'Dados_Incorretos.xlsx',
    status: 'erro',
    dataUpload: '13/01/2025 10:00',
    tamanho: '500 KB',
    erros: ['Formato de data inválido na linha 45', 'Valores não numéricos na coluna G']
  }
];

export const DocumentsTableView: React.FC<DocumentsTableViewProps> = ({ 
  onOpenDocumentModal, 
  onOpenExcelModal 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('pdfs_fotos');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [selectedExcelFiles, setSelectedExcelFiles] = useState<Set<string>>(new Set());
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedExcelFile, setSelectedExcelFile] = useState<ExcelFile | null>(null);
  const [modalType, setModalType] = useState<'document' | 'excel'>('document');

  const getFilteredDocuments = () => {
    let filtered = mockDocuments;
    
    if (statusFilter !== 'todos') {
      const statusMap = {
        'processados': 'processado',
        'pendentes': 'pendente',
        'erro': 'erro'
      };
      filtered = filtered.filter(doc => doc.status === statusMap[statusFilter as keyof typeof statusMap]);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.empresaPessoa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.arquivo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getFilteredExcelFiles = () => {
    let filtered = mockExcelFiles;
    
    if (statusFilter !== 'todos') {
      const statusMap = {
        'processados': 'processado',
        'pendentes': 'aguardando_validacao',
        'erro': 'erro'
      };
      const mappedStatus = statusMap[statusFilter as keyof typeof statusMap];
      if (mappedStatus) {
        filtered = filtered.filter(file => 
          file.status === mappedStatus || 
          (statusFilter === 'pendentes' && file.status === 'processando')
        );
      }
    }
    
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processado':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'pendente':
      case 'processando':
      case 'aguardando_validacao':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'erro':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processado':
        return 'Processado';
      case 'pendente':
        return 'Pendente';
      case 'processando':
        return 'Processando';
      case 'aguardando_validacao':
        return 'Aguardando Validação';
      case 'erro':
        return 'Erro';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processado':
        return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400';
      case 'pendente':
      case 'processando':
      case 'aguardando_validacao':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400';
      case 'erro':
        return 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };

  // Handlers para modal
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setSelectedExcelFile(null);
    setModalType('document');
    setIsViewModalOpen(true);
  };

  const handleViewExcelFile = (excelFile: ExcelFile) => {
    setSelectedExcelFile(excelFile);
    setSelectedDocument(null);
    setModalType('excel');
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedDocument(null);
    setSelectedExcelFile(null);
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
            {row.arquivo} • {row.tamanho}
          </div>
        </div>
      )
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (value, row) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.tipo === 'fiscal'
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
        }`}>
          {row.tipo === 'fiscal' ? 'Fiscal' : 'Não Fiscal'}
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
      key: 'empresaPessoa',
      label: 'Empresa/Pessoa',
      render: (value) => (
        <div className="text-sm text-slate-900 dark:text-white">
          {value || '-'}
        </div>
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
      key: 'data',
      label: 'Data',
      render: (value) => (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {value}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => (
        <div className="flex items-center space-x-1">
          {getStatusIcon(row.status)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
            {getStatusText(row.status)}
          </span>
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
        <div className="flex items-center space-x-1">
          {getStatusIcon(row.status)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
            {getStatusText(row.status)}
          </span>
        </div>
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

  // Filtros
  const getFilters = (): FilterOption[] => {
    const counts = {
      todos: activeTab === 'pdfs_fotos' ? mockDocuments.length : mockExcelFiles.length,
      processados: activeTab === 'pdfs_fotos' 
        ? mockDocuments.filter(d => d.status === 'processado').length
        : mockExcelFiles.filter(f => f.status === 'processado').length,
      pendentes: activeTab === 'pdfs_fotos'
        ? mockDocuments.filter(d => d.status === 'pendente').length
        : mockExcelFiles.filter(f => f.status === 'aguardando_validacao' || f.status === 'processando').length,
      erro: activeTab === 'pdfs_fotos'
        ? mockDocuments.filter(d => d.status === 'erro').length
        : mockExcelFiles.filter(f => f.status === 'erro').length
    };

    return [
      { key: 'todos', label: 'Todos', count: counts.todos },
      { key: 'processados', label: 'Processados', count: counts.processados },
      { key: 'pendentes', label: 'Pendentes', count: counts.pendentes },
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
      key: 'process',
      label: 'Processar Selecionados',
      variant: 'primary',
      onClick: (items) => console.log('Processar:', items)
    },
    {
      key: 'delete',
      label: 'Excluir',
      icon: Trash2,
      variant: 'danger',
      onClick: (items) => console.log('Excluir:', items)
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

      {/* Content */}
      <div className="rounded-lg rounded-tl-none">
        {activeTab === 'pdfs_fotos' ? (
          <DataTable
            data={getFilteredDocuments()}
            columns={documentColumns}
            selectable
            selectedItems={selectedDocuments}
            onSelectionChange={setSelectedDocuments}
            searchable
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar documentos..."
            filters={getFilters()}
            activeFilter={statusFilter}
            onFilterChange={(filter) => setStatusFilter(filter as FilterStatus)}
            actions={documentActions}
            bulkActions={bulkActions}
            primaryAction={{
              label: 'Adicionar',
              onClick: onOpenDocumentModal
            }}
            emptyStateIcon={FileText}
            emptyStateTitle="Nenhum documento encontrado"
            emptyStateDescription="Não há documentos PDFs ou fotos para exibir"
          />
        ) : (
          <>
            <DataTable
              data={getFilteredExcelFiles()}
              columns={excelColumns}
              selectable
              selectedItems={selectedExcelFiles}
              onSelectionChange={setSelectedExcelFiles}
              searchable
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Buscar arquivos Excel..."
              filters={getFilters()}
              activeFilter={statusFilter}
              onFilterChange={(filter) => setStatusFilter(filter as FilterStatus)}
              actions={excelActions}
              bulkActions={bulkActions}
              primaryAction={{
                label: 'Importar Excel',
                onClick: onOpenExcelModal
              }}
              emptyStateIcon={FileSpreadsheet}
              emptyStateTitle="Nenhum arquivo Excel encontrado"
              emptyStateDescription="Não há planilhas para exibir"
            />

            {/* Info about Excel Processing */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium mb-1">Processamento Inteligente de Planilhas</p>
                  <p className="text-xs">
                    Nossa IA analisa automaticamente o formato da sua planilha e converte os dados para o padrão 
                    Conta Azul. Não é necessário seguir um modelo específico - trabalhamos com qualquer formato!
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Visualização */}
      <DocumentViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModal}
        document={selectedDocument}
        excelFile={selectedExcelFile}
        type={modalType}
      />
    </div>
  );
};