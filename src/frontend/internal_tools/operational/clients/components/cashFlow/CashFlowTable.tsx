'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Download
} from 'lucide-react';
import { DataTable02 } from '../../../../shared/components/DataTable02';
import type { 
  DataTable02Column, 
  DataTable02Tab,
  DataTable02DateFilter,
  DataTable02SelectFilter
} from '../../../../shared/components/DataTable02';
import { CashFlowTransaction, CashFlowFilters } from '../../types/cashFlow';

interface CashFlowTableProps {
  transactions: CashFlowTransaction[];
  loading: boolean;
  error: string | null;
  filters: CashFlowFilters;
  onFiltersChange: (filters: Partial<CashFlowFilters>) => void;
  onRefresh: () => void;
  financialAccounts?: Array<{ id: string; description: string; }>;
  categories?: Array<{ id: string; description: string; }>;
}

export const CashFlowTable: React.FC<CashFlowTableProps> = ({
  transactions,
  loading,
  error,
  filters,
  onFiltersChange,
  onRefresh,
  financialAccounts = [],
  categories = []
}) => {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [activeTab, setActiveTab] = useState<string>(filters.type || 'all');

  // Calcular contadores para as tabs
  const tabCounts = useMemo(() => {
    const all = transactions.length;
    const credits = transactions.filter(t => t.cash_flow_type === 'CRÉDITO').length;
    const debits = transactions.filter(t => t.cash_flow_type === 'DÉBITO').length;
    const realized = transactions.filter(t => t.cash_flow_status === 'REALIZADO').length;
    const pending = transactions.filter(t => t.cash_flow_status !== 'REALIZADO').length;

    return { all, credits, debits, realized, pending };
  }, [transactions]);

  // Definição das tabs
  const tabs: DataTable02Tab[] = [
    {
      key: 'all',
      label: 'Todas',
      count: tabCounts.all,
      icon: Calendar
    },
    {
      key: 'credit',
      label: 'Créditos',
      count: tabCounts.credits,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'debit',
      label: 'Débitos',
      count: tabCounts.debits,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      key: 'realized',
      label: 'Realizados',
      count: tabCounts.realized
    },
    {
      key: 'pending',
      label: 'Pendentes',
      count: tabCounts.pending
    }
  ];

  // Filtrar dados baseado na tab ativa
  const filteredData = useMemo(() => {
    let filtered = transactions;

    // Filtro por tab
    switch (activeTab) {
      case 'credit':
        filtered = filtered.filter(t => t.cash_flow_type === 'CRÉDITO');
        break;
      case 'debit':
        filtered = filtered.filter(t => t.cash_flow_type === 'DÉBITO');
        break;
      case 'realized':
        filtered = filtered.filter(t => t.cash_flow_status === 'REALIZADO');
        break;
      case 'pending':
        filtered = filtered.filter(t => t.cash_flow_status !== 'REALIZADO');
        break;
    }

    // Filtro por busca
    if (searchValue.trim()) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(t => 
        t.third_party_name.toLowerCase().includes(search) ||
        t.category_name.toLowerCase().includes(search) ||
        t.number_of_document?.toLowerCase().includes(search) ||
        t.observacao?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [transactions, activeTab, searchValue]);

  // Definição das colunas
  const columns: DataTable02Column<CashFlowTransaction>[] = [
    {
      key: 'due_date_formatted',
      title: 'Vencimento',
      width: '120px',
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium">{value}</div>
          {row.cash_flow_status !== 'REALIZADO' && row.days_to_due !== null && (
            <div className={`text-xs ${
              row.days_to_due < 0 ? 'text-red-500' : 
              row.days_to_due <= 7 ? 'text-yellow-500' : 'text-slate-500'
            }`}>
              {row.days_to_due < 0 ? `${Math.abs(row.days_to_due)} dias atraso` :
               row.days_to_due === 0 ? 'Hoje' :
               `${row.days_to_due} dias`}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'cash_flow_type',
      title: 'Tipo',
      width: '100px',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value === 'CRÉDITO' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'third_party_name',
      title: 'Cliente/Fornecedor',
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium">{value}</div>
          {row.third_party_document && (
            <div className="text-xs text-slate-500">{row.third_party_document}</div>
          )}
        </div>
      )
    },
    {
      key: 'category_name',
      title: 'Categoria',
      width: '150px',
      render: (value, row) => (
        <div className="text-sm">
          <div>{value}</div>
          {row.dre_group_name && (
            <div className="text-xs text-slate-500">{row.dre_group_name}</div>
          )}
        </div>
      )
    },
    {
      key: 'credit_value',
      title: 'Crédito',
      width: '120px',
      align: 'right' as const,
      render: (value, row) => (
        <div className="text-sm text-right">
          {row.cash_flow_type === 'CRÉDITO' ? (
            <span className="font-semibold text-green-600 dark:text-green-400">
              {row.value_formatted}
            </span>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      )
    },
    {
      key: 'debit_value',
      title: 'Débito',
      width: '120px',
      align: 'right' as const,
      render: (value, row) => (
        <div className="text-sm text-right">
          {row.cash_flow_type === 'DÉBITO' ? (
            <span className="font-semibold text-red-600 dark:text-red-400">
              {row.value_formatted}
            </span>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      )
    },
    {
      key: 'observacao',
      title: 'Observação',
      render: (value, row) => (
        <div className="text-sm">
          {value && <div className="mb-1">{value}</div>}
          {row.number_of_document && (
            <div className="text-xs text-slate-500">Doc: {row.number_of_document}</div>
          )}
        </div>
      )
    }
  ];

  // Filtros avançados
  const selectFilters: DataTable02SelectFilter[] = [
    {
      key: 'financial_account_id',
      label: 'Conta Financeira',
      value: filters.financial_account_id || 'all',
      options: [
        { value: 'all', label: 'Todas as contas' },
        ...financialAccounts.map(account => ({
          value: account.id,
          label: account.description
        }))
      ],
      onChange: (value) => onFiltersChange({ financial_account_id: value === 'all' ? undefined : value })
    },
    {
      key: 'category_id',
      label: 'Categoria',
      value: filters.category_id || 'all',
      options: [
        { value: 'all', label: 'Todas as categorias' },
        ...categories.map(category => ({
          value: category.id,
          label: category.description
        }))
      ],
      onChange: (value) => onFiltersChange({ category_id: value === 'all' ? undefined : value })
    }
  ];

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    onFiltersChange({ type: tabKey === 'all' ? undefined : tabKey as any });
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onFiltersChange({ search: value || undefined });
  };

  const handleDateFilter = (dateFilter: DataTable02DateFilter | null) => {
    if (dateFilter) {
      onFiltersChange({
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate
      });
    } else {
      onFiltersChange({
        startDate: undefined,
        endDate: undefined
      });
    }
  };

  return (
    <DataTable02<CashFlowTransaction>
      data={filteredData}
      columns={columns}
      loading={loading}
      error={error}
      
      // Configuração de tabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      
      // Configuração de busca
      searchValue={searchValue}
      onSearchChange={handleSearch}
      searchPlaceholder="Buscar por cliente, fornecedor, categoria..."
      
      // Configuração de filtros
      selectFilters={selectFilters}
      onDateFilterChange={handleDateFilter}
      
      // Ações da toolbar
      toolbarActions={[
        {
          label: 'Atualizar',
          icon: RefreshCw,
          onClick: onRefresh,
          variant: 'secondary'
        },
        {
          label: 'Exportar',
          icon: Download,
          onClick: () => {
            // TODO: Implementar exportação
            console.log('Exportar fluxo de caixa');
          },
          variant: 'secondary'
        }
      ]}
      
      // Configurações gerais
      emptyMessage="Nenhuma transação de fluxo de caixa encontrada"
      rowsPerPage={50}
    />
  );
};