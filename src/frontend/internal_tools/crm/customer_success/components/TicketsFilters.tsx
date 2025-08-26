'use client';

import React from 'react';
import { Search, RefreshCw, Filter } from 'lucide-react';
import { TicketFilters, TicketStatus, TicketPriority } from '../types/customer-success';

interface TicketsFiltersProps {
  filters: TicketFilters;
  onFiltersChange: (filters: Partial<TicketFilters>) => void;
  onRefresh: () => void;
}

export const TicketsFilters: React.FC<TicketsFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value || undefined });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ 
      status: value === 'all' ? undefined : value as TicketStatus 
    });
  };

  const handlePriorityChange = (value: string) => {
    onFiltersChange({ 
      prioridade: value === 'all' ? undefined : value as TicketPriority 
    });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ 
      categoria: value === 'all' ? undefined : value
    });
  };

  const handleAssigneeChange = (value: string) => {
    onFiltersChange({ 
      assignee: value === 'all' ? undefined : value
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
              placeholder="Buscar tickets..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={filters.status || 'all'}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="all">Todos os status</option>
              <option value="open">Aberto</option>
              <option value="in_progress">Em Progresso</option>
              <option value="waiting_client">Aguardando Cliente</option>
              <option value="resolved">Resolvido</option>
              <option value="closed">Fechado</option>
            </select>
          </div>

          {/* Prioridade */}
          <select
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            value={filters.prioridade || 'all'}
            onChange={(e) => handlePriorityChange(e.target.value)}
          >
            <option value="all">Todas as prioridades</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>

          {/* Categoria */}
          <select
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            value={filters.categoria || 'all'}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="all">Todas as categorias</option>
            <option value="tecnico">Técnico</option>
            <option value="financeiro">Financeiro</option>
            <option value="treinamento">Treinamento</option>
            <option value="funcionalidade">Funcionalidade</option>
            <option value="outro">Outro</option>
          </select>

          {/* Responsável */}
          <select
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            value={filters.assignee || 'all'}
            onChange={(e) => handleAssigneeChange(e.target.value)}
          >
            <option value="all">Todos os responsáveis</option>
            <option value="Suporte Técnico">Suporte Técnico</option>
            <option value="Customer Success">Customer Success</option>
            <option value="Financeiro">Financeiro</option>
            <option value="Treinamento">Treinamento</option>
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