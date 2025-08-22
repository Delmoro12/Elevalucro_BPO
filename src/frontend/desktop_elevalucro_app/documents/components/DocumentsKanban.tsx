'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Download,
  Eye,
  MoreVertical,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Document {
  id: string;
  nome: string;
  tipo: 'fiscal' | 'nao_fiscal';
  categoria: 'entrada' | 'saida';
  valor?: string;
  data: string;
  fornecedor?: string;
  cliente?: string;
  status: 'processado' | 'pendente' | 'erro';
  arquivo: string;
  thumbnail?: string;
}

interface DocumentColumn {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  documents: Document[];
}

const mockDocuments: Document[] = [
  {
    id: '1',
    nome: 'Nota Fiscal 123456',
    tipo: 'fiscal',
    categoria: 'entrada',
    valor: 'R$ 2.500,00',
    data: '15/01/2025',
    cliente: 'Tech Solutions Ltda',
    status: 'processado',
    arquivo: 'nf_123456.pdf'
  },
  {
    id: '2',
    nome: 'Cupom Fiscal Loja ABC',
    tipo: 'fiscal',
    categoria: 'saida',
    valor: 'R$ 450,00',
    data: '14/01/2025',
    fornecedor: 'Loja ABC Material',
    status: 'processado',
    arquivo: 'cupom_abc.jpg'
  },
  {
    id: '3',
    nome: 'Recibo Pagamento',
    tipo: 'nao_fiscal',
    categoria: 'saida',
    valor: 'R$ 1.200,00',
    data: '13/01/2025',
    fornecedor: 'João Silva Serviços',
    status: 'processado',
    arquivo: 'recibo_joao.pdf'
  },
  {
    id: '4',
    nome: 'Extrato Bancário',
    tipo: 'nao_fiscal',
    categoria: 'entrada',
    data: '12/01/2025',
    status: 'pendente',
    arquivo: 'extrato_jan.pdf'
  },
  {
    id: '5',
    nome: 'NFe Venda Online',
    tipo: 'fiscal',
    categoria: 'entrada',
    valor: 'R$ 890,00',
    data: '11/01/2025',
    cliente: 'Maria Santos',
    status: 'processado',
    arquivo: 'nfe_venda.xml'
  }
];

export const DocumentsKanban: React.FC = () => {
  const [documents] = useState<Document[]>(mockDocuments);

  const getDocumentsByCategory = (categoria: 'entrada' | 'saida', tipo: 'fiscal' | 'nao_fiscal') => {
    return documents.filter(doc => doc.categoria === categoria && doc.tipo === tipo);
  };

  const columns: DocumentColumn[] = [
    {
      id: 'entrada_fiscal',
      title: 'Entradas Fiscais',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50',
      documents: getDocumentsByCategory('entrada', 'fiscal')
    },
    {
      id: 'entrada_nao_fiscal',
      title: 'Entradas Não Fiscais',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50',
      documents: getDocumentsByCategory('entrada', 'nao_fiscal')
    },
    {
      id: 'saida_fiscal',
      title: 'Saídas Fiscais',
      icon: <TrendingDown className="h-5 w-5" />,
      color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50',
      documents: getDocumentsByCategory('saida', 'fiscal')
    },
    {
      id: 'saida_nao_fiscal',
      title: 'Saídas Não Fiscais',
      icon: <TrendingDown className="h-5 w-5" />,
      color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50',
      documents: getDocumentsByCategory('saida', 'nao_fiscal')
    }
  ];

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'processado':
        return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400';
      case 'pendente':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400';
      case 'erro':
        return 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'processado':
        return 'Processado';
      case 'pendente':
        return 'Pendente';
      case 'erro':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  const DocumentCard: React.FC<{ document: Document }> = ({ document }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
            {document.tipo === 'fiscal' ? (
              <Receipt className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-slate-900 dark:text-white text-sm truncate">
              {document.nome}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {document.arquivo}
            </p>
          </div>
        </div>
        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
          <MoreVertical className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* Informações do documento */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {document.data}
          </span>
          <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(document.status)}`}>
            {getStatusText(document.status)}
          </span>
        </div>

        {document.valor && (
          <div className="flex items-center text-sm">
            <DollarSign className="h-3 w-3 text-slate-400 mr-1" />
            <span className="font-medium text-slate-900 dark:text-white">
              {document.valor}
            </span>
          </div>
        )}

        {(document.cliente || document.fornecedor) && (
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-medium">
              {document.categoria === 'entrada' ? 'Cliente:' : 'Fornecedor:'}
            </span>
            <br />
            {document.cliente || document.fornecedor}
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex space-x-2">
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
            <Eye className="h-4 w-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" />
          </button>
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
            <Download className="h-4 w-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" />
          </button>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          document.tipo === 'fiscal' 
            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
        }`}>
          {document.tipo === 'fiscal' ? 'Fiscal' : 'Não Fiscal'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Armários de Documentos
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Documentos organizados por categoria e tipo fiscal
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            {/* Header da Coluna */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${column.color}`}>
                  {column.icon}
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                    {column.title}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {column.documents.length} {column.documents.length === 1 ? 'documento' : 'documentos'}
                  </span>
                </div>
              </div>
            </div>

            {/* Lista de Documentos */}
            <div className="space-y-3 min-h-[300px] bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              {column.documents.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}

              {column.documents.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400 dark:text-slate-500">
                  <div className="text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum documento</p>
                    <p className="text-xs">nesta categoria</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {getDocumentsByCategory('entrada', 'fiscal').length + getDocumentsByCategory('entrada', 'nao_fiscal').length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Entradas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {getDocumentsByCategory('saida', 'fiscal').length + getDocumentsByCategory('saida', 'nao_fiscal').length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Saídas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {documents.filter(d => d.tipo === 'fiscal').length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Documentos Fiscais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
              {documents.filter(d => d.status === 'processado').length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Processados</div>
          </div>
        </div>
      </div>
    </div>
  );
};