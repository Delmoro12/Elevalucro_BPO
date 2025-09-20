'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronDown, Search, Info } from 'lucide-react';
import { 
  AccountReceivable, 
  AccountReceivableFormData,
  PaymentMethodOptions,
  OccurrenceOptions,
  DaysOfWeekOptions
} from '../../types/accountsReceivable';
import { RecurrenceCalculator } from '../../utils/recurrenceCalculator';
import { FinancialCategory } from '../../types/config';
import { ClientClient } from '../../types/clientsClients';

interface AccountsReceivableModalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AccountReceivableFormData) => Promise<boolean>;
  onSeriesEditRequest?: (account: AccountReceivable, formData: AccountReceivableFormData) => void;
  title: string;
  account?: AccountReceivable | null;
  categories?: FinancialCategory[];
  clients?: ClientClient[];
}

export const AccountsReceivableModalSidebar: React.FC<AccountsReceivableModalSidebarProps> = ({
  isOpen,
  onClose,
  onSave,
  onSeriesEditRequest,
  title,
  account,
  categories = [],
  clients = []
}) => {
  const [formData, setFormData] = useState<AccountReceivableFormData>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  // Controles de estado
  const isEditMode = !!account; // Se tem account, é edição
  const isReadOnly = account?.status === 'received'; // Se está recebida, é só leitura
  const isOccurrenceDisabled = isEditMode; // Tipo de ocorrência desabilitado na edição

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

  // Reset form quando modal abre/fecha ou account muda
  useEffect(() => {
    if (isOpen && account) {
      // Extrair dados do recurrence_config JSONB
      const config = account.recurrence_config || {};
      
      const formDataToSet = {
        pix_number: account.pix_number || '',
        bank_slip_code: account.bank_slip_code || '',
        payment_method: account.payment_method || '',
        companies_clients_suppliers_id: account.companies_clients_suppliers_id || '',
        due_date: account.due_date || '',
        value: account.value || 0,
        date_of_issue: account.date_of_issue || '',
        number_of_document: account.number_of_document || '',
        notes: account.notes || '',
        category_id: account.category_id || '',
        occurrence: account.occurrence || 'unique',
        // Extrair valores apenas do recurrence_config JSONB
        recurrence_day_of_week: config.day_of_week || '',
        recurrence_day_of_month: config.day_of_month || undefined,
        installment_count: config.installment_count || undefined,
        installment_day: config.installment_day || undefined
      };
      
      setFormData(formDataToSet);
    } else if (isOpen) {
      setFormData({
        pix_number: '',
        bank_slip_code: '',
        payment_method: '',
        companies_clients_suppliers_id: '',
        due_date: '',
        value: 0,
        date_of_issue: '',
        number_of_document: '',
        notes: '',
        category_id: '',
        occurrence: 'unique'
      });
    }
    setErrors({});
    setClientDropdownOpen(false);
    setClientSearchTerm('');
  }, [isOpen, account]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setClientDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get filtered clients
  const getFilteredClients = () => {
    return clients
      .filter(s => s.type === 'client' || s.type === 'both')
      .filter(s => 
        s.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        (s.cnpj && s.cnpj.includes(clientSearchTerm)) ||
        (s.cpf && s.cpf.includes(clientSearchTerm))
      );
  };

  // Get selected client name
  const getSelectedClientName = () => {
    if (!formData.companies_clients_suppliers_id) return 'Selecione um cliente';
    const client = clients.find(s => s.id === formData.companies_clients_suppliers_id);
    return client ? client.name : 'Cliente não encontrado';
  };

  const selectClient = (clientId: string) => {
    setFormData({ ...formData, companies_clients_suppliers_id: clientId });
    setClientDropdownOpen(false);
    setClientSearchTerm('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Valor é obrigatório e deve ser maior que zero';
    }

    if (!formData.due_date?.trim()) {
      newErrors.due_date = 'Data de vencimento é obrigatória';
    }

    if (!formData.payment_method?.trim()) {
      newErrors.payment_method = 'Método de pagamento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Se a conta tem series_id e estamos editando, perguntar se quer editar série
    if (account?.series_id && isEditMode && onSeriesEditRequest) {
      onSeriesEditRequest(account, formData);
      return;
    }

    setLoading(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
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
            {/* Primeira linha - Cliente (span completo) */}
            <div className="relative" ref={clientDropdownRef}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Cliente
              </label>
              
              {/* Custom Select Button */}
              <button
                type="button"
                onClick={() => !isReadOnly && setClientDropdownOpen(!clientDropdownOpen)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between ${
                  isReadOnly 
                    ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
              >
                <span className={formData.companies_clients_suppliers_id ? '' : 'text-slate-500'}>
                  {getSelectedClientName()}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${clientDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {clientDropdownOpen && !isReadOnly && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-2 border-b border-slate-200 dark:border-slate-600">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar fornecedor..."
                        value={clientSearchTerm}
                        onChange={(e) => setClientSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Options */}
                  <div className="max-h-48 overflow-y-auto">
                    {/* Clear selection option */}
                    <button
                      type="button"
                      onClick={() => selectClient('')}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 text-sm"
                    >
                      Limpar seleção
                    </button>
                    
                    {getFilteredClients().length === 0 ? (
                      <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                        Nenhum fornecedor encontrado
                      </div>
                    ) : (
                      getFilteredClients().map(client => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => selectClient(client.id)}
                          className={`w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-600 ${
                            formData.companies_clients_suppliers_id === client.id 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' 
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          <div>
                            <div className="font-medium">{client.name}</div>
                            {(client.cnpj || client.cpf) && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {client.cnpj || client.cpf}
                              </div>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Grid de duas colunas */}
            <div className="grid grid-cols-2 gap-4">
              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.value || ''}
                  onChange={(e) => !isReadOnly && setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  readOnly={isReadOnly}
                  className={getInputClasses(!!errors.value)}
                  placeholder="0.00"
                />
                {errors.value && (
                  <p className="mt-1 text-sm text-red-500">{errors.value}</p>
                )}
              </div>

              {/* Data de Vencimento */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Data de Vencimento *
                </label>
                <input
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => !isReadOnly && setFormData({ ...formData, due_date: e.target.value })}
                  readOnly={isReadOnly}
                  className={getInputClasses(!!errors.due_date)}
                />
                {errors.due_date && (
                  <p className="mt-1 text-sm text-red-500">{errors.due_date}</p>
                )}
              </div>

              {/* Método de Pagamento */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Método de Pagamento *
                </label>
                <select
                  value={formData.payment_method || ''}
                  onChange={(e) => !isReadOnly && setFormData({ ...formData, payment_method: e.target.value })}
                  disabled={isReadOnly}
                  className={getInputClasses(!!errors.payment_method)}
                >
                  <option value="">Selecione um método</option>
                  {PaymentMethodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.payment_method && (
                  <p className="mt-1 text-sm text-red-500">{errors.payment_method}</p>
                )}
              </div>

              {/* Data de Emissão */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Data de Emissão
                </label>
                <input
                  type="date"
                  value={formData.date_of_issue || ''}
                  onChange={(e) => !isReadOnly && setFormData({ ...formData, date_of_issue: e.target.value })}
                  readOnly={isReadOnly}
                  className={getInputClasses()}
                />
              </div>

              {/* Número do Documento */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Número do Documento
                </label>
                <input
                  type="text"
                  value={formData.number_of_document || ''}
                  onChange={(e) => !isReadOnly && setFormData({ ...formData, number_of_document: e.target.value })}
                  readOnly={isReadOnly}
                  className={getInputClasses()}
                  placeholder="Digite o número do documento..."
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => !isReadOnly && setFormData({ ...formData, category_id: e.target.value })}
                  disabled={isReadOnly}
                  className={getInputClasses()}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ocorrência */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Ocorrência
                </label>
                <select
                  value={formData.occurrence || 'unique'}
                  onChange={(e) => !isReadOnly && !isOccurrenceDisabled && setFormData({ ...formData, occurrence: e.target.value })}
                  disabled={isReadOnly || isOccurrenceDisabled}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isReadOnly 
                      ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                      : isOccurrenceDisabled
                        ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                >
                  {OccurrenceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campos condicionais de recorrência - Dia da Semana */}
              {(formData.occurrence === 'weekly' || formData.occurrence === 'biweekly') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Dia da Semana
                  </label>
                  <select
                    value={formData.recurrence_day_of_week || ''}
                    onChange={(e) => !isReadOnly && !isEditMode && setFormData({ ...formData, recurrence_day_of_week: e.target.value })}
                    disabled={isReadOnly || isEditMode}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isReadOnly 
                        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                        : isEditMode
                          ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                  >
                    <option value="">Selecione o dia da semana</option>
                    {DaysOfWeekOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Campos condicionais de recorrência - Dia do Mês */}
              {(formData.occurrence === 'monthly' || formData.occurrence === 'quarterly' || 
                formData.occurrence === 'semiannual' || formData.occurrence === 'annual') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Dia do Mês
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.recurrence_day_of_month || ''}
                    onChange={(e) => !isReadOnly && !isEditMode && setFormData({ ...formData, recurrence_day_of_month: parseInt(e.target.value) || undefined })}
                    readOnly={isReadOnly || isEditMode}
                    className={`w-full px-3 py-2 border rounded-lg placeholder-slate-500 ${
                      isReadOnly 
                        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                        : isEditMode
                          ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                    placeholder="Ex: 15 (dia 15 de cada mês/período)"
                  />
                </div>
              )}

              {/* Campos condicionais de recorrência - Parcelas */}
              {formData.occurrence === 'installments' && (
                <div className="flex gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nº Parcelas
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="120"
                      value={formData.installment_count || ''}
                      onChange={(e) => !isReadOnly && !isEditMode && setFormData({ ...formData, installment_count: parseInt(e.target.value) || undefined })}
                      readOnly={isReadOnly || isEditMode}
                      className={`w-20 px-3 py-2 border rounded-lg placeholder-slate-500 ${
                        isReadOnly 
                          ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                          : isEditMode
                            ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                      }`}
                      placeholder="12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Dia Venc.
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.installment_day || ''}
                      onChange={(e) => !isReadOnly && !isEditMode && setFormData({ ...formData, installment_day: parseInt(e.target.value) || undefined })}
                      readOnly={isReadOnly || isEditMode}
                      className={`w-20 px-3 py-2 border rounded-lg placeholder-slate-500 ${
                        isReadOnly 
                          ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                          : isEditMode
                            ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                      }`}
                      placeholder="10"
                    />
                  </div>
                </div>
              )}
            </div>


            {/* Preview de recorrência */}
            {formData.occurrence && formData.occurrence !== 'unique' && formData.due_date && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Preview da Recorrência
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                      {RecurrenceCalculator.getRecurrenceDescription(formData.occurrence, {
                        day_of_week: formData.recurrence_day_of_week,
                        day_of_month: formData.recurrence_day_of_month,
                        installment_count: formData.installment_count
                      })}
                    </p>
                    {(() => {
                      try {
                        const previewDates = RecurrenceCalculator.generatePreviewDates(
                          formData.due_date,
                          formData.occurrence,
                          {
                            day_of_week: formData.recurrence_day_of_week,
                            day_of_month: formData.recurrence_day_of_month,
                            installment_count: formData.installment_count,
                            installment_day: formData.installment_day
                          },
                          3
                        );
                        return (
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            <span className="font-medium">Próximas datas:</span>{' '}
                            {previewDates.map(date => RecurrenceCalculator.formatDate(date)).join(', ')}
                            {previewDates.length >= 3 && '...'}
                          </div>
                        );
                      } catch (error) {
                        return (
                          <div className="text-xs text-orange-600 dark:text-orange-400">
                            Complete os campos para ver o preview
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* PIX (condicional, span completo) */}
            {formData.payment_method === 'pix' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Chave PIX
                </label>
                <input
                  type="text"
                  value={formData.pix_number || ''}
                  onChange={(e) => !isReadOnly && setFormData({ ...formData, pix_number: e.target.value })}
                  readOnly={isReadOnly}
                  className={getInputClasses()}
                  placeholder="Digite a chave PIX..."
                />
              </div>
            )}

            {/* Boleto (condicional, span completo) */}
            {formData.payment_method === 'bank_slip' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Código do Boleto
                </label>
                <input
                  type="text"
                  value={formData.bank_slip_code || ''}
                  onChange={(e) => !isReadOnly && setFormData({ ...formData, bank_slip_code: e.target.value })}
                  readOnly={isReadOnly}
                  className={getInputClasses()}
                  placeholder="Digite o código do boleto..."
                />
              </div>
            )}

            {/* Observações (span completo) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Observações
              </label>
              <textarea
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => !isReadOnly && setFormData({ ...formData, notes: e.target.value })}
                readOnly={isReadOnly}
                className={`${getInputClasses()} resize-none`}
                placeholder="Digite observações sobre a conta..."
              />
            </div>

            {/* Linha divisória */}
            {(account?.client_email || account?.client_document || account?.client_phone || account?.client_whatsapp || account?.client_pix) && (
              <>
                <hr className="border-slate-200 dark:border-slate-700 -mx-2" />
                
                {/* Informações do Cliente (somente leitura) */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Informações do Cliente
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {account?.client_document && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {account.client_type === 'PF' ? 'CPF:' : 'CNPJ:'}
                        </span>
                        <span className="text-xs text-slate-700 dark:text-slate-300">
                          {account.client_document}
                        </span>
                      </div>
                    )}
                    {account?.client_email && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">E-mail:</span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 break-all">
                          {account.client_email}
                        </span>
                      </div>
                    )}
                    {account?.client_phone && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Telefone:</span>
                        <span className="text-xs text-slate-700 dark:text-slate-300">
                          {account.client_phone}
                        </span>
                      </div>
                    )}
                    {account?.client_whatsapp && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">WhatsApp:</span>
                        <span className="text-xs text-slate-700 dark:text-slate-300">
                          {account.client_whatsapp}
                        </span>
                      </div>
                    )}
                    {account?.client_pix && (
                      <div className="col-span-2 flex items-start gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">PIX:</span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 break-all">
                          {account.client_pix}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
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
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};