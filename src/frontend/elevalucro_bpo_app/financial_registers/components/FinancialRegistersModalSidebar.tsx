'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronDown, Search, Info } from 'lucide-react';
import { 
  FinancialRegister, 
  FinancialRegisterFormData
} from '../types/financialRegisters';
import { useClientsSuppliers } from '../hooks/useClientsSuppliers';
import { useFinancialAccounts } from '../../my_finance/hooks/useFinancialAccounts';

// Funções para formatação de moeda
const formatCurrency = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === '') return '';
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue)) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
};

const parseCurrency = (value: string): number => {
  if (!value) return 0;
  
  // Remove o símbolo da moeda e espaços
  let cleanValue = value.replace(/[R$\s]/g, '');
  
  // Se tem tanto ponto quanto vírgula, assume formato brasileiro (1.000,00)
  if (cleanValue.includes('.') && cleanValue.includes(',')) {
    // Remove os pontos de milhar
    cleanValue = cleanValue.replace(/\./g, '');
    // Substitui vírgula por ponto
    cleanValue = cleanValue.replace(',', '.');
  } else if (cleanValue.includes(',')) {
    // Se só tem vírgula, substitui por ponto
    cleanValue = cleanValue.replace(',', '.');
  }
  
  // Remove qualquer caracter não numérico exceto ponto e sinal de menos
  cleanValue = cleanValue.replace(/[^\d.-]/g, '');
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : Math.max(0, parsed); // Garante que não seja negativo
};

interface FinancialRegistersModalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FinancialRegisterFormData) => Promise<boolean>;
  register?: FinancialRegister | null;
  mode: 'create' | 'edit' | 'view';
  companyId?: string;
}

const PaymentMethodOptions = [
  { value: 'pix', label: 'PIX' },
  { value: 'bank_slip', label: 'Boleto' },
  { value: 'bank_transfer', label: 'Transferência' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'check', label: 'Cheque' }
];

const OccurrenceOptions = [
  { value: 'unique', label: 'Única' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semiannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
  { value: 'installments', label: 'Parcelada' }
];

const DaysOfWeekOptions = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' }
];

export const FinancialRegistersModalSidebar: React.FC<FinancialRegistersModalSidebarProps> = ({
  isOpen,
  onClose,
  onSave,
  register,
  mode,
  companyId = '6db8c271-f6a0-41ea-a8e4-c3e627a29de5'
}) => {
  const [formData, setFormData] = useState<FinancialRegisterFormData>({
    type: 'receivable',
    value: 0,
    occurrence: 'unique',
    status: 'pending',
    date_of_issue: new Date().toISOString().split('T')[0]
  });
  const [formattedValue, setFormattedValue] = useState(''); // Estado para o valor formatado
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estados para dropdown de cliente/fornecedor
  const [clientSupplierDropdownOpen, setClientSupplierDropdownOpen] = useState(false);
  const [clientSupplierSearchTerm, setClientSupplierSearchTerm] = useState('');
  const clientSupplierDropdownRef = useRef<HTMLDivElement>(null);

  // Hook para buscar clientes/fornecedores
  const { clients, suppliers, loading: clientsLoading } = useClientsSuppliers(companyId);
  
  // Hook para buscar contas financeiras
  const { financialAccounts, loading: financialAccountsLoading } = useFinancialAccounts(companyId);

  const isReadOnly = mode === 'view';
  const isEditMode = !!register;
  const isOccurrenceDisabled = isEditMode;

  const title =
    mode === 'create' ? 'Novo Registro Financeiro' :
    mode === 'edit' ? 'Editar Registro' :
    'Visualizar Registro';

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

  // Reset form quando modal abre/fecha
  useEffect(() => {
    if (isOpen && register && mode !== 'create') {
      const registerValue = register.value || 0;
      
      // Extrair configurações de recorrência do recurrence_config se existir
      const recurrenceConfig = register.recurrence_config || {};
      
      setFormData({
        type: register.type,
        pix_number: register.pix_number || '',
        bank_slip_code: register.bank_slip_code || '',
        payment_method: register.payment_method || '',
        companies_clients_suppliers_id: register.companies_clients_suppliers_id || '',
        due_date: register.due_date || '',
        value: registerValue,
        date_of_issue: register.date_of_issue || new Date().toLocaleDateString('pt-BR'),
        number_of_document: register.number_of_document || '',
        notes: register.notes || '',
        occurrence: register.occurrence || 'unique',
        status: register.status || 'pending',
        // Buscar primeiro no recurrence_config, depois no registro direto
        recurrence_day_of_week: recurrenceConfig.day_of_week || register.recurrence_day_of_week || '',
        recurrence_day_of_month: recurrenceConfig.day_of_month || register.recurrence_day_of_month || undefined,
        installment_count: recurrenceConfig.installment_count || register.installment_count || undefined,
        installment_day: recurrenceConfig.installment_day || register.installment_day || undefined
      });
      // Formatar o valor para exibição
      setFormattedValue(formatCurrency(registerValue));
    } else if (isOpen && mode === 'create') {
      setFormData({
        type: 'receivable',
        value: 0,
        occurrence: 'unique',
        status: 'pending',
        date_of_issue: new Date().toISOString().split('T')[0] // Data atual no formato YYYY-MM-DD
      });
      setFormattedValue(''); // Limpar valor formatado
    }
    setErrors({});
    setClientSupplierDropdownOpen(false);
    setClientSupplierSearchTerm('');
  }, [isOpen, register, mode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        clientSupplierDropdownRef.current &&
        !clientSupplierDropdownRef.current.contains(event.target as Node)
      ) {
        setClientSupplierDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) newErrors.type = 'Tipo é obrigatório';
    
    // Validação mais robusta para valor
    const value = typeof formData.value === 'string' ? parseFloat(formData.value) : formData.value;
    if (!value || isNaN(value) || value <= 0) {
      newErrors.value = 'Valor é obrigatório e deve ser maior que zero';
    }
    
    if (!formData.due_date?.trim()) newErrors.due_date = 'Data de vencimento é obrigatória';
    if (!formData.date_of_issue?.trim()) newErrors.date_of_issue = 'Data de emissão é obrigatória';
    if (!formData.payment_method?.trim()) newErrors.payment_method = 'Método de pagamento é obrigatório';
    if (!formData.notes?.trim()) newErrors.notes = 'Descrição é obrigatória';
    
    // Validar conta financeira quando status for 'paid'
    if (formData.status === 'paid' && !formData.financial_account_id?.trim()) {
      newErrors.financial_account_id = 'Conta financeira é obrigatória quando o status é Pago';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReadOnly) return;
    
    console.log('🐛 Form Data antes da validação:', formData);
    
    if (!validateForm()) {
      console.log('❌ Validação falhou:', errors);
      return;
    }

    console.log('✅ Validação passou, enviando dados...');
    
    // Preparar dados para envio, incluindo informações adicionais no notes
    let enhancedFormData = { ...formData };
    
    // Se status for 'paid' e houver conta financeira, adicionar essas informações ao notes
    if (formData.status === 'paid' && formData.financial_account_id) {
      const selectedAccount = financialAccounts.find(account => account.id === formData.financial_account_id);
      
      // Construir informações adicionais
      const additionalInfo = [];
      additionalInfo.push(`Status: Pago`);
      if (selectedAccount) {
        additionalInfo.push(`Conta Financeira: ${selectedAccount.description}`);
      }
      
      // Combinar notes existente com informações adicionais
      const originalNotes = formData.notes?.trim() || '';
      const extraInfo = additionalInfo.join(' | ');
      
      enhancedFormData.notes = originalNotes 
        ? `${originalNotes}\n\n${extraInfo}`
        : extraInfo;
    }
    
    setLoading(true);
    try {
      const success = await onSave(enhancedFormData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      setErrors({ submit: 'Erro ao salvar registro' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FinancialRegisterFormData, value: any) => {
    if (isReadOnly) return;

    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Funções para dropdown de cliente/fornecedor
  const getFilteredClientsSuppliers = () => {
    const list = formData.type === 'receivable' ? clients : suppliers;
    return list.filter((cs) =>
      cs.name.toLowerCase().includes(clientSupplierSearchTerm.toLowerCase()) ||
      (cs.cnpj && cs.cnpj.includes(clientSupplierSearchTerm)) ||
      (cs.cpf && cs.cpf.includes(clientSupplierSearchTerm))
    );
  };

  const getSelectedClientSupplierName = () => {
    if (!formData.companies_clients_suppliers_id) {
      return formData.type === 'receivable' ? 'Selecione um cliente' : 'Selecione um fornecedor';
    }
    const list = formData.type === 'receivable' ? clients : suppliers;
    const selected = list.find((cs) => cs.id === formData.companies_clients_suppliers_id);
    return selected ? selected.name : 'Cliente/Fornecedor não encontrado';
  };

  const selectClientSupplier = (id: string) => {
    setFormData((prev) => ({ ...prev, companies_clients_suppliers_id: id }));
    setClientSupplierDropdownOpen(false);
    setClientSupplierSearchTerm('');
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
            {/* Tipo de Registro */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tipo de Registro *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('type', 'receivable')}
                  disabled={isReadOnly}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    formData.type === 'receivable'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                  } ${isReadOnly ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  📈 Entrada (A Receber)
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('type', 'payable')}
                  disabled={isReadOnly}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    formData.type === 'payable'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                  } ${isReadOnly ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  📉 Saída (A Pagar)
                </button>
              </div>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>

            {/* Cliente/Fornecedor (span completo) */}
            <div className="relative" ref={clientSupplierDropdownRef}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {formData.type === 'receivable' ? 'Cliente' : 'Fornecedor'}
              </label>
              
              {/* Custom Select Button */}
              <button
                type="button"
                onClick={() => !isReadOnly && setClientSupplierDropdownOpen(!clientSupplierDropdownOpen)}
                disabled={isReadOnly || clientsLoading}
                className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between ${
                  isReadOnly 
                    ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
              >
                <span className={formData.companies_clients_suppliers_id ? '' : 'text-slate-500'}>
                  {clientsLoading ? 'Carregando...' : getSelectedClientSupplierName()}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${clientSupplierDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {clientSupplierDropdownOpen && !isReadOnly && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-2 border-b border-slate-200 dark:border-slate-600">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder={`Buscar ${formData.type === 'receivable' ? 'cliente' : 'fornecedor'}...`}
                        value={clientSupplierSearchTerm}
                        onChange={(e) => setClientSupplierSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Options */}
                  <div className="max-h-48 overflow-y-auto">
                    {/* Clear selection option */}
                    <button
                      type="button"
                      onClick={() => selectClientSupplier('')}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 text-sm"
                    >
                      Limpar seleção
                    </button>
                    
                    {getFilteredClientsSuppliers().length === 0 ? (
                      <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                        Nenhum {formData.type === 'receivable' ? 'cliente' : 'fornecedor'} encontrado
                      </div>
                    ) : (
                      getFilteredClientsSuppliers().map(cs => (
                        <button
                          key={cs.id}
                          type="button"
                          onClick={() => selectClientSupplier(cs.id)}
                          className={`w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-600 ${
                            formData.companies_clients_suppliers_id === cs.id 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' 
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          <div>
                            <div className="font-medium">{cs.name}</div>
                            {(cs.cnpj || cs.cpf) && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {cs.cnpj || cs.cpf}
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
                  type="text"
                  value={formattedValue}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setFormattedValue(inputValue);
                    
                    // Parsear o valor para número
                    const numericValue = parseCurrency(inputValue);
                    handleChange('value', numericValue);
                  }}
                  onBlur={() => {
                    // Reformatar ao perder o foco
                    setFormattedValue(formatCurrency(formData.value));
                  }}
                  disabled={isReadOnly}
                  className={getInputClasses(!!errors.value)}
                  placeholder="R$ 0,00"
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
                  onChange={(e) => handleChange('due_date', e.target.value)}
                  disabled={isReadOnly}
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
                  onChange={(e) => handleChange('payment_method', e.target.value)}
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
                
                {/* PIX (condicional - apenas para contas a pagar) */}
                {formData.type === 'payable' && formData.payment_method === 'pix' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Chave PIX
                    </label>
                    <input
                      type="text"
                      value={formData.pix_number || ''}
                      onChange={(e) => handleChange('pix_number', e.target.value)}
                      disabled={isReadOnly}
                      className={getInputClasses()}
                      placeholder="Digite a chave PIX..."
                    />
                  </div>
                )}

                {/* Boleto (condicional - apenas para contas a pagar) */}
                {formData.type === 'payable' && formData.payment_method === 'bank_slip' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Código do Boleto
                    </label>
                    <input
                      type="text"
                      value={formData.bank_slip_code || ''}
                      onChange={(e) => handleChange('bank_slip_code', e.target.value)}
                      disabled={isReadOnly}
                      className={getInputClasses()}
                      placeholder="Digite o código do boleto..."
                    />
                  </div>
                )}
              </div>

              {/* Data de Emissão */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Data de Emissão *
                </label>
                <input
                  type="date"
                  value={formData.date_of_issue || ''}
                  onChange={(e) => handleChange('date_of_issue', e.target.value)}
                  disabled={isReadOnly}
                  className={getInputClasses(!!errors.date_of_issue)}
                />
                {errors.date_of_issue && (
                  <p className="mt-1 text-sm text-red-500">{errors.date_of_issue}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status || 'pending'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={isReadOnly}
                  className={getInputClasses()}
                >
                  <option value="pending">⏳ Pendente</option>
                  <option value="paid">✅ Pago</option>
                </select>
              </div>

              {/* Conta Financeira (condicional - apenas quando status for 'paid') */}
              {formData.status === 'paid' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Conta Financeira *
                  </label>
                  <select
                    value={formData.financial_account_id || ''}
                    onChange={(e) => handleChange('financial_account_id', e.target.value)}
                    disabled={isReadOnly || financialAccountsLoading}
                    className={getInputClasses(!!errors.financial_account_id)}
                  >
                    <option value="">
                      {financialAccountsLoading ? 'Carregando contas...' : 'Selecione a conta utilizada'}
                    </option>
                    {financialAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.description}
                      </option>
                    ))}
                  </select>
                  {errors.financial_account_id && (
                    <p className="mt-1 text-sm text-red-500">{errors.financial_account_id}</p>
                  )}
                </div>
              )}

              {/* Número do Documento */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Número do Documento
                </label>
                <input
                  type="text"
                  value={formData.number_of_document || ''}
                  onChange={(e) => handleChange('number_of_document', e.target.value)}
                  disabled={isReadOnly}
                  className={getInputClasses()}
                  placeholder="Digite o número do documento..."
                />
              </div>


              {/* Ocorrência */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Ocorrência
                </label>
                <select
                  value={formData.occurrence || 'unique'}
                  onChange={(e) => handleChange('occurrence', e.target.value)}
                  disabled={isReadOnly || isOccurrenceDisabled}
                  className={getInputClasses()}
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
                    onChange={(e) => handleChange('recurrence_day_of_week', e.target.value)}
                    disabled={isReadOnly || isEditMode}
                    className={getInputClasses()}
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
                    onChange={(e) => handleChange('recurrence_day_of_month', parseInt(e.target.value) || undefined)}
                    disabled={isReadOnly || isEditMode}
                    className={getInputClasses()}
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
                      onChange={(e) => handleChange('installment_count', parseInt(e.target.value) || undefined)}
                      disabled={isReadOnly || isEditMode}
                      className={`w-20 px-3 py-2 border rounded-lg placeholder-slate-500 ${getInputClasses()}`}
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
                      onChange={(e) => handleChange('installment_day', parseInt(e.target.value) || undefined)}
                      disabled={isReadOnly || isEditMode}
                      className={`w-20 px-3 py-2 border rounded-lg placeholder-slate-500 ${getInputClasses()}`}
                      placeholder="10"
                    />
                  </div>
                </div>
              )}
            </div>


            {/* Descrição (span completo) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Descrição *
              </label>
              <textarea
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={isReadOnly}
                className={`${getInputClasses(!!errors.notes)} resize-none`}
                placeholder="Digite a descrição do registro financeiro..."
                required
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-500">{errors.notes}</p>
              )}
            </div>

            {/* Campos de Validação (apenas quando validado) */}
            {mode === 'view' && register?.validated && (
              <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Validado em
                  </label>
                  <input
                    type="text"
                    value={register.validated_at ? new Date(register.validated_at).toLocaleString('pt-BR') : '-'}
                    disabled
                    className={getInputClasses()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Validado por
                  </label>
                  <input
                    type="text"
                    value={register.validated_by_name || '-'}
                    disabled
                    className={getInputClasses()}
                  />
                </div>
              </div>
            )}

            {/* Status de Validação (apenas visualização) */}
            {mode !== 'create' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Status de Validação
                </label>
                <div className="flex items-center gap-2">
                  {register?.validated ? (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm">
                      ✅ Validado pelo BPO
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm">
                      ⏳ Aguardando Validação
                    </span>
                  )}
                </div>
                {register?.validated && register.validated_at && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Validado em: {new Date(register.validated_at).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            )}

            {/* Erro geral */}
            {errors.submit && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
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