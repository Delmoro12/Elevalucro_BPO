'use client';

import React from 'react';
import { CashFlowTable } from '../components/cashFlow/CashFlowTable';
import { CashFlowIndicators } from '../components/cashFlow/CashFlowIndicators';
import { useCashFlowTransactions } from '../hooks/useCashFlowTransactions';
import { useCashFlowIndicators } from '../hooks/useCashFlowIndicators';
import { useFinancialAccounts, useFinancialCategories } from '../hooks/useFinancialConfig';

interface CashFlowMainPageProps {
  companyId: string;
  companyName: string;
  onIndicatorsChange?: (indicators: any[]) => void;
}

export const CashFlowMainPage: React.FC<CashFlowMainPageProps> = ({
  companyId,
  companyName,
  onIndicatorsChange
}) => {
  // Hooks para dados principais
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    filters,
    updateFilters,
    refetch
  } = useCashFlowTransactions(companyId);

  const {
    indicators,
    loading: indicatorsLoading,
    error: indicatorsError
  } = useCashFlowIndicators(companyId);

  // Hooks para dados auxiliares (filtros)
  const { accounts: financialAccounts } = useFinancialAccounts(companyId);
  const { categories: financialCategories } = useFinancialCategories(companyId);

  // Enviar indicadores para o header quando mudarem
  React.useEffect(() => {
    if (onIndicatorsChange && indicators) {
      onIndicatorsChange(indicators);
    }
  }, [indicators, onIndicatorsChange]);

  // Tratamento de erros
  if (transactionsError || indicatorsError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
            Erro ao carregar fluxo de caixa
          </h3>
          <p className="text-red-700 dark:text-red-300 text-sm">
            {transactionsError || indicatorsError}
          </p>
          <button
            onClick={refetch}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicadores */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Indicadores de Fluxo de Caixa
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Acompanhe a situação financeira de {companyName}
            </p>
          </div>
        </div>
        
        <CashFlowIndicators 
          indicators={indicators} 
          loading={indicatorsLoading} 
        />
      </div>

      {/* Tabela de Transações */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Fluxo de Caixa Detalhado
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Visualização cronológica de entradas e saídas
          </p>
        </div>
        
        <CashFlowTable
          transactions={transactions}
          loading={transactionsLoading}
          error={transactionsError}
          filters={filters}
          onFiltersChange={updateFilters}
          onRefresh={refetch}
          financialAccounts={financialAccounts}
          categories={financialCategories}
        />
      </div>
    </div>
  );
};