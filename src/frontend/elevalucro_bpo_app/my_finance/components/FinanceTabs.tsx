'use client';

import React, { useState } from 'react';
import { TrendingDown, TrendingUp, ArrowRightLeft } from 'lucide-react';
import { AccountsPayableTable } from './AccountsPayableTable';
import { AccountsReceivableTable } from './AccountsReceivableTable';
import { CashMovementsTable } from './CashMovementsTable';
import { useCashMovements } from '../hooks/useCashMovements';
import { useCashMovementsIndicators } from '../hooks/useCashMovementsIndicators';
import { useAccountsReceivableIndicators } from '../../financial_registers/hooks/useAccountsReceivableIndicators';
import { useAccountsPayableIndicators } from '../../financial_registers/hooks/useAccountsPayableIndicators';
import { useAuth } from '../../auth/contexts/AuthContext';

type FinanceTabType = 'payable' | 'receivable' | 'movements';

interface FinanceTabsProps {}

export const FinanceTabs: React.FC<FinanceTabsProps> = () => {
  const { companyId, user, loading: authLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<FinanceTabType>('payable');
  
  // Estados centralizados dos filtros para movimentações
  const [movementFilters, setMovementFilters] = useState({
    selectedAccountId: 'all',
    dateFilter: null,
    activeTab: 'all'
  });
  
  // Hook para buscar dados das movimentações de caixa (só quando tab ativa e tem companyId)
  const { cashMovements } = useCashMovements(
    activeTab === 'movements' && companyId ? companyId : ''
  );
  
  // Hook para calcular indicadores (só quando tab ativa e tem companyId)
  const { indicators: movementsIndicators } = useCashMovementsIndicators(
    activeTab === 'movements' && companyId ? companyId : '', 
    cashMovements || [], 
    movementFilters
  );
  
  // Hooks para indicadores de contas a receber e pagar
  const { 
    indicators: receivableIndicators, 
    loading: receivableLoading 
  } = useAccountsReceivableIndicators(companyId || '');
  
  const { 
    indicators: payableIndicators, 
    loading: payableLoading 
  } = useAccountsPayableIndicators(companyId || '');

  // Handlers para filtros de movimentações
  const handleAccountChange = (accountId: string) => {
    setMovementFilters(prev => ({ ...prev, selectedAccountId: accountId }));
  };

  const handleMovementTabChange = (tabKey: string) => {
    setMovementFilters(prev => ({ ...prev, activeTab: tabKey }));
  };

  const handleDateFilterChange = (dateFilter: any) => {
    setMovementFilters(prev => ({ ...prev, dateFilter }));
  };

  const tabs = [
    {
      key: 'payable' as FinanceTabType,
      label: 'Contas a Pagar',
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:text-red-700 dark:hover:text-red-300',
      activeColor: 'text-red-600 dark:text-red-400 border-red-600 dark:border-red-400'
    },
    {
      key: 'receivable' as FinanceTabType,
      label: 'Contas a Receber',
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:text-green-700 dark:hover:text-green-300',
      activeColor: 'text-green-600 dark:text-green-400 border-green-600 dark:border-green-400'
    },
    {
      key: 'movements' as FinanceTabType,
      label: 'Movimentações',
      icon: ArrowRightLeft,
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:text-blue-700 dark:hover:text-blue-300',
      activeColor: 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
    }
  ];

  const renderTabContent = () => {
    // Não renderizar se não tiver companyId
    if (!companyId) {
      return (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            Empresa não encontrada. Verifique se você tem permissão para acessar os dados financeiros.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case 'payable':
        return <AccountsPayableTable companyId={companyId} />;
      case 'receivable':
        return <AccountsReceivableTable companyId={companyId} />;
      case 'movements':
        return (
          <CashMovementsTable
            movements={cashMovements}
            selectedAccountId={movementFilters.selectedAccountId}
            activeMovementTab={movementFilters.activeTab}
            dateFilter={movementFilters.dateFilter}
            onAccountChange={handleAccountChange}
            onTabChange={handleMovementTabChange}
            onDateFilterChange={handleDateFilterChange}
          />
        );
      default:
        return null;
    }
  };

  // Loading de autenticação
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Usuário não autenticado
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">
          Você precisa estar logado para visualizar os dados financeiros.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Global */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
            {activeTab === 'payable' ? (
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            ) : activeTab === 'receivable' ? (
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            ) : (
              <ArrowRightLeft className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Gestão Financeira
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {activeTab === 'payable' ? 'Gerencie suas contas a pagar' :
               activeTab === 'receivable' ? 'Gerencie suas contas a receber' :
               'Controle suas movimentações de caixa'}
            </p>
          </div>
        </div>
        
        {/* Indicadores da tab ativa */}
        {activeTab === 'movements' && movementsIndicators.length > 0 && (
          <div className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-6">
            {movementsIndicators.map((indicator, index) => (
              <div key={index} className="text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-end space-x-2 mb-1">
                  {indicator.icon && <indicator.icon className="h-4 w-4 text-gray-400" />}
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {indicator.label}
                  </span>
                </div>
                <p className={`text-lg font-bold ${indicator.color || 'text-gray-900 dark:text-gray-100'}`}>
                  {indicator.value}
                </p>
              </div>
            ))}
          </div>
        )}
        
        {/* Indicadores para Contas a Receber */}
        {activeTab === 'receivable' && !receivableLoading && receivableIndicators.length > 0 && (
          <div className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-6">
            {receivableIndicators.map((indicator, index) => (
              <div key={index} className="text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-end space-x-2 mb-1">
                  {indicator.icon && <indicator.icon className="h-4 w-4 text-gray-400" />}
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {indicator.label}
                  </span>
                </div>
                <p className={`text-lg font-bold ${indicator.color || 'text-gray-900 dark:text-gray-100'}`}>
                  {indicator.value}
                </p>
              </div>
            ))}
          </div>
        )}
        
        {/* Indicadores para Contas a Pagar */}
        {activeTab === 'payable' && !payableLoading && payableIndicators.length > 0 && (
          <div className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-6">
            {payableIndicators.map((indicator, index) => (
              <div key={index} className="text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-end space-x-2 mb-1">
                  {indicator.icon && <indicator.icon className="h-4 w-4 text-gray-400" />}
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {indicator.label}
                  </span>
                </div>
                <p className={`text-lg font-bold ${indicator.color || 'text-gray-900 dark:text-gray-100'}`}>
                  {indicator.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? `border-current ${tab.activeColor}`
                    : `border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 ${tab.hoverColor}`
                }`}
              >
                <Icon className={`mr-2 h-5 w-5 ${
                  isActive ? '' : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300'
                }`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
};