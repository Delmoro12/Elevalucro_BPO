'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { DataTable03 } from '../../shared/components/DataTable03';
import type { 
  DataTable03Column, 
  DataTable03Tab, 
  DataTable03DateFilter,
  DataTable03Filter
} from '../../shared/components/DataTable03';
import { useCashMovements } from '../hooks/useCashMovements';
import { useFinancialAccounts } from '../hooks/useFinancialAccounts';
import type { CashMovement, CashMovementStatusTab } from '../types/cashMovements';

interface TabCounts {
  all: number;
  credits: number;
  debits: number;
}

interface CashMovementsTableProps {
  movements: CashMovement[];
  selectedAccountId?: string;
  activeMovementTab?: string;
  dateFilter?: DataTable03DateFilter | null;
  onAccountChange?: (accountId: string) => void;
  onTabChange?: (tabKey: string) => void;
  onDateFilterChange?: (dateFilter: DataTable03DateFilter | null) => void;
}

type TabKey = CashMovementStatusTab;

export const CashMovementsTable: React.FC<CashMovementsTableProps> = ({
  movements: cashMovements = [],
  selectedAccountId = 'all',
  activeMovementTab = 'all',
  dateFilter = null,
  onAccountChange,
  onTabChange,
  onDateFilterChange
}) => {
  const [searchValue, setSearchValue] = useState('');
  
  // Usar activeMovementTab da prop, com fallback para 'all'
  const activeTab = (activeMovementTab as TabKey) || 'all';

  // Por enquanto sem filtro de company_id - será implementado via RLS
  // Usando o mesmo company_id do FinanceTabs para consistência
  const companyId = '6db8c271-f6a0-41ea-a8e4-c3e627a29de5';
  
  // Hook para buscar contas financeiras
  const { financialAccounts, loading, error } = useFinancialAccounts(companyId);

  // Calcular contadores para as tabs
  const getTabCounts = (): TabCounts => {
    return cashMovements.reduce((acc: TabCounts, movement: CashMovement) => {
      acc.all++;
      
      if (movement.type === 'credit') {
        acc.credits++;
      } else if (movement.type === 'debit') {
        acc.debits++;
      }
      
      return acc;
    }, { all: 0, credits: 0, debits: 0 });
  };

  const tabCounts = getTabCounts();

  // Filtrar dados baseado nas seleções
  const filteredData = cashMovements.filter(movement => {
    // Filtro por conta
    if (selectedAccountId !== 'all' && movement.financial_account_id !== selectedAccountId) {
      return false;
    }

    // Filtro por tab
    if (activeTab === 'all') {
      // Mostrar todas as movimentações
    } else if (activeTab === 'credits' && movement.type !== 'credit') {
      return false;
    } else if (activeTab === 'debits' && movement.type !== 'debit') {
      return false;
    }

    // Filtro de busca
    if (searchValue) {
      const search = searchValue.toLowerCase();
      const searchText = `${movement.description || ''} ${movement.financial_account_name || ''} ${movement.reference_type || ''}`.toLowerCase();
      if (!searchText.includes(search)) return false;
    }

    // Filtro de data
    if (dateFilter && movement.date) {
      const movementDate = new Date(movement.date);
      
      if (dateFilter.type === 'month' && dateFilter.month) {
        const [year, month] = dateFilter.month.split('-');
        const filterMonth = new Date(parseInt(year), parseInt(month) - 1);
        if (movementDate.getMonth() !== filterMonth.getMonth() || movementDate.getFullYear() !== filterMonth.getFullYear()) {
          return false;
        }
      } else if (dateFilter.type === 'specific' && dateFilter.specificDate) {
        const movementDateStr = movement.date;
        if (movementDateStr !== dateFilter.specificDate) {
          return false;
        }
      } else if (dateFilter.type === 'range' && dateFilter.startDate && dateFilter.endDate) {
        const movementDateStr = movement.date;
        if (movementDateStr < dateFilter.startDate || movementDateStr > dateFilter.endDate) {
          return false;
        }
      }
    }

    return true;
  });

  // Função para formatar moeda
  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      // Se for apenas uma data (YYYY-MM-DD), adicionar horário para evitar problemas de timezone
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(dateString + 'T12:00:00').toLocaleDateString('pt-BR');
      }
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  // Função para formatar horário
  const formatTime = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return null;
    }
  };

  // Definir colunas da tabela
  const columns: DataTable03Column<CashMovement>[] = [
    {
      key: 'date',
      title: 'Data',
      width: '120px',
      render: (value, record) => {
        const displayDate = record.date || record.created_at;
        const timeSource = record.created_at;
        
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-white">
              {formatDate(displayDate)}
            </span>
            {formatTime(timeSource) && (
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {formatTime(timeSource)}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'description',
      title: 'Descrição',
      width: '200px',
      render: (value, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 dark:text-white">
            {record.description || '-'}
          </span>
          {record.reference_type && (
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tipo: {record.reference_type}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'financial_account_name',
      title: 'Conta',
      width: '150px',
      render: (value, record) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {record.financial_account_name || '-'}
        </span>
      )
    },
    {
      key: 'type',
      title: 'Tipo',
      width: '100px',
      render: (value, record) => {
        if (record.type === 'credit') {
          return (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs font-medium">
              📈 Entrada
            </span>
          );
        } else {
          return (
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-xs font-medium">
              📉 Saída
            </span>
          );
        }
      }
    },
    {
      key: 'amount',
      title: 'Valor',
      width: '120px',
      className: 'text-right',
      render: (value, record) => (
        <div className="text-right">
          <p className={`font-semibold ${
            record.type === 'credit' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(record.amount)}
          </p>
        </div>
      )
    }
  ];

  // Definir tabs
  const tabs: DataTable03Tab[] = [
    { key: 'all', label: 'Todas', icon: DollarSign, count: tabCounts.all },
    { key: 'credits', label: 'Entradas', icon: TrendingUp, count: tabCounts.credits },
    { key: 'debits', label: 'Saídas', icon: TrendingDown, count: tabCounts.debits }
  ];

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Erro ao carregar dados
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DataTable */}
      <DataTable03<CashMovement>
        data={filteredData}
        columns={columns}
        loading={loading}
        
        // Busca
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Buscar por descrição, conta, tipo..."
        
        // Filtro de data
        dateFilter={onDateFilterChange ? {
          value: dateFilter,
          onChange: onDateFilterChange,
          dateField: 'date',
          label: 'Período'
        } : undefined}
        
        // Filtros
        filters={
          financialAccounts.length > 0 ? [
            {
              key: 'account',
              label: 'Conta',
              type: 'select' as const,
              options: [
                { value: 'all', label: 'Todas as contas' },
                ...financialAccounts.map(account => ({
                  value: account.id,
                  label: account.description
                }))
              ],
              value: selectedAccountId,
              onChange: onAccountChange
            }
          ] : undefined
        }
        
        // Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        
        // Paginação
        pagination={{
          pageSize: 30,
          showTotal: true,
          showSizeChanger: true,
          pageSizeOptions: [10, 30, 50, 100]
        }}
        
        // Estados vazios
        emptyMessage="Nenhuma movimentação encontrada"
        emptyDescription="As movimentações de caixa aparecerão aqui quando disponíveis."
        emptyIcon={ArrowRightLeft}
        
        // Estilos
        className="shadow-sm"
      />
    </div>
  );
};