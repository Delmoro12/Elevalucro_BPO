'use client';

import React from 'react';
import { Search, RefreshCw, Filter } from 'lucide-react';
import { CustomerSuccessFilters, HealthStatus } from '../types/customer-success';

interface ClientsFiltersProps {
  filters: CustomerSuccessFilters;
  onFiltersChange: (filters: Partial<CustomerSuccessFilters>) => void;
  onRefresh: () => void;
}

export const ClientsFilters: React.FC<ClientsFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value || undefined });
  };

  const handleHealthStatusChange = (value: string) => {
    onFiltersChange({ 
      health_status: value === 'all' ? undefined : value as HealthStatus 
    });
  };

  const handlePlanoChange = (value: string) => {
    onFiltersChange({ 
      plano: value === 'all' ? undefined : value as 'controle' | 'gerencial' | 'avancado'
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ 
      status: value === 'all' ? undefined : value as 'ativo' | 'suspenso' | 'cancelado'
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Busca */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Status de Saúde */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={filters.health_status || 'all'}
              onChange={(e) => handleHealthStatusChange(e.target.value)}
            >
              <option value="all">Todas as saúdes</option>
              <option value="healthy">Saudáveis</option>
              <option value="at_risk">Em Risco</option>
              <option value="critical">Críticos</option>
            </select>
          </div>

          {/* Plano */}
          <select
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            value={filters.plano || 'all'}
            onChange={(e) => handlePlanoChange(e.target.value)}
          >
            <option value="all">Todos os planos</option>
            <option value="controle">Controle</option>
            <option value="gerencial">Gerencial</option>
            <option value="avancado">Avançado</option>
          </select>

          {/* Status */}
          <select
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            value={filters.status || 'all'}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="suspenso">Suspenso</option>
            <option value="cancelado">Cancelado</option>
          </select>

          {/* Botão de Refresh */}
          <button
            onClick={onRefresh}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Atualizar lista"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};