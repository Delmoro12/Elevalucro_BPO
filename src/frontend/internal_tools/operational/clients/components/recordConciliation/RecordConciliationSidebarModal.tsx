'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Info } from 'lucide-react';
import { ReconciliationRecord, ReconciliationValidationRequest } from '../../types/recordConciliation';
import { FinancialCategory } from '../../types/config';
import { useFinancialCategories } from '../../hooks/useFinancialConfig';
import { supabase } from '@/src/lib/supabase';

interface RecordConciliationSidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (id: string, data: ReconciliationValidationRequest) => Promise<boolean>;
  record: ReconciliationRecord | null;
  companyId: string;
}

export const RecordConciliationSidebarModal: React.FC<RecordConciliationSidebarModalProps> = ({
  isOpen,
  onClose,
  onValidate,
  record,
  companyId
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    category_id: '',
    notes: ''
  });
  
  // Hook para categorias
  const { categories } = useFinancialCategories(companyId);

  // Controles de estado
  const isReadOnly = record?.validated || false;

  // Helper para classes de input
  const getInputClasses = (hasError?: boolean) => {
    return `w-full px-3 py-2 border rounded-lg placeholder-slate-500 ${
      isReadOnly 
        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
        : `bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
            hasError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
          }`
    }`;
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && record) {
      setFormData({
        category_id: record.category_id || '',
        notes: record.notes || ''
      });
    } else if (isOpen) {
      setFormData({
        category_id: '',
        notes: ''
      });
    }
    setErrors({});
  }, [isOpen, record]);

  // Get selected supplier/client name
  const getClientSupplierName = () => {
    return record?.client_name || record?.supplier_name || record?.third_party_name || '-';
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    return type === 'receivable' ? 'Conta a Receber' : 'Conta a Pagar';
  };

  // Get occurrence label
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

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Format date time
  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    return status === 'paid' ? 'Pago' : 'Pendente';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category_id?.trim()) {
      newErrors.category_id = 'Categoria é obrigatória para validação';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !record) return;

    setLoading(true);
    try {
      // Pegar o user ID da sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const validationData: ReconciliationValidationRequest = {
        validated: true,
        validated_at: new Date().toISOString(),
        validated_by: userId || '', // Usar o ID do usuário da sessão
        notes: formData.notes.trim() || undefined,
        category_id: formData.category_id
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

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full max-w-3xl w-full bg-white dark:bg-slate-800 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {isReadOnly ? 'Visualizar Registro' : 'Validar Registro'}
            </h2>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              record.type === 'receivable' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
            }`}>
              {record.type === 'receivable' ? 'Entrada' : 'Saída'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Cliente/Fornecedor (span completo) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {record.type === 'receivable' ? 'Cliente' : 'Fornecedor'}
              </label>
              <input
                type="text"
                value={getClientSupplierName()}
                readOnly
                className={getInputClasses()}
              />
            </div>

            {/* Grid de duas colunas */}
            <div className="grid grid-cols-2 gap-4">
              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Valor
                </label>
                <input
                  type="text"
                  value={formatCurrency(record.value)}
                  readOnly
                  className={getInputClasses()}
                />
              </div>

              {/* Data de Vencimento */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="text"
                  value={formatDate(record.due_date)}
                  readOnly
                  className={getInputClasses()}
                />
              </div>

              {/* Método de Pagamento */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Método de Pagamento
                </label>
                <input
                  type="text"
                  value={record.payment_method || '-'}
                  readOnly
                  className={getInputClasses()}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <input
                  type="text"
                  value={getStatusLabel(record.status || 'pending')}
                  readOnly
                  className={getInputClasses()}
                />
              </div>

              {/* Data de Emissão */}
              {record.date_of_issue && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Data de Emissão
                  </label>
                  <input
                    type="text"
                    value={formatDate(record.date_of_issue)}
                    readOnly
                    className={getInputClasses()}
                  />
                </div>
              )}

              {/* Número do Documento */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Número do Documento
                </label>
                <input
                  type="text"
                  value={record.number_of_document || '-'}
                  readOnly
                  className={getInputClasses()}
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Categoria {!isReadOnly && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => !isReadOnly && setFormData({ ...formData, category_id: e.target.value })}
                  disabled={isReadOnly}
                  className={getInputClasses(!!errors.category_id)}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.description}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>
                )}
              </div>

              {/* Tipo de Ocorrência */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Ocorrência
                </label>
                <input
                  type="text"
                  value={getOccurrenceLabel(record.occurrence)}
                  readOnly
                  className={getInputClasses()}
                />
              </div>

              {/* Campos condicionais de recorrência - Dia da Semana */}
              {(record.occurrence === 'weekly' || record.occurrence === 'biweekly') && record.recurrence_config?.day_of_week && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Dia da Semana
                  </label>
                  <input
                    type="text"
                    value={record.recurrence_config.day_of_week}
                    readOnly
                    className={getInputClasses()}
                  />
                </div>
              )}

              {/* Campos condicionais de recorrência - Dia do Mês */}
              {(record.occurrence === 'monthly' || record.occurrence === 'quarterly' || 
                record.occurrence === 'semiannual' || record.occurrence === 'annual') && record.recurrence_config?.day_of_month && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Dia do Mês
                  </label>
                  <input
                    type="text"
                    value={record.recurrence_config.day_of_month}
                    readOnly
                    className={getInputClasses()}
                  />
                </div>
              )}

              {/* Campos condicionais de recorrência - Parcelas */}
              {record.occurrence === 'installments' && record.recurrence_config && (
                <>
                  {record.recurrence_config.installment_count && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Nº Parcelas
                      </label>
                      <input
                        type="text"
                        value={record.recurrence_config.installment_count}
                        readOnly
                        className={getInputClasses()}
                      />
                    </div>
                  )}
                  {record.recurrence_config.installment_day && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Dia Venc.
                      </label>
                      <input
                        type="text"
                        value={record.recurrence_config.installment_day}
                        readOnly
                        className={getInputClasses()}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Preview de recorrência */}
            {record.occurrence && record.occurrence !== 'unique' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Detalhes da Recorrência
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Este registro possui recorrência do tipo: {getOccurrenceLabel(record.occurrence)}
                      {record.recurrence_config?.installment_number && record.recurrence_config?.total_installments && (
                        <span> - Parcela {record.recurrence_config.installment_number} de {record.recurrence_config.total_installments}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Observações do Cliente */}
            {record.notes && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Observações do Cliente
                </label>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white min-h-[80px]">
                  {record.notes}
                </div>
              </div>
            )}

            {/* Observações da Validação (span completo) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Observações da Validação
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => !isReadOnly && setFormData({ ...formData, notes: e.target.value })}
                readOnly={isReadOnly}
                className={`${getInputClasses()} resize-none`}
                placeholder="Digite observações sobre a validação..."
              />
            </div>

            {/* Informações de Validação (se já validado) */}
            {isReadOnly && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Informações de Validação
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Validado em:</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      {record.validated_at ? formatDateTime(record.validated_at) : '-'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Validado por:</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      {record.validated_by_name || '-'}
                    </span>
                  </div>
                  {record.category_name && (
                    <div className="col-span-2 flex items-start gap-2">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Categoria:</span>
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        {record.category_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 pb-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              disabled={loading}
            >
              {isReadOnly ? 'Fechar' : 'Cancelar'}
            </button>
            {!isReadOnly && (
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4" />
                {loading ? 'Validando...' : 'Validar Registro'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};