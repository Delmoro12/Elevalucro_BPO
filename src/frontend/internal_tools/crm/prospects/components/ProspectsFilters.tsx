import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { ProspectFilters } from '../types/prospects';

interface ProspectsFiltersProps {
  filters: ProspectFilters;
  onFiltersChange: (filters: ProspectFilters) => void;
  onRefresh: () => void;
}

export const ProspectsFilters: React.FC<ProspectsFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
}) => {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handlePlanChange = (plan: string) => {
    onFiltersChange({
      ...filters,
      plan: plan as 'controle' | 'gerencial' | 'avancado' | undefined,
    });
  };

  const handleSourceChange = (source: string) => {
    onFiltersChange({ ...filters, source: source || undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Busca */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nome, empresa ou email..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtro por Plano */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filters.plan || ''}
            onChange={(e) => handlePlanChange(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todos os planos</option>
            <option value="controle">Controle</option>
            <option value="gerencial">Gerencial</option>
            <option value="avancado">Avançado</option>
          </select>
        </div>

        {/* Filtro por Origem */}
        <div className="flex items-center gap-2">
          <select
            value={filters.source || ''}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todas as origens</option>
            <option value="site">Site</option>
            <option value="indicacao">Indicação</option>
            <option value="redes_sociais">Redes Sociais</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearFilters}
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