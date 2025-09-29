'use client';

import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit2, Trash2, Filter } from 'lucide-react';
import { DataTable02, DataTable02Tab, DataTable02DateFilter } from '../../../../shared/components/DataTable02';
import { CashMovement, CashMovementTab } from '../../types/cashMovements';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FinancialAccount } from '../../types/config';

interface CashMovementsTableProps {
  movements: CashMovement[];
  financialAccounts: FinancialAccount[];
  loading?: boolean;
  onEdit?: (movement: CashMovement) => void;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
  selectedAccountId?: string;
  onAccountChange?: (accountId: string) => void;
  onTabChange?: (tab: CashMovementTab) => void;
  onDateFilterChange?: (dateFilter: DataTable02DateFilter | null) => void;
}

export const CashMovementsTable: React.FC<CashMovementsTableProps> = ({
  movements,
  financialAccounts,
  loading = false,
  onEdit,
  onDelete,
  onCreate,
  onRefresh,
  selectedAccountId,
  onAccountChange,
  onTabChange,
  onDateFilterChange
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<CashMovementTab>('all');
  const [dateFilter, setDateFilter] = useState<DataTable02DateFilter | null>(null);

  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      // Se for apenas uma data (YYYY-MM-DD), adicionar horário para evitar problemas de timezone
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return format(new Date(dateString + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR });
      }
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'HH:mm', { locale: ptBR });
    } catch {
      return null;
    }
  };

  const formatReferenceType = (referenceType?: string) => {
    if (!referenceType) return null;
    
    const referenceTypeMap: { [key: string]: string } = {
      'saida': 'Saída',
      'entrada': 'Entrada',
      'saldo': 'Saldo',
      // Manter compatibilidade com valores antigos (se existirem)
      'manual_adjustment': 'Ajuste Manual',
      'initial_balance': 'Saldo Inicial',
      'account_payment': 'Pagamento de Conta (Automático)',
      'account_receipt': 'Recebimento (Automático)',
      'transfer': 'Transferência',
      'other': 'Outros'
    };

    return referenceTypeMap[referenceType] || referenceType;
  };

  // Filtrar por data
  const getFilteredByDate = (data: CashMovement[]) => {
    if (!dateFilter) return data;

    return data.filter(movement => {
      if (!movement.date) return false;
      
      const movementDate = new Date(movement.date);
      const movementDateStr = movement.date; // YYYY-MM-DD format
      
      switch (dateFilter.type) {
        case 'month':
          if (dateFilter.month) {
            const [year, month] = dateFilter.month.split('-');
            const movementYear = movementDate.getFullYear().toString();
            const movementMonth = String(movementDate.getMonth() + 1).padStart(2, '0');
            return movementYear === year && movementMonth === month;
          }
          break;
          
        case 'specific':
          if (dateFilter.specificDate) {
            return movementDateStr === dateFilter.specificDate;
          }
          break;
          
        case 'range':
          if (dateFilter.startDate && dateFilter.endDate) {
            return movementDateStr >= dateFilter.startDate && movementDateStr <= dateFilter.endDate;
          }
          break;
      }
      
      return true;
    });
  };

  // Filtrar por conta financeira
  const getFilteredByAccount = (data: CashMovement[]) => {
    if (!selectedAccountId || selectedAccountId === 'all') return data;
    return data.filter(movement => movement.financial_account_id === selectedAccountId);
  };

  // Filtrar por tipo (tab)
  const getFilteredByType = (data: CashMovement[]) => {
    switch (activeTab) {
      case 'credits':
        return data.filter(movement => movement.type === 'credit');
      case 'debits':
        return data.filter(movement => movement.type === 'debit');
      default:
        return data;
    }
  };

  // Aplicar filtros na ordem
  const dataFilteredByAccount = getFilteredByAccount(movements || []);
  const dataFilteredByDate = getFilteredByDate(dataFilteredByAccount);
  const dataFilteredByType = getFilteredByType(dataFilteredByDate);
  
  // Aplicar busca
  const dataFilteredBySearch = dataFilteredByType.filter(movement => {
    if (!movement) return false;
    if (!searchValue) return true;
    const search = searchValue.toLowerCase();
    return movement.description?.toLowerCase().includes(search) ||
           movement.financial_account_name?.toLowerCase().includes(search) ||
           movement.reference_type?.toLowerCase().includes(search);
  });

  // Dados filtrados (sem necessidade de recálculo de saldo)
  const filteredData = dataFilteredBySearch;

  // Calcular totais para as tabs
  const getTabCounts = () => {
    const baseData = getFilteredByAccount(getFilteredByDate(movements || []));
    
    const all = baseData.length;
    const credits = baseData.filter(m => m.type === 'credit').length;
    const debits = baseData.filter(m => m.type === 'debit').length;

    // Calcular saldos
    const totalCredits = baseData
      .filter(m => m.type === 'credit')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    
    const totalDebits = baseData
      .filter(m => m.type === 'debit')
      .reduce((sum, m) => sum + (m.amount || 0), 0);

    return { all, credits, debits, totalCredits, totalDebits, balance: totalCredits - totalDebits };
  };

  const counts = getTabCounts();

  // Definir tabs
  const tabs: DataTable02Tab[] = [
    {
      key: 'all',
      label: 'Todas',
      icon: DollarSign,
      count: counts.all
    },
    {
      key: 'credits',
      label: 'Entradas',
      icon: TrendingUp,
      count: counts.credits
    },
    {
      key: 'debits',
      label: 'Saídas',
      icon: TrendingDown,
      count: counts.debits
    }
  ];

  const columns = [
    {
      key: 'date',
      title: 'Data',
      width: '120px',
      render: (value: any, movement: CashMovement) => {
        // Usar created_at para mostrar horário, mas date para a data principal se disponível
        const displayDate = movement?.date || movement?.created_at;
        const timeSource = movement?.created_at; // Sempre usar created_at para horário
        
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {formatDate(displayDate)}
            </span>
            {formatTime(timeSource) && (
              <span className="text-xs text-gray-500 mt-1">
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
      render: (value: any, movement: CashMovement) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {movement?.description || '-'}
          </span>
          {movement?.reference_type && (
            <span className="text-xs text-gray-500 mt-1">
              Tipo: {formatReferenceType(movement.reference_type)}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'financial_account_name',
      title: 'Conta',
      render: (value: any, movement: CashMovement) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {movement?.financial_account_name || 
           financialAccounts.find(a => a.id === movement?.financial_account_id)?.description || 
           '-'}
        </span>
      )
    },
    {
      key: 'credit',
      title: 'Crédito',
      render: (value: any, movement: CashMovement) => (
        <span className="font-medium text-green-600 dark:text-green-400">
          {movement?.type === 'credit' ? formatCurrency(movement?.amount) : '-'}
        </span>
      )
    },
    {
      key: 'debit',
      title: 'Débito',
      render: (value: any, movement: CashMovement) => (
        <span className="font-medium text-red-600 dark:text-red-400">
          {movement?.type === 'debit' ? formatCurrency(movement?.amount) : '-'}
        </span>
      )
    }
  ];

  // Função para verificar se uma movimentação pode ser editada/excluída
  const canManageMovement = (movement: CashMovement) => {
    // Não permitir edição/exclusão de movimentações criadas automaticamente
    const automaticTypes = ['account_payment', 'account_receipt'];
    return !movement.reference_type || !automaticTypes.includes(movement.reference_type);
  };

  const actions = [
    {
      key: 'edit',
      icon: Edit2,
      title: 'Editar',
      onClick: onEdit || (() => {}),
      show: canManageMovement
    },
    {
      key: 'delete',
      icon: Trash2,
      title: 'Excluir',
      onClick: (movement: CashMovement) => onDelete?.(movement.id),
      show: canManageMovement
    }
  ];

  const createButton = onCreate ? {
    label: 'Nova Movimentação',
    icon: Plus,
    onClick: onCreate
  } : undefined;

  return (
    <DataTable02
        data={filteredData}
        columns={columns}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Buscar por descrição, tipo..."
        dateFilter={{
          value: dateFilter,
          onChange: (newDateFilter) => {
            setDateFilter(newDateFilter);
            onDateFilterChange?.(newDateFilter);
          },
          dateField: 'date',
          label: 'Período'
        }}
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
              value: selectedAccountId || 'all',
              onChange: (value) => onAccountChange?.(value)
            }
          ] : undefined
        }
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(key) => {
          const newTab = key as CashMovementTab;
          setActiveTab(newTab);
          onTabChange?.(newTab);
        }}
        actions={actions}
        createButton={createButton}
        loading={loading}
        emptyMessage="Nenhuma movimentação encontrada"
        emptyDescription="Comece adicionando a primeira movimentação."
        onRowClick={(movement: CashMovement) => {
          // Só permitir clique se a movimentação pode ser editada
          if (canManageMovement(movement)) {
            onEdit?.(movement);
          }
        }}
      />
  );
};