'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, FileText, DollarSign, Calendar } from 'lucide-react';
import { DataTable03 } from '../../../../../elevalucro_bpo_app/shared/components/DataTable03';
import type { 
  DataTable03Column, 
  DataTable03Tab, 
  DataTable03DateFilter,
} from '../../../../../elevalucro_bpo_app/shared/components/DataTable03';
// Hook removido - dados vêm via props agora
import type { ReconciliationRecord, ReconciliationStatusTab } from '../../types/recordConciliation';

interface TabCounts {
  pending_validation: number;
  validated: number;
  receivable: number;
  payable: number;
}

interface RecordConciliationTableProps {
  records: ReconciliationRecord[];
  loading: boolean;
  error: string | null;
  onValidate?: (record: ReconciliationRecord) => void;
  onReject?: (record: ReconciliationRecord) => void;
  onView?: (record: ReconciliationRecord) => void;
  onRefresh?: () => void;
}

export const RecordConciliationTable: React.FC<RecordConciliationTableProps> = ({
  records,
  loading,
  error,
  onValidate,
  onReject,
  onView,
  onRefresh
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<ReconciliationStatusTab>('pending_validation');
  const [dateFilter, setDateFilter] = useState<DataTable03DateFilter | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');
  
  // Dados vêm via props agora

  // Calcular contadores para as tabs usando apenas registros client_side
  const clientSideRecords = records.filter(record => record.created_by_side === 'client_side');
  
  const tabCounts: TabCounts = {
    pending_validation: clientSideRecords.filter(r => !Boolean(r.validated)).length,
    validated: clientSideRecords.filter(r => Boolean(r.validated)).length,
    receivable: clientSideRecords.filter(r => r.type === 'receivable').length,
    payable: clientSideRecords.filter(r => r.type === 'payable').length
  };

  // Configurar tabs
  const tabs: DataTable03Tab[] = [
    {
      key: 'pending_validation',
      label: 'Aguardando Validação',
      count: tabCounts.pending_validation,
      icon: Calendar
    },
    {
      key: 'validated',
      label: 'Validados',
      count: tabCounts.validated,
      icon: CheckCircle
    }
  ];

  // Filtrar dados baseado nas seleções
  const filteredData = records.filter(record => {
    // Apenas registros criados pelo cliente
    if (record.created_by_side !== 'client_side') return false;
    
    // Filtro por tab - forçar conversão para boolean
    const isValidated = Boolean(record.validated);
    
    if (activeTab === 'pending_validation' && isValidated) {
      return false;
    } else if (activeTab === 'validated' && !isValidated) {
      return false;
    }
    
    // Filtro de busca
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      const searchableText = [
        record.number_of_document,
        record.third_party_name,
        record.client_name,
        record.supplier_name,
        record.notes
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableText.includes(searchLower)) return false;
    }
    
    // Filtro por tipo
    if (typeFilter && record.type !== typeFilter) return false;
    
    // Filtro de data
    if (dateFilter && record.due_date) {
      const dueDate = new Date(record.due_date);
      
      if (dateFilter.type === 'month' && dateFilter.month) {
        const [year, month] = dateFilter.month.split('-');
        const filterMonth = new Date(parseInt(year), parseInt(month) - 1);
        if (dueDate.getMonth() !== filterMonth.getMonth() || dueDate.getFullYear() !== filterMonth.getFullYear()) {
          return false;
        }
      } else if (dateFilter.type === 'range' && dateFilter.startDate && dateFilter.endDate) {
        const start = new Date(dateFilter.startDate);
        const end = new Date(dateFilter.endDate);
        if (dueDate < start || dueDate > end) {
          return false;
        }
      }
    }
    
    return true;
  });

  // Configurar colunas
  const columns: DataTable03Column<ReconciliationRecord>[] = [
    {
      key: 'type',
      title: 'Tipo',
      width: '80px',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'receivable' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
        }`}>
          {value === 'receivable' ? 'CR' : 'CP'}
        </span>
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
        <span className="text-slate-900 dark:text-white">
          {record.client_name || record.supplier_name || record.third_party_name || '-'}
        </span>
      )
    },
    {
      key: 'notes',
      title: 'Observações',
      width: '200px',
      render: (value) => {
        if (!value) return '-';
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
      render: (value) => {
        if (!value) return '-';
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      }
    },
    {
      key: 'due_date',
      title: 'Vencimento',
      width: '120px',
      render: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('pt-BR');
      }
    },
    {
      key: 'occurrence',
      title: 'Recorrência',
      width: '120px',
      render: (value) => {
        const labels: Record<string, string> = {
          'unique': 'Única',
          'weekly': 'Semanal',
          'biweekly': 'Quinzenal',
          'monthly': 'Mensal',
          'quarterly': 'Trimestral',
          'semiannual': 'Semestral',
          'annual': 'Anual',
          'installments': 'Parcelada'
        };
        return labels[value] || value || 'Única';
      }
    },
    {
      key: 'status',
      title: 'Status',
      width: '100px',
      render: (value) => {
        const isPaid = value === 'paid';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isPaid 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
          }`}>
            {isPaid ? 'Paga' : 'Pendente'}
          </span>
        );
      }
    },
    {
      key: 'validated',
      title: 'Validação',
      width: '100px',
      render: (value, record) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
        }`}>
          {value ? 'Validado' : 'Aguardando'}
        </span>
      )
    }
  ];

  // Adicionar colunas de validação para registros validados
  if (activeTab === 'validated') {
    columns.push(
      {
        key: 'validated_at',
        title: 'Validado em',
        width: '140px',
        render: (value) => {
          if (!value) return '-';
          return new Date(value).toLocaleString('pt-BR');
        }
      },
      {
        key: 'validated_by',
        title: 'Validado por',
        width: '120px',
        render: (value) => value || '-'
      }
    );
  }

  // Opções de filtro por tipo
  const typeFilterOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'receivable', label: 'Contas a Receber' },
    { value: 'payable', label: 'Contas a Pagar' }
  ];

  // Handler para clique na linha
  const handleRowClick = (record: ReconciliationRecord) => {
    if (onView) {
      onView(record);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Erro ao carregar registros
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable03<ReconciliationRecord>
        data={filteredData}
        columns={columns}
        loading={loading}
        
        // Busca
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Buscar por documento, cliente, observações..."
        
        // Filtro de data
        dateFilter={{
          value: dateFilter,
          onChange: setDateFilter,
          dateField: 'due_date',
          label: 'Vencimento'
        }}

        
        // Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as ReconciliationStatusTab)}
        
        // Refresh
        onRefresh={onRefresh}
        
        // Paginação
        pagination={{
          pageSize: 30,
          showTotal: true,
          showSizeChanger: true,
          pageSizeOptions: [10, 30, 50, 100]
        }}
        
        // Estados vazios
        emptyMessage="Nenhum registro encontrado"
        emptyDescription="Os registros para conciliação aparecerão aqui quando disponíveis."
        emptyIcon={FileText}
        
        // Clique na linha
        onRowClick={onView ? handleRowClick : undefined}
        
        
        // Classes
        className="h-full"
        tableClassName="min-h-96"
        headerClassName="flex-shrink-0"
      />
    </div>
  );
};