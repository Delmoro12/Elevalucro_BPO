'use client';

import React from 'react';
import { 
  FileText,
  Download,
  Calendar,
  DollarSign,
  Building2,
  User,
  Tag,
  Hash,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { ModalSidebar } from '../../shared/components';
import { Document } from '../types';

interface DocumentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
}

export const DocumentViewModal: React.FC<DocumentViewModalProps> = ({
  isOpen,
  onClose,
  document
}) => {

  const handleDownload = async () => {
    if (!document.arquivo) {
      alert('Nenhum arquivo disponível para download.');
      return;
    }

    try {
      // Importar o serviço dinamicamente para evitar problemas de SSR
      const { useStorageService } = await import('../services/storageService');
      const storageService = useStorageService();
      
      console.log('📥 Downloading document:', document.arquivo);
      
      const result = await storageService.downloadFile(document.arquivo);
      
      if (result.success && result.url) {
        // Abrir o arquivo em uma nova aba
        window.open(result.url, '_blank');
      } else {
        console.error('Download failed:', result.error);
        alert(`Erro no download: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Erro ao fazer download do arquivo. Tente novamente.');
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
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

  const renderField = (
    label: string,
    value: any,
    icon: React.ElementType,
    isSpecialDisplay?: 'tipo_documento' | 'categoria' | 'date'
  ) => {
    const IconComponent = icon;
    
    return (
      <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-3">
        <div className="flex items-center space-x-2 mb-1">
          <IconComponent className="h-3.5 w-3.5 text-slate-400" />
          <h4 className="font-medium text-slate-900 dark:text-white text-xs">{label}</h4>
        </div>
        
        <div className="text-slate-700 dark:text-slate-300 text-sm">
          {isSpecialDisplay === 'tipo_documento' && value ? (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              value === 'fiscal'
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              {value === 'fiscal' ? 'Fiscal' : 'Não Fiscal'}
            </span>
          ) : isSpecialDisplay === 'categoria' && value ? (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              value === 'entrada'
                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                : 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
            }`}>
              <div className="flex items-center space-x-1">
                {value === 'entrada' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{value === 'entrada' ? 'Entrada' : 'Saída'}</span>
              </div>
            </span>
          ) : isSpecialDisplay === 'date' ? (
            formatDate(value)
          ) : (
            value || '-'
          )}
        </div>
      </div>
    );
  };

  const footer = (
    <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex justify-end">
        <button 
          onClick={handleDownload}
          className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </button>
      </div>
    </div>
  );

  return (
    <ModalSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={document?.nome || 'Documento'}
      subtitle={`${document?.arquivo} • ${document?.tamanho}`}
      icon={FileText}
      width="lg"
      footer={footer}
    >
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </span>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Upload: {formatDateTime(document.data_upload)}
          </div>
        </div>

        {/* Dados Básicos */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Informações Básicas</h3>
          
          {renderField('Nome do Documento', document.nome, FileText)}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderField('Tipo', document.tipo_documento, Tag, 'tipo_documento')}
            {renderField('Categoria', document.categoria, TrendingUp, 'categoria')}
          </div>
        </div>

        {/* Dados Financeiros */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Dados Financeiros</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderField('Valor', document.valor, DollarSign)}
            {renderField('Data do Documento', document.data_documento, Calendar, 'date')}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderField('Forma de Pagamento', document.forma_pagamento, CreditCard)}
            {renderField('Centro de Custo', document.centro_custo, Building2)}
          </div>
        </div>

        {/* Dados das Partes */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Partes Envolvidas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderField('Fornecedor', document.fornecedor, Building2)}
            {renderField('Cliente', document.cliente, User)}
          </div>
          
          {renderField('CNPJ', document.cnpj, Hash)}
        </div>

        {/* Dados Específicos */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Detalhes do Documento</h3>
          
          {renderField('Descrição', document.descricao, FileText)}
          {renderField('Observações', document.observacoes, AlertCircle)}
        </div>

        {/* Metadados */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2 flex items-center text-sm">
            <AlertCircle className="h-3.5 w-3.5 mr-2" />
            Dados Processados pela IA
          </h4>
          <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <p>• Confiança da IA: {document.confianca_ia}%</p>
            <p>• Dados completos: {document.dados_completos ? 'Sim' : 'Não'}</p>
            <p>• Processado em: {formatDateTime(document.created_at)}</p>
            {document.updated_at !== document.created_at && (
              <p>• Última atualização: {formatDateTime(document.updated_at)}</p>
            )}
          </div>
        </div>
      </div>
    </ModalSidebar>
  );
};