'use client';

import React from 'react';
import { 
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  DollarSign,
  Building2,
  AlertCircle,
  Clock,
  CheckCircle,
  Tag,
  Hash,
  User,
  FileIcon,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { ModalSidebar } from '../../shared/components';

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

interface DocumentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: Document | null;
  excelFile?: ExcelFile | null;
  type: 'document' | 'excel';
}

export const DocumentViewModal: React.FC<DocumentViewModalProps> = ({
  isOpen,
  onClose,
  document,
  excelFile,
  type
}) => {
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

  const renderDocumentContent = () => {
    if (!document) return null;

    return (
      <div className="p-6 space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(document.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(document.status)}`}>
              {getStatusText(document.status)}
            </span>
          </div>
          <button className="flex items-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>

        {/* Document Info */}
        <div className="grid grid-cols-1 gap-4">
          {/* Arquivo */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <FileIcon className="h-5 w-5 text-slate-400" />
              <h4 className="font-medium text-slate-900 dark:text-white">Arquivo</h4>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p className="font-medium">{document.arquivo}</p>
              <p className="text-xs mt-1">Tamanho: {document.tamanho}</p>
              <p className="text-xs">Upload: {document.dataUpload}</p>
            </div>
          </div>

          {/* Tipo e Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="h-4 w-4 text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">Tipo</h4>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                document.tipo === 'fiscal'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                {document.tipo === 'fiscal' ? 'Fiscal' : 'Não Fiscal'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                {document.categoria === 'entrada' ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">Categoria</h4>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                document.categoria === 'entrada'
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                  : 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
              }`}>
                {document.categoria === 'entrada' ? 'Entrada' : 'Saída'}
              </span>
            </div>
          </div>

          {/* Empresa/Pessoa */}
          {document.empresaPessoa && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                  {document.categoria === 'entrada' ? 'Cliente' : 'Fornecedor'}
                </h4>
              </div>
              <p className="text-slate-700 dark:text-slate-300">{document.empresaPessoa}</p>
            </div>
          )}

          {/* Valor */}
          {document.valor && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">Valor</h4>
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{document.valor}</p>
            </div>
          )}

          {/* Data */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <h4 className="font-medium text-slate-900 dark:text-white text-sm">Data do Documento</h4>
            </div>
            <p className="text-slate-700 dark:text-slate-300">{document.data}</p>
          </div>
        </div>

        {/* Dados Extraídos pela IA */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-3 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Dados Processados pela IA
          </h4>
          <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <p>• Nome do documento extraído automaticamente</p>
            <p>• Tipo fiscal identificado pela análise do conteúdo</p>
            <p>• Valor monetário reconhecido e formatado</p>
            <p>• Data extraída do cabeçalho do documento</p>
            <p>• Empresa/fornecedor identificado via OCR</p>
          </div>
        </div>
      </div>
    );
  };

  const renderExcelContent = () => {
    if (!excelFile) return null;

    return (
      <div className="p-6 space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(excelFile.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(excelFile.status)}`}>
              {getStatusText(excelFile.status)}
            </span>
          </div>
          {excelFile.status === 'aguardando_validacao' && (
            <button className="flex items-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
              <CheckCircle className="h-4 w-4 mr-2" />
              Validar Dados
            </button>
          )}
        </div>

        {/* File Info */}
        <div className="grid grid-cols-1 gap-4">
          {/* Arquivo */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-medium text-slate-900 dark:text-white">Arquivo Excel</h4>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p className="font-medium">{excelFile.nome}</p>
              <p className="text-xs mt-1">Tamanho: {excelFile.tamanho}</p>
              <p className="text-xs">Upload: {excelFile.dataUpload}</p>
            </div>
          </div>

          {/* Progresso de Processamento */}
          {excelFile.linhasTotal && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Hash className="h-4 w-4 text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">Progresso</h4>
              </div>
              
              {excelFile.status === 'processando' && excelFile.linhasProcessadas ? (
                <div>
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <span>{excelFile.linhasProcessadas}/{excelFile.linhasTotal} linhas</span>
                    <span>{Math.round((excelFile.linhasProcessadas / excelFile.linhasTotal) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full transition-all"
                      style={{ width: `${(excelFile.linhasProcessadas / excelFile.linhasTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-slate-700 dark:text-slate-300">
                  {excelFile.linhasTotal} linhas processadas
                </p>
              )}
            </div>
          )}

          {/* Erros */}
          {excelFile.erros && excelFile.erros.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <h4 className="font-medium text-red-900 dark:text-red-200 text-sm">Erros Encontrados</h4>
              </div>
              <div className="space-y-2">
                {excelFile.erros.map((erro, index) => (
                  <p key={index} className="text-sm text-red-800 dark:text-red-300">
                    • {erro}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Informações do Processamento */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-3 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Processamento Inteligente
          </h4>
          <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <p>• IA analisou automaticamente a estrutura da planilha</p>
            <p>• Identificou colunas de data, valor, descrição e categoria</p>
            <p>• Converteu para o formato padrão Conta Azul</p>
            <p>• Validou consistência dos dados financeiros</p>
            {excelFile.status === 'aguardando_validacao' && (
              <p className="font-medium">• Aguardando sua aprovação para importação</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getModalTitle = () => {
    if (type === 'document' && document) {
      return document.nome;
    }
    if (type === 'excel' && excelFile) {
      return excelFile.nome;
    }
    return 'Detalhes';
  };

  const getModalIcon = () => {
    return type === 'document' ? FileText : FileSpreadsheet;
  };

  const getModalSubtitle = () => {
    if (type === 'document' && document) {
      return `${document.arquivo} • ${document.tamanho}`;
    }
    if (type === 'excel' && excelFile) {
      return `${excelFile.tamanho} • ${excelFile.dataUpload}`;
    }
    return '';
  };

  return (
    <ModalSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      subtitle={getModalSubtitle()}
      icon={getModalIcon()}
      width="lg"
    >
      {type === 'document' ? renderDocumentContent() : renderExcelContent()}
    </ModalSidebar>
  );
};