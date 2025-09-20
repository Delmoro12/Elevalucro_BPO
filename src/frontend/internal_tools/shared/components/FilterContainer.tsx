import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

export interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'input';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  value?: string;
}

interface FilterContainerProps {
  searchValue: string;
  searchPlaceholder?: string;
  filters: Record<string, any>;
  filterFields: FilterField[];
  onSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  className?: string;
}

export const FilterContainer: React.FC<FilterContainerProps> = ({
  searchValue,
  searchPlaceholder = "Buscar...",
  filters,
  filterFields,
  onSearchChange,
  onFilterChange,
  onClearFilters,
  onRefresh,
  className = "",
}) => {
  return (
    <div className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Busca */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtros dinâmicos */}
        {filterFields.map((field) => (
          <div key={field.key} className="flex items-center gap-2">
            {field.type === 'select' ? (
              <>
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={filters[field.key] || ''}
                  onChange={(e) => onFilterChange(field.key, e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <input
                type="text"
                placeholder={field.placeholder || field.label}
                value={filters[field.key] || ''}
                onChange={(e) => onFilterChange(field.key, e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            )}
          </div>
        ))}

        {/* Botões de ação */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClearFilters}
            className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Limpar
          </button>
          
          <button
            onClick={onRefresh}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            title="Atualizar lista"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};