'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, Building2, Filter, RefreshCw } from 'lucide-react';
import { RoutineFilters } from '../types/routines';
import { fetchCompanies } from '../services/routines.api';

interface RoutinesFiltersProps {
  filters: RoutineFilters;
  onFiltersChange: (filters: RoutineFilters) => void;
  onRefresh: () => void;
}

export const RoutinesFilters: React.FC<RoutinesFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh
}) => {
  const [companies, setCompanies] = useState<Array<{id: string, name: string}>>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const data = await fetchCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleFilterChange = (key: keyof RoutineFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    
    // Se mudar o tipo de filtro de data, limpar as datas customizadas
    if (key === 'date_filter' && value !== 'custom') {
      delete newFilters.start_date;
      delete newFilters.end_date;
    }
    
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof RoutineFilters] !== undefined && 
    filters[key as keyof RoutineFilters] !== ''
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex flex-wrap gap-4">
        {/* Busca */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar rotina ou empresa..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Filtro de Empresa */}
        <div className="min-w-[200px]">
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={filters.company_id || ''}
              onChange={(e) => handleFilterChange('company_id', e.target.value)}
              disabled={loadingCompanies}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="">Todas as empresas</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtro de Período */}
        <div className="min-w-[150px]">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={filters.date_filter || ''}
              onChange={(e) => handleFilterChange('date_filter', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="">Todos os períodos</option>
              <option value="today">Hoje</option>
              <option value="this_week">Esta semana</option>
              <option value="this_month">Este mês</option>
              <option value="custom">Período específico</option>
            </select>
          </div>
        </div>

        {/* Datas customizadas */}
        {filters.date_filter === 'custom' && (
          <>
            <div className="min-w-[140px]">
              <input
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="min-w-[140px]">
              <input
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </>
        )}

        {/* Filtro de Status */}
        <div className="min-w-[150px]">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="">Todos os status</option>
              <option value="overdue">Atrasadas</option>
              <option value="due_soon">Próximas</option>
              <option value="upcoming">Agendadas</option>
              <option value="scheduled">Programadas</option>
              <option value="not_scheduled">Não agendadas</option>
            </select>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              Limpar
            </button>
          )}
          
          <button
            onClick={onRefresh}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
};