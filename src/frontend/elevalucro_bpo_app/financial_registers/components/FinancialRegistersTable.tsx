'use client';

import React, { useState } from 'react';
import { Plus, FileText, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, XCircle, Filter } from 'lucide-react';
import { DataTable03 } from '../../shared/components/DataTable03';
import type { 
  DataTable03Column, 
  DataTable03Tab, 
  DataTable03DateFilter,
  DataTable03SelectFilter
} from '../../shared/components/DataTable03';
import { useFinancialRegisters } from '../hooks/useFinancialRegisters';
import type { FinancialRegister, FinancialRegisterStatusTab } from '../types/financialRegisters';

interface TabCounts {
  all: number;
  draft: number;
  pending_validation: number;
  validated: number;
  rejected: number;
  receivable: number;
  payable: number;
}

interface FinancialRegistersTableProps {
  companyId: string;
  onEdit?: (register: FinancialRegister) => void;
  onDelete?: (register: FinancialRegister) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
}

export const FinancialRegistersTable: React.FC<FinancialRegistersTableProps> = ({
  companyId,
  onEdit,
  onDelete,
  onCreate,
  onRefresh
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<FinancialRegisterStatusTab>('not_validated');
  const [dateFilter, setDateFilter] = useState<DataTable03DateFilter | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');
  
  const { financialRegisters, loading, error, refetch } = useFinancialRegisters(companyId);

  // Calcular contadores para as tabs (apenas registros client_side)
  const getTabCounts = (): TabCounts => {
    return financialRegisters
      .filter(register => register.created_by_side === 'client_side') // Apenas client_side
      .reduce((acc: TabCounts, register: FinancialRegister) => {
        acc.all++;
        
        // Por status de validação
        if (!register.validated) acc.draft++; // Não validados = draft
        else acc.validated++; // Validados
        
        // Por tipo
        if (register.type === 'receivable') acc.receivable++;
        else if (register.type === 'payable') acc.payable++;
        
        return acc;
      }, { all: 0, draft: 0, pending_validation: 0, validated: 0, rejected: 0, receivable: 0, payable: 0 });
  };

  const tabCounts = getTabCounts();

  // Filtrar dados baseado nas seleções
  const filteredData = financialRegisters.filter(register => {
    // Filtro por tab - apenas registros client_side
    if (activeTab === 'not_validated') {
      // Aguardando Validação: client_side + validated = false
      if (register.validated || register.created_by_side !== 'client_side') {
        return false;
      }
    } else if (activeTab === 'validated') {
      // Validados: client_side + validated = true
      if (!register.validated || register.created_by_side !== 'client_side') {
        return false;
      }
    }

    // Filtro por tipo (receber/pagar)
    if (typeFilter && register.type !== typeFilter) {
      return false;
    }

    // Filtro de busca
    if (searchValue) {
      const search = searchValue.toLowerCase();
      const searchText = `${register.number_of_document || ''} ${register.notes || ''} ${register.supplier_name || ''} ${register.client_name || ''}`.toLowerCase();
      if (!searchText.includes(search)) return false;
    }

    // Filtro de data
    if (dateFilter && register.due_date) {
      const dueDate = new Date(register.due_date);
      
      if (dateFilter.type === 'month' && dateFilter.month) {
        const [year, month] = dateFilter.month.split('-');
        const filterMonth = new Date(parseInt(year), parseInt(month) - 1);
        if (dueDate.getMonth() !== filterMonth.getMonth() || dueDate.getFullYear() !== filterMonth.getFullYear()) {
          return false;
        }
      } else if (dateFilter.type === 'specific' && dateFilter.specificDate) {
        const dueDateStr = register.due_date;
        if (dueDateStr !== dateFilter.specificDate) {
          return false;
        }
      } else if (dateFilter.type === 'range' && dateFilter.startDate && dateFilter.endDate) {
        const dueDateStr = register.due_date;
        if (dueDateStr < dateFilter.startDate || dueDateStr > dateFilter.endDate) {
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
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  // Função para renderizar o badge de status de validação
  const renderValidationBadge = (validated: boolean) => {
    if (validated) {
      return (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs font-medium">
          ✅ Validado
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">
          ⏳ Aguardando Validação
        </span>
      );
    }
  };

  // Definir colunas da tabela
  const columns: DataTable03Column<FinancialRegister>[] = [
    {
      key: 'type',
      title: 'Tipo',
      width: '100px',
      render: (value, record) => {
        if (record.type === 'receivable') {
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
      key: 'validated',
      title: 'Validação',
      width: '150px',
      render: (value, record) => renderValidationBadge(record.validated)
    },
    {
      key: 'due_date',
      title: 'Vencimento',
      width: '120px',
      render: (value, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 dark:text-white">
            {record.due_date_formatted || formatDate(value)}
          </span>
          {record.dias_vencimento !== null && record.dias_vencimento !== undefined && (
            <span className={`text-xs mt-1 ${
              record.dias_vencimento < 0 ? 'text-red-600 dark:text-red-400' : 
              record.dias_vencimento === 0 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-slate-500 dark:text-slate-400'
            }`}>
              {record.dias_vencimento > 0 ? `${record.dias_vencimento} dias restantes` : 
               record.dias_vencimento === 0 ? 'Vence hoje' : 
               `${Math.abs(record.dias_vencimento)} dias em atraso`}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'number_of_document',
      title: 'Documento',
      width: '150px',
      render: (value) => value || '-'
    },
    {
      key: 'third_party_name',
      title: 'Cliente/Fornecedor',
      width: '200px',
      render: (value, record) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {record.third_party_name || record.supplier_name || record.client_name || '-'}
        </span>
      )
    },
    {
      key: 'notes',
      title: 'Observações',
      width: '200px',
      render: (value) => {
        if (!value) return '-';
        // Truncar texto longo
        const maxLength = 50;
        if (value.length > maxLength) {
          return value.substring(0, maxLength) + '...';
        }
        return value;
      }
    },
    {
      key: 'value',
      title: 'Valor',
      width: '120px',
      className: 'text-right',
      render: (value, record) => (
        <div className="text-right">
          <p className={`font-semibold ${
            record.type === 'receivable' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(value)}
          </p>
        </div>
      )
    },
    {
      key: 'notes',
      title: 'Observações',
      width: '200px',
      render: (value) => (
        <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
          {value || '-'}
        </span>
      )
    }
  ];

  // Definir tabs (foco apenas em "Aguardando Validação")
  const tabs: DataTable03Tab[] = [
    { key: 'not_validated', label: 'Aguardando Validação', icon: Clock, count: tabCounts.draft },
    { key: 'validated', label: 'Validados', icon: CheckCircle, count: tabCounts.validated }
  ];

  // Filtro por tipo
  const typeFilterOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'receivable', label: 'Contas a Receber' },
    { value: 'payable', label: 'Contas a Pagar' }
  ];

  // Funções de ação
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      refetch();
    }
  };

  // Função para lidar com clique na linha
  const handleRowClick = (register: FinancialRegister) => {
    // Permite clique em ambas as tabs
    // A página decidirá se abre em modo edit ou view baseado no status de validação
    if (onEdit) {
      onEdit(register);
    }
  };

  // Função para determinar se a linha é clicável
  const isRowClickable = (register: FinancialRegister) => {
    return !!onEdit; // Sempre clicável se há callback onEdit
  };

  return (
    <div className="space-y-6">

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
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
      <DataTable03<FinancialRegister>
        data={filteredData}
        columns={columns}
        loading={loading}
        
        // Busca
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Buscar por documento, fornecedor, observações..."
        
        // Filtro de data
        dateFilter={{
          value: dateFilter,
          onChange: setDateFilter,
          dateField: 'due_date',
          label: 'Vencimento'
        }}

        // Filtro por tipo
        selectFilters={[
          {
            value: typeFilter,
            onChange: setTypeFilter,
            options: typeFilterOptions,
            placeholder: 'Filtrar por tipo',
            label: 'Tipo'
          }
        ]}
        
        // Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as FinancialRegisterStatusTab)}
        
        // Paginação
        pagination={{
          pageSize: 30,
          showTotal: true,
          showSizeChanger: true,
          pageSizeOptions: [10, 30, 50, 100]
        }}
        
        // Estados vazios
        emptyMessage="Nenhum registro encontrado"
        emptyDescription="Os registros financeiros aparecerão aqui quando disponíveis."
        emptyIcon={FileText}
        
        // Botão de criação
        createButton={onCreate ? {
          label: 'Novo Registro',
          icon: Plus,
          onClick: onCreate
        } : undefined}
        
        // Clique na linha (ativo em ambas as tabs mas com comportamento diferente)
        onRowClick={onEdit ? handleRowClick : undefined}
        
        // Ações
        rowActions={[
          ...(onEdit ? [{
            label: 'Editar',
            onClick: onEdit
          }] : []),
          ...(onDelete ? [{
            label: 'Excluir',
            onClick: onDelete,
            variant: 'danger' as const
          }] : [])
        ]}
        
        // Refresh
        onRefresh={handleRefresh}
        
        // Estilos
        className="shadow-sm"
      />
    </div>
  );
};