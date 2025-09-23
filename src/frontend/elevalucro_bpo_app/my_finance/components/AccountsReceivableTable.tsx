'use client';

import React, { useState } from 'react';
import { TrendingUp, FileText, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { DataTable03 } from '../../shared/components/DataTable03';
import type { 
  DataTable03Column, 
  DataTable03Tab, 
  DataTable03DateFilter 
} from '../../shared/components/DataTable03';
import { useAccountsReceivable } from '../hooks/useAccountsReceivable';
import type { AccountReceivable, AccountReceivableStatusTab } from '../types/accountsReceivable';
import { FinancialViewModal } from '../../shared/components/FinancialViewModal';

interface TabCounts {
  all: number;
  open: number;
  paid: number;
  overdue: number;
  cancelled: number;
}

type TabKey = AccountReceivableStatusTab;

interface AccountsReceivableTableProps {
  companyId: string;
}

export const AccountsReceivableTable: React.FC<AccountsReceivableTableProps> = ({ companyId }) => {
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('open');
  const [dateFilter, setDateFilter] = useState<DataTable03DateFilter | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<AccountReceivable | null>(null);
  
  // Hook para buscar dados das contas a receber
  const { accountsReceivable, loading, error } = useAccountsReceivable(companyId);

  // Calcular contadores para as tabs
  const getTabCounts = (): TabCounts => {
    const today = new Date().toISOString().split('T')[0];
    return accountsReceivable.reduce((acc: TabCounts, account: AccountReceivable) => {
      acc.all++;
      
      if (account.status === 'pending') {
        acc.open++;
        if (account.due_date && account.due_date < today) {
          acc.overdue++;
        }
      } else if (account.status === 'paid') {
        acc.paid++;
      } else if (account.status === 'cancelled') {
        acc.cancelled++;
      }
      
      return acc;
    }, { all: 0, open: 0, paid: 0, overdue: 0, cancelled: 0 });
  };

  const tabCounts = getTabCounts();

  // Handlers para o modal
  const handleRowClick = (transaction: AccountReceivable) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedTransaction(null);
  };

  // Filtrar dados baseado nas seleções
  const filteredData = accountsReceivable.filter(account => {
    // Filtro por tab
    if (activeTab === 'all') {
      // Mostrar todas as contas
    } else if (activeTab === 'open' && account.status !== 'pending') {
      return false;
    } else if (activeTab === 'paid' && account.status !== 'paid') {
      return false;
    } else if (activeTab === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      if (account.status !== 'pending' || !account.due_date || account.due_date >= today) {
        return false;
      }
    } else if (activeTab === 'cancelled' && account.status !== 'cancelled') {
      return false;
    }

    // Filtro de busca
    if (searchValue && !account.search_text.includes(searchValue.toLowerCase())) return false;

    // Filtro de data (implementação básica - pode ser expandida)
    if (dateFilter) {
      const dueDate = new Date(account.due_date);
      const today = new Date();
      
      if (dateFilter.type === 'month' && dateFilter.month) {
        const [year, month] = dateFilter.month.split('-');
        const filterMonth = new Date(parseInt(year), parseInt(month) - 1);
        if (dueDate.getMonth() !== filterMonth.getMonth() || dueDate.getFullYear() !== filterMonth.getFullYear()) {
          return false;
        }
      }
    }

    return true;
  });

  // Definir colunas da tabela
  const columns: DataTable03Column<AccountReceivable>[] = [
    {
      key: 'client_name',
      title: 'Cliente',
      width: '200px',
      render: (value, record) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{value || 'N/A'}</p>
          {record.series_id && (
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Série {record.installment_number}/{record.installment_total}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'category_name',
      title: 'Categoria',
      width: '150px',
      render: (value) => (
        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs">
          {value || 'Sem categoria'}
        </span>
      )
    },
    {
      key: 'value_formatted',
      title: 'Valor',
      width: '120px',
      className: 'text-right',
      render: (value, record) => (
        <div className="text-right">
          <p className="font-semibold text-slate-900 dark:text-white">R$ {value}</p>
          {record.status === 'paid' && record.paid_amount && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Pago: R$ {record.paid_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'due_date_formatted',
      title: 'Vencimento',
      width: '120px',
      render: (value, record) => (
        <div>
          <p className="text-slate-900 dark:text-white">{value}</p>
          {record.status === 'pending' && (
            <p className={`text-xs ${
              record.status_vencimento === 'vencida' ? 'text-red-600 dark:text-red-400' :
              record.status_vencimento === 'vence_em_breve' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-slate-500 dark:text-slate-400'
            }`}>
              {(record.dias_vencimento ?? 0) < 0 ? `${Math.abs(record.dias_vencimento ?? 0)} dias em atraso` :
               (record.dias_vencimento ?? 0) === 0 ? 'Vence hoje' :
               `${record.dias_vencimento ?? 0} dias restantes`}
            </p>
          )}
          {record.status === 'paid' && record.payment_date && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Pago em: {new Date(record.payment_date).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'payment_method',
      title: 'Método',
      width: '100px',
      render: (value) => {
        const methods = {
          pix: { label: 'PIX', icon: '💳', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' },
          bank_slip: { label: 'Boleto', icon: '📄', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' },
          bank_transfer: { label: 'Transferência', icon: '🏦', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' }
        };
        const method = methods[value as keyof typeof methods] || { label: value, icon: '💰', color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' };
        
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${method.color}`}>
            {method.icon} {method.label}
          </span>
        );
      }
    },
    {
      key: 'status',
      title: 'Status',
      width: '100px',
      render: (value, record) => {
        if (value === 'paid') {
          return (
            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded text-xs font-medium">
              ✅ Recebida
            </span>
          );
        }
        
        const statusColors = {
          vencida: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
          vence_em_breve: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
          em_dia: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
          sem_data: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
        };
        
        const statusLabels = {
          vencida: '🔴 Vencida',
          vence_em_breve: '🟡 Vence em breve',
          em_dia: '🔵 Em dia',
          sem_data: '⚪ Sem data'
        };
        
        const color = statusColors[record.status_vencimento as keyof typeof statusColors] || statusColors.sem_data;
        const label = statusLabels[record.status_vencimento as keyof typeof statusLabels] || 'Pendente';
        
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
            {label}
          </span>
        );
      }
    },
    {
      key: 'number_of_document',
      title: 'Documento',
      width: '120px',
      render: (value) => value || '-'
    }
  ];

  // Definir tabs
  const tabs: DataTable03Tab[] = [
    { key: 'all', label: 'Todas', icon: FileText, count: tabCounts.all },
    { key: 'open', label: 'Em aberto', icon: Clock, count: tabCounts.open },
    { key: 'paid', label: 'Recebidas', icon: CheckCircle, count: tabCounts.paid },
    { key: 'overdue', label: 'Atrasadas', icon: AlertTriangle, count: tabCounts.overdue },
    { key: 'cancelled', label: 'Canceladas', icon: XCircle, count: tabCounts.cancelled }
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
      <DataTable03<AccountReceivable>
        data={filteredData}
        columns={columns}
        loading={loading}
        
        // Busca
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Buscar por cliente, documento, categoria..."
        
        // Filtro de data
        dateFilter={{
          value: dateFilter,
          onChange: setDateFilter,
          dateField: 'due_date',
          label: 'Período'
        }}
        
        // Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as TabKey)}
        
        // Paginação
        pagination={{
          pageSize: 30,
          showTotal: true,
          showSizeChanger: true,
          pageSizeOptions: [10, 30, 50, 100]
        }}
        
        // Estados vazios
        emptyMessage="Nenhuma conta a receber encontrada"
        emptyDescription="Comece adicionando a primeira conta a receber."
        emptyIcon={TrendingUp}
        
        // Estilos
        className="shadow-sm"
        
        // Handler para clique na linha
        onRowClick={handleRowClick}
      />

      {/* Modal de Visualização */}
      {showViewModal && selectedTransaction && (
        <FinancialViewModal
          transaction={{
            ...selectedTransaction,
            type: 'receivable' as const,
            created_by_side: 'client_side'
          }}
          isOpen={showViewModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};