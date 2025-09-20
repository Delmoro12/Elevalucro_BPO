'use client';

import React, { useState, useEffect } from 'react';
import { CalendarCheck, User, Clock, FileText, AlertTriangle } from 'lucide-react';
import { DataTable03 } from '../../shared/components/DataTable03';
import type { 
  DataTable03Column, 
  DataTable03DateFilter 
} from '../../shared/components/DataTable03';
import { useRoutinesHistory } from '../hooks/useRoutinesHistory';
import type { RoutineExecution, RoutinesHistoryFilters } from '../types/routines';

interface RoutinesHistoryTableProps {
  companyId: string;
}

export const RoutinesHistoryTable: React.FC<RoutinesHistoryTableProps> = ({ companyId }) => {
  const [searchValue, setSearchValue] = useState('');
  const [dateFilter, setDateFilter] = useState<DataTable03DateFilter | null>(null);
  const [filters, setFilters] = useState<RoutinesHistoryFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  
  const { 
    routines, 
    loading, 
    error, 
    total, 
    totalPages,
    fetchRoutines 
  } = useRoutinesHistory();

  // Buscar dados quando filtros mudarem
  useEffect(() => {
    const newFilters: RoutinesHistoryFilters = {
      search: searchValue || undefined,
      start_date: dateFilter?.type === 'month' && dateFilter.month 
        ? `${dateFilter.month}-01` 
        : undefined,
      end_date: dateFilter?.type === 'month' && dateFilter.month 
        ? `${dateFilter.month}-31` 
        : undefined,
    };

    setFilters(newFilters);
    fetchRoutines(companyId, newFilters, currentPage);
  }, [searchValue, dateFilter, currentPage, fetchRoutines]);

  // Definir colunas da tabela
  const columns: DataTable03Column<RoutineExecution>[] = [
    {
      key: 'routine_name',
      title: 'Nome da Rotina',
      width: '200px',
      render: (value, record) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{value}</p>
          {record.routine_description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={record.routine_description}>
              {record.routine_description.length > 50 
                ? `${record.routine_description.substring(0, 50)}...` 
                : record.routine_description}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'routine_instructions',
      title: 'Instruções',
      width: '250px',
      render: (value) => (
        <div className="text-sm text-slate-700 dark:text-slate-300">
          {value ? (
            <span title={value}>
              {value.length > 80 ? `${value.substring(0, 80)}...` : value}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">-</span>
          )}
        </div>
      )
    },
    {
      key: 'executed_by_name',
      title: 'Executado por',
      width: '150px',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {value || 'Sistema'}
          </span>
        </div>
      )
    },
    {
      key: 'executed_at',
      title: 'Data Programada',
      width: '140px',
      render: (value, record) => (
        <div>
          <p className="text-sm text-slate-900 dark:text-white">
            {record.executed_at_formatted || new Date(value).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(value).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      )
    },
    {
      key: 'created_at',
      title: 'Executado em',
      width: '140px',
      render: (value, record) => (
        <div>
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            {record.created_at_formatted || new Date(value).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            {new Date(value).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      )
    },
    {
      key: 'execution_id',
      title: 'ID da Execução',
      width: '120px',
      render: (value) => (
        <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {value.substring(0, 8)}...
        </div>
      )
    }
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
      <DataTable03<RoutineExecution>
        data={routines}
        columns={columns}
        loading={loading}
        
        // Busca
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Buscar por nome da rotina..."
        
        // Filtro de data
        dateFilter={{
          value: dateFilter,
          onChange: setDateFilter,
          dateField: 'executed_at',
          label: 'Período de Execução'
        }}
        
        // Paginação
        pagination={{
          pageSize: 25,
          showTotal: true,
          showSizeChanger: false
        }}
        
        // Estados vazios
        emptyMessage="Nenhuma rotina foi executada ainda"
        emptyDescription="Quando rotinas forem executadas para sua empresa, elas aparecerão aqui."
        emptyIcon={CalendarCheck}
        
        // Estilos
        className="shadow-sm"
      />
    </div>
  );
};