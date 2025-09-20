'use client';

import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, CreditCard, FileText } from 'lucide-react';
import { AccountReceivable } from '../../types/accountsReceivable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFinancialAccounts } from '../../hooks/useFinancialConfig';
import { FinancialAccount } from '../../types/config';
import { accountBalancesApi } from '../../services/accountBalances.api';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountReceivable;
  onConfirm: (receiptData: {
    financial_account_id: string;
    receipt_date: string;
    received_amount: number;
    notes?: string;
  }) => Promise<void>;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  account,
  onConfirm
}) => {
  const [loading, setLoading] = useState(false);
  const [accountBalances, setAccountBalances] = useState<any[]>([]);
  const { accounts: financialAccounts } = useFinancialAccounts(account?.company_id || '');
  const [formData, setFormData] = useState({
    financial_account_id: '',
    receipt_date: format(new Date(), 'yyyy-MM-dd'),
    received_amount: account?.value || 0,
    notes: ''
  });

  // Buscar saldos das contas
  useEffect(() => {
    const fetchBalances = async () => {
      if (!account?.company_id) return;
      
      try {
        const balances = await accountBalancesApi.getByCompany(account.company_id);
        setAccountBalances(balances);
      } catch (error) {
        console.error('Erro ao buscar saldos:', error);
      }
    };

    if (isOpen) {
      fetchBalances();
    }
  }, [account?.company_id, isOpen]);

  // Se houver apenas uma conta, seleciona automaticamente
  useEffect(() => {
    if (financialAccounts.length === 1 && !formData.financial_account_id) {
      setFormData(prev => ({ ...prev, financial_account_id: financialAccounts[0].id }));
    }
  }, [financialAccounts]);

  // Função para obter saldo da conta selecionada
  const getSelectedAccountBalance = () => {
    if (!formData.financial_account_id) return 0;
    const balance = accountBalances.find(b => b.financial_account_id === formData.financial_account_id);
    return balance?.current_balance || 0;
  };

  // Para recebimentos, não há restrição de saldo
  const hasSufficientBalance = () => {
    return true; // Sempre permitir recebimentos
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.financial_account_id) {
      alert('Por favor, selecione uma conta financeira');
      return;
    }

    // Para recebimentos, não há validação de saldo

    setLoading(true);
    try {
      await onConfirm(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao processar recebimento:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numberValue = Number(value) / 100;
    setFormData(prev => ({ ...prev, received_amount: numberValue }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Registrar Recebimento
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informações da conta */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Cliente:</span>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {account?.client_name || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Documento:</span>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {account?.number_of_document || '-'}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Valor Original:</span>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {formatCurrency(account?.value)}
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Vencimento:</span>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {account?.due_date ? format(new Date(account.due_date), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              required
            >
              <option value="">Selecione a conta</option>
              {financialAccounts.map(account => {
                const balance = accountBalances.find(b => b.financial_account_id === account.id);
                const accountBalance = balance?.current_balance || 0;
                
                return (
                  <option key={account.id} value={account.id}>
                    {account.description} - {formatCurrency(accountBalance)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Data do Recebimento */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              Data do Recebimento *
            </label>
            <input
              type="date"
              value={formData.receipt_date}
              onChange={(e) => setFormData(prev => ({ ...prev, receipt_date: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              required
            />
          </div>

          {/* Valor Recebido */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Valor a Receber *
            </label>
            <input
              type="text"
              value={formatCurrency(formData.received_amount)}
              onChange={handleAmountChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              required
            />
            {formData.received_amount !== account?.value && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Valor diferente do original ({formatCurrency(account?.value)})
              </p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <FileText className="inline h-4 w-4 mr-1" />
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              placeholder="Observações sobre o recebimento (opcional)"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Confirmar Recebimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};