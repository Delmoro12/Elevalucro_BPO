'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, TrendingUp, TrendingDown, DollarSign, Calendar, FileText, CreditCard, Settings } from 'lucide-react';
import { CashMovement, CashMovementFormData } from '../../types/cashMovements';
import { FinancialAccount } from '../../types/config';
import { format } from 'date-fns';

interface CashMovementsModalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CashMovementFormData) => Promise<void>;
  movement?: CashMovement | null;
  mode: 'create' | 'edit' | 'view';
  financialAccounts: FinancialAccount[];
}

export const CashMovementsModalSidebar: React.FC<CashMovementsModalSidebarProps> = ({
  isOpen,
  onClose,
  onSave,
  movement,
  mode,
  financialAccounts
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CashMovementFormData>({
    financial_account_id: '',
    amount: 0,
    type: 'credit',
    description: '',
    reference_type: 'manual_adjustment',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (movement && mode !== 'create') {
      setFormData({
        financial_account_id: movement.financial_account_id,
        amount: movement.amount,
        type: movement.type,
        description: movement.description,
        reference_type: movement.reference_type || 'entrada',
        reference_id: movement.reference_id,
        date: movement.date
      });
    } else {
      setFormData({
        financial_account_id: financialAccounts.length === 1 ? financialAccounts[0].id : '',
        amount: 0,
        type: 'credit',
        description: '',
        reference_type: 'entrada',
        date: format(new Date(), 'yyyy-MM-dd')
      });
    }
  }, [movement, mode, financialAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Modal Submit - FormData:', formData);
    console.log('🔍 Modal Submit - Type being sent:', formData.type);
    console.log('🔍 Modal Submit - Reference type:', formData.reference_type);
    
    if (!formData.financial_account_id || !formData.amount || !formData.description) {
      console.error('❌ Campos obrigatórios faltando:', {
        financial_account_id: formData.financial_account_id,
        amount: formData.amount,
        description: formData.description
      });
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Enviando dados para salvar:', formData);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('❌ Erro ao salvar movimentação:', error);
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numberValue = Number(value) / 100;
    setFormData(prev => ({ ...prev, amount: numberValue }));
  };

  const isReadOnly = mode === 'view';

  const referenceTypes = [
    { value: 'saida', label: 'Saída' },
    { value: 'entrada', label: 'Entrada' },
    { value: 'saldo', label: 'Saldo' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md h-full overflow-y-auto animate-slide-in-right">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {mode === 'create' ? 'Nova Movimentação' : 
               mode === 'edit' ? 'Editar Movimentação' : 
               'Visualizar Movimentação'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de Movimentação */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Movimentação *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => !isReadOnly && setFormData(prev => ({ ...prev, type: 'credit' }))}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    formData.type === 'credit'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'border-slate-300 dark:border-slate-600 hover:border-green-400'
                  } ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={isReadOnly}
                >
                  <TrendingUp className="h-4 w-4" />
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => !isReadOnly && setFormData(prev => ({ ...prev, type: 'debit' }))}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    formData.type === 'debit'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      : 'border-slate-300 dark:border-slate-600 hover:border-red-400'
                  } ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={isReadOnly}
                >
                  <TrendingDown className="h-4 w-4" />
                  Saída
                </button>
              </div>
            </div>

            {/* Conta Financeira */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <CreditCard className="inline h-4 w-4 mr-1" />
                Conta Financeira *
              </label>
              <select
                value={formData.financial_account_id}
                onChange={(e) => setFormData(prev => ({ ...prev, financial_account_id: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                disabled={isReadOnly}
                required
              >
                <option value="">Selecione a conta</option>
                {financialAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Referência */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <Settings className="inline h-4 w-4 mr-1" />
                Tipo de Referência
              </label>
              <select
                value={formData.reference_type || 'entrada'}
                onChange={(e) => {
                  const newReferenceType = e.target.value;
                  let newType = formData.type;
                  
                  // Automaticamente ajustar o tipo baseado na referência
                  if (newReferenceType === 'saida') {
                    newType = 'debit';
                  } else if (newReferenceType === 'entrada') {
                    newType = 'credit';
                  }
                  // Para 'saldo', manter o tipo atual
                  
                  setFormData(prev => ({ 
                    ...prev, 
                    reference_type: newReferenceType,
                    type: newType
                  }));
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                disabled={isReadOnly}
              >
                {referenceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Valor *
              </label>
              <input
                type="text"
                value={formatCurrency(formData.amount)}
                onChange={handleAmountChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                disabled={isReadOnly}
                required
              />
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                disabled={isReadOnly}
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <FileText className="inline h-4 w-4 mr-1" />
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                placeholder="Descreva a movimentação..."
                disabled={isReadOnly}
                required
              />
            </div>

            {/* Botões */}
            {!isReadOnly && (
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};