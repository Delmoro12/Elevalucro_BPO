'use client';

import React, { useState } from 'react';
import { Eye, Edit2, Trash2, Plus, FileText, Clock, CheckCircle, AlertTriangle, XCircle, DollarSign, Copy, Ban, RotateCcw, Link, Repeat, Edit3, Trash } from 'lucide-react';
import { DataTable02, DataTable02Tab, DataTable02DateFilter } from '../../../../shared/components/DataTable02';
import { AccountReceivable, AccountReceivableStatusTab } from '../../types/accountsReceivable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { accountsReceivableActionsApi } from '../../services/accountsReceivableActions.api';
import { ReceiptModal } from './ReceiptModal';

interface AccountsReceivableTableProps {
  accountsReceivable: AccountReceivable[];
  loading?: boolean;
  onView?: (account: AccountReceivable) => void;
  onEdit?: (account: AccountReceivable) => void;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
  onDeleteSeries?: (seriesId: string) => void;
}

export const AccountsReceivableTable: React.FC<AccountsReceivableTableProps> = ({
  accountsReceivable,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onRefresh,
  onDeleteSeries
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<AccountReceivableStatusTab>('open');
  const [dateFilter, setDateFilter] = useState<DataTable02DateFilter | null>(null);
  const [receiptModalData, setReceiptModalData] = useState<AccountReceivable | null>(null);

  // Funções de ação
  const handleMarkAsReceived = async (account: AccountReceivable) => {
    // Abre o modal de recebimento ao invés de marcar diretamente como recebida
    setReceiptModalData(account);
  };

  const handleReceiptConfirm = async (receiptData: {
    financial_account_id: string;
    receipt_date: string;
    received_amount: number;
    notes?: string;
  }) => {
    if (!receiptModalData) return;
    
    try {
      // Chamar API para processar recebimento com a conta financeira
      await accountsReceivableActionsApi.processReceipt(receiptModalData.id, receiptData);
      setReceiptModalData(null);
      onRefresh?.();
    } catch (error) {
      console.error('Erro ao processar recebimento:', error);
      throw error;
    }
  };

  const handleCloneAccount = async (account: AccountReceivable) => {
    try {
      await accountsReceivableActionsApi.cloneAccount(account.id);
      onRefresh?.();
    } catch (error) {
      console.error('Erro ao clonar conta:', error);
    }
  };

  const handleCancelAccount = async (account: AccountReceivable) => {
    try {
      await accountsReceivableActionsApi.markAsCancelled(account.id);
      onRefresh?.();
    } catch (error) {
      console.error('Erro ao cancelar conta:', error);
    }
  };

  const handleReverseReceipt = async (account: AccountReceivable) => {
    try {
      await accountsReceivableActionsApi.reverseReceipt(account.id);
      onRefresh?.();
    } catch (error) {
      console.error('Erro ao estornar recebimento:', error);
    }
  };

  const handleDeleteAccount = async (account: AccountReceivable) => {
    try {
      await accountsReceivableActionsApi.deleteAccount(account.id);
      onRefresh?.();
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
    }
  };

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
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  const formatPaymentMethod = (method?: string) => {
    if (!method) return '-';
    
    const methodMap: Record<string, string> = {
      'pix': 'PIX',
      'bank_slip': 'Boleto',
      'bank_transfer': 'Transferência',
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito',
      'cash': 'Dinheiro',
      'check': 'Cheque'
    };
    
    return methodMap[method] || method;
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'vencida': return 'bg-red-100 text-red-800';
      case 'vence_em_breve': return 'bg-yellow-100 text-yellow-800';
      case 'em_dia': return 'bg-green-100 text-green-800';
      case 'sem_data': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status?: string) => {
    switch(status) {
      case 'vencida': return 'Vencida';
      case 'vence_em_breve': return 'Vence em breve';
      case 'em_dia': return 'Em dia';
      case 'sem_data': return 'Sem data';
      default: return '-';
    }
  };

  const getSeriesBadge = (account: AccountReceivable) => {
    if (!account.series_id) return null;

    const occurrenceType = account.occurrence;
    let badgeText = '';
    let badgeColor = '';
    let icon = Link;

    switch (occurrenceType) {
      case 'weekly':
        badgeText = 'Semanal';
        badgeColor = 'bg-blue-100 text-blue-800';
        icon = Repeat;
        break;
      case 'biweekly':
        badgeText = 'Quinzenal';
        badgeColor = 'bg-indigo-100 text-indigo-800';
        icon = Repeat;
        break;
      case 'monthly':
        badgeText = 'Mensal';
        badgeColor = 'bg-green-100 text-green-800';
        icon = Repeat;
        break;
      case 'quarterly':
        badgeText = 'Trimestral';
        badgeColor = 'bg-purple-100 text-purple-800';
        icon = Repeat;
        break;
      case 'semiannual':
        badgeText = 'Semestral';
        badgeColor = 'bg-pink-100 text-pink-800';
        icon = Repeat;
        break;
      case 'annual':
        badgeText = 'Anual';
        badgeColor = 'bg-orange-100 text-orange-800';
        icon = Repeat;
        break;
      case 'installments':
        const installmentText = account.installment_number ? 
          `${account.installment_number}/${account.installment_total || '?'}` : 
          'Parcelado';
        badgeText = installmentText;
        badgeColor = 'bg-teal-100 text-teal-800';
        icon = Link;
        break;
      default:
        badgeText = 'Série';
        badgeColor = 'bg-gray-100 text-gray-800';
        icon = Link;
    }

    const IconComponent = icon;

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
        <IconComponent className="h-3 w-3" />
        {badgeText}
      </div>
    );
  };

  // Filtrar por data
  const getFilteredByDate = (data: AccountReceivable[]) => {
    if (!dateFilter) return data;

    return data.filter(account => {
      if (!account.due_date) return false;
      
      const dueDate = new Date(account.due_date);
      const dueDateStr = account.due_date; // YYYY-MM-DD format
      
      switch (dateFilter.type) {
        case 'month':
          if (dateFilter.month) {
            const [year, month] = dateFilter.month.split('-');
            const accountYear = dueDate.getFullYear().toString();
            const accountMonth = String(dueDate.getMonth() + 1).padStart(2, '0');
            return accountYear === year && accountMonth === month;
          }
          break;
          
        case 'specific':
          if (dateFilter.specificDate) {
            return dueDateStr === dateFilter.specificDate;
          }
          break;
          
        case 'range':
          if (dateFilter.startDate && dateFilter.endDate) {
            return dueDateStr >= dateFilter.startDate && dueDateStr <= dateFilter.endDate;
          }
          break;
      }
      
      return true;
    });
  };

  // Filtrar por status primeiro
  const getFilteredByStatus = (data: AccountReceivable[]) => {
    if (activeTab === 'all') return data;
    
    switch (activeTab) {
      case 'open':
        return data.filter(account => account.status === 'pending');
      case 'received':
        return data.filter(account => account.status === 'paid');
      case 'overdue':
        const today = new Date().toISOString().split('T')[0];
        return data.filter(account => 
          account.status === 'pending' && 
          account.due_date && 
          account.due_date < today
        );
      case 'cancelled':
        return data.filter(account => account.status === 'cancelled');
      default:
        return data;
    }
  };

  // Aplicar filtros na ordem correta: primeiro data, depois status, depois busca
  const dataFilteredByDate = getFilteredByDate(accountsReceivable || []);
  const dataFilteredByStatus = getFilteredByStatus(dataFilteredByDate);
  const dataWithSearch = dataFilteredByStatus.filter(account => {
    if (!account) return false;
    if (!searchValue) return true;
    const search = searchValue.toLowerCase();
    // Usar o campo search_text da view que já contém todos os campos concatenados
    return account.search_text?.includes(search) || 
           account.client_name?.toLowerCase().includes(search) ||
           account.category_name?.toLowerCase().includes(search);
  });

  // Aplicar ordenação específica baseado na tab ativa
  const filteredData = [...dataWithSearch].sort((a, b) => {
    if (activeTab === 'received') {
      // Para tab "Recebidas", ordenar por data de recebimento (mais recentes primeiro)
      if (a.payment_date && b.payment_date) {
        return new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime();
      }
      // Se um não tem data de recebimento, priorizar o que tem
      if (a.payment_date && !b.payment_date) return -1;
      if (!a.payment_date && b.payment_date) return 1;
      // Se ambos não têm data de recebimento, ordenar por data de vencimento
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    
    // Para todas as outras tabs (Todas, Em aberto, Atrasadas, Canceladas), ordenar por data de vencimento
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    // Se não tem data de vencimento, por data de criação (mais recentes primeiro)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Calcular contadores para as tabs
  const getTabCounts = () => {
    const baseData = getFilteredByDate(accountsReceivable || []);
    
    const all = baseData.length;
    const open = baseData.filter(account => account.status === 'pending').length;
    const received = baseData.filter(account => account.status === 'paid').length;
    const today = new Date().toISOString().split('T')[0];
    const overdue = baseData.filter(account => 
      account.status === 'pending' && 
      account.due_date && 
      account.due_date < today
    ).length;
    const cancelled = baseData.filter(account => account.status === 'cancelled').length;

    return { all, open, received, overdue, cancelled };
  };

  const tabCounts = getTabCounts();

  // Definir colunas baseado na tab ativa
  const getColumns = () => {
    const baseColumns = [
      {
        key: 'client_name',
        title: 'Cliente',
        width: '300px',
        render: (value: any, account: AccountReceivable) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium">{account?.client_name || 'N/A'}</span>
              {getSeriesBadge(account)}
            </div>
            {account?.client_document && (
              <span className="text-xs text-gray-500 mt-1">{account.client_document}</span>
            )}
          </div>
        )
      },
      {
        key: 'notes',
        title: 'Observações',
        render: (value: any, account: AccountReceivable) => (
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {account?.notes ? (
              account.notes.length > 50 ? 
                `${account.notes.substring(0, 50)}...` : 
                account.notes
            ) : '-'}
          </span>
        )
      },
      {
        key: 'number_of_document',
        title: 'Documento',
        render: (value: any, account: AccountReceivable) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">{account?.number_of_document || '-'}</span>
        )
      },
      {
        key: 'value',
        title: 'Valor',
        render: (value: any, account: AccountReceivable) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {formatCurrency(account?.value)}
          </span>
        )
      }
    ];

    // Se estiver na tab "received", adicionar colunas de recebimento
    if (activeTab === 'received') {
      baseColumns.push(
        {
          key: 'paid_amount',
          title: 'Valor Recebido',
          render: (value: any, account: AccountReceivable) => (
            <span className="font-medium text-green-600 dark:text-green-400">
              {formatCurrency(account?.paid_amount)}
            </span>
          )
        },
        {
          key: 'payment_date',
          title: 'Data Recebimento',
          render: (value: any, account: AccountReceivable) => (
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {formatDate(account?.payment_date)}
            </span>
          )
        },
        {
          key: 'due_date',
          title: 'Data Vencimento',
          render: (value: any, account: AccountReceivable) => (
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {formatDate(account?.due_date)}
            </span>
          )
        }
      );
    } else {
      // Para outras tabs, mostrar data de vencimento
      baseColumns.push({
        key: 'due_date',
        title: 'Vencimento',
        render: (value: any, account: AccountReceivable) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-slate-100">{account?.due_date_formatted || formatDate(account?.due_date)}</span>
            {account?.dias_vencimento !== null && account?.dias_vencimento !== undefined && (
              <span className={`text-xs mt-1 ${
                account.dias_vencimento < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500'
              }`}>
                {account.dias_vencimento > 0 ? `${account.dias_vencimento} dias` : 
                 account.dias_vencimento === 0 ? 'Hoje' : 
                 `${Math.abs(account.dias_vencimento)} dias atraso`}
              </span>
            )}
          </div>
        )
      });
    }

    // Adicionar colunas restantes
    baseColumns.push(
      {
        key: 'payment_method',
        title: 'Pagamento',
        render: (value: any, account: AccountReceivable) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">{formatPaymentMethod(account?.payment_method)}</span>
        )
      },
      {
        key: 'category_name',
        title: 'Categoria',
        render: (value: any, account: AccountReceivable) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-slate-100">{account?.category_name || '-'}</span>
            {account?.dre_group_name && (
              <span className="text-xs text-gray-500">{account.dre_group_name}</span>
            )}
          </div>
        )
      }
    );

    // Adicionar coluna de status visual apenas na tab "Todas"
    if (activeTab === 'all') {
      baseColumns.push({
        key: 'status_indicator',
        title: '',
        width: '40px',
        render: (value: any, account: AccountReceivable) => (
          <div className="flex justify-center">
            <div 
              className={`w-3 h-3 rounded-full ${
                account?.status === 'paid' 
                  ? 'bg-gray-400' 
                  : 'bg-green-500'
              }`}
              title={account?.status === 'paid' ? 'Recebida' : 'A receber'}
            />
          </div>
        )
      });
    }

    return baseColumns;
  };

  // Definir as tabs
  const tabs: DataTable02Tab[] = [
    {
      key: 'all',
      label: 'Todas',
      icon: FileText,
      count: tabCounts.all
    },
    {
      key: 'open',
      label: 'Em aberto',
      icon: Clock,
      count: tabCounts.open
    },
    {
      key: 'received',
      label: 'Recebidas',
      icon: CheckCircle,
      count: tabCounts.received
    },
    {
      key: 'overdue',
      label: 'Atrasadas',
      icon: AlertTriangle,
      count: tabCounts.overdue
    },
    {
      key: 'cancelled',
      label: 'Canceladas',
      icon: XCircle,
      count: tabCounts.cancelled
    }
  ];


  const actions = [
    {
      key: 'receive',
      icon: DollarSign,
      title: 'Receber (baixar conta)',
      onClick: handleMarkAsReceived,
      show: (account: AccountReceivable) => account.status === 'pending'
    },
    {
      key: 'reverse',
      icon: RotateCcw,
      title: 'Estornar recebimento',
      onClick: handleReverseReceipt,
      show: (account: AccountReceivable) => account.status === 'paid'
    },
    {
      key: 'delete-series',
      icon: Trash,
      title: 'Excluir série',
      onClick: (account: AccountReceivable) => account.series_id && onDeleteSeries?.(account.series_id),
      color: 'text-orange-600 hover:text-orange-900',
      show: (account: AccountReceivable) => !!account.series_id
    },
    {
      key: 'clone',
      icon: Copy,
      title: 'Clonar conta',
      onClick: handleCloneAccount
    },
    {
      key: 'cancel',
      icon: Ban,
      title: 'Cancelar conta',
      onClick: handleCancelAccount,
      show: (account: AccountReceivable) => account.status === 'pending'
    },
    {
      key: 'delete',
      icon: Trash2,
      title: 'Excluir conta',
      onClick: handleDeleteAccount,
      color: 'text-red-600 hover:text-red-900',
      show: (account: AccountReceivable) => account.status === 'pending' || account.status === 'cancelled'
    }
  ];

  const createButton = onCreate ? {
    label: 'Nova Conta',
    icon: Plus,
    onClick: onCreate
  } : undefined;

  return (
    <>
      <DataTable02
      data={filteredData}
      columns={getColumns()}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Buscar por cliente, documento, categoria..."
      dateFilter={{
        value: dateFilter,
        onChange: setDateFilter,
        dateField: 'due_date',
        label: 'Período'
      }}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(key) => setActiveTab(key as AccountReceivableStatusTab)}
      actions={actions}
      createButton={createButton}
      loading={loading}
      emptyMessage="Nenhuma conta a receber encontrada"
      emptyDescription="Comece adicionando a primeira conta a receber."
      onRowClick={(account) => onEdit?.(account)}
    />
    
    {/* Modal de Recebimento */}
    {receiptModalData && (
      <ReceiptModal
        isOpen={!!receiptModalData}
        onClose={() => setReceiptModalData(null)}
        account={receiptModalData}
        onConfirm={handleReceiptConfirm}
      />
    )}
    </>
  );
};