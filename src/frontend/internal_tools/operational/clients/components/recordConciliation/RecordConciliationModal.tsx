'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, FileText, DollarSign, Calendar, User, Tag } from 'lucide-react';
import { ReconciliationRecord, ReconciliationValidationRequest } from '../../types/recordConciliation';

interface RecordConciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (id: string, data: ReconciliationValidationRequest) => Promise<boolean>;
  record: ReconciliationRecord | null;
  mode: 'view' | 'validate';
}

export const RecordConciliationModal: React.FC<RecordConciliationModalProps> = ({
  isOpen,
  onClose,
  onValidate,
  record,
  mode
}) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  // Reset notas quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setNotes('');
      // Debug: log record data
      console.log('🔧 Modal Record Data:', record);
      console.log('🔧 validated_by_name:', record?.validated_by_name);
      console.log('🔧 validated_by:', record?.validated_by);
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'validate' ? 'Validar Registro' : 'Visualizar Registro';

  const handleValidate = async () => {
    try {
      setLoading(true);
      
      const validationData: ReconciliationValidationRequest = {
        validated: true,
        validated_at: new Date().toISOString(),
        validated_by: 'Operador BPO', // TODO: Pegar do contexto de auth
        notes: notes.trim() || undefined
      };

      const success = await onValidate(record.id, validationData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao validar registro:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const getTypeLabel = (type: string) => {
    return type === 'receivable' ? 'Conta a Receber' : 'Conta a Pagar';
  };

  const getOccurrenceLabel = (occurrence: string) => {
    const labels: Record<string, string> = {
      'unique': 'Única',
      'weekly': 'Semanal',
      'biweekly': 'Quinzenal',
      'monthly': 'Mensal',
      'quarterly': 'Trimestral',
      'semiannual': 'Semestral',
      'annual': 'Anual',
      'installments': 'Parcelada'
    };
    return labels[occurrence] || occurrence || 'Única';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {getTypeLabel(record.type)} • {record.number_of_document || 'S/N'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Informações Principais */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tipo
              </label>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  record.type === 'receivable' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-slate-900 dark:text-white">
                  {getTypeLabel(record.type)}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Valor
              </label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                <span className="text-slate-900 dark:text-white font-medium">
                  {formatCurrency(record.value)}
                </span>
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Data de Vencimento
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="text-slate-900 dark:text-white">
                  {formatDate(record.due_date)}
                </span>
              </div>
            </div>
            {record.date_of_issue && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Data de Emissão
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-900 dark:text-white">
                    {formatDate(record.date_of_issue)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cliente/Fornecedor e Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {record.type === 'receivable' ? 'Cliente' : 'Fornecedor'}
              </label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-slate-900 dark:text-white">
                  {record.client_name || record.supplier_name || record.third_party_name || '-'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Categoria
              </label>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-slate-500" />
                <span className="text-slate-900 dark:text-white">
                  {record.category_name || 'Sem categoria'}
                </span>
              </div>
            </div>
          </div>

          {/* Métodos de Pagamento (para contas a pagar) */}
          {record.type === 'payable' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Método de Pagamento
                </label>
                <span className="text-slate-900 dark:text-white">
                  {record.payment_method || '-'}
                </span>
              </div>
              {record.pix_number && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Chave PIX
                  </label>
                  <span className="text-slate-900 dark:text-white">
                    {record.pix_number}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Recorrência */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tipo de Ocorrência
            </label>
            <span className="text-slate-900 dark:text-white">
              {getOccurrenceLabel(record.occurrence)}
            </span>
          </div>

          {/* Observações do Registro */}
          {record.notes && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Observações do Registro
              </label>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                <span className="text-slate-900 dark:text-white">
                  {record.notes}
                </span>
              </div>
            </div>
          )}

          {/* Informações de Validação (se já validado) */}
          {record.validated && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
                Informações de Validação
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Validado em
                  </label>
                  <span className="text-slate-900 dark:text-white">
                    {record.validated_at ? formatDateTime(record.validated_at) : '-'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Validado por
                  </label>
                  <span className="text-slate-900 dark:text-white">
                    {record.validated_by_name || record.validated_by || '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notas de Validação (apenas no modo validate) */}
          {mode === 'validate' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Observações da Validação (opcional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Digite observações sobre a validação..."
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {mode === 'validate' ? 'Cancelar' : 'Fechar'}
          </button>
          
          {mode === 'validate' && (
            <button
              onClick={handleValidate}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4" />
              {loading ? 'Validando...' : 'Validar Registro'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};