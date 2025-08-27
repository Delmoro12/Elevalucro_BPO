'use client';

import React, { ReactNode, useState } from 'react';
import { 
  Search,
  Plus,
  Eye,
  Download,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface Column<T = any> {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => ReactNode;
}

export interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

export interface ActionButton {
  key: string;
  icon: React.ElementType;
  label: string;
  onClick: (item: any) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  showWhen?: (item: any) => boolean;
}

export interface BulkAction {
  key: string;
  label: string;
  icon?: React.ElementType;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: (selectedItems: any[]) => void;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  
  // Selection
  selectable?: boolean;
  selectedItems?: Set<string>;
  onSelectionChange?: (selectedItems: Set<string>) => void;
  getItemId?: (item: T) => string;
  
  // Search
  searchable?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  searchPlaceholder?: string;
  
  // Filters
  filters?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  
  // Actions
  actions?: ActionButton[];
  bulkActions?: BulkAction[];
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  
  // Pagination
  paginated?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  
  // Loading and Empty States
  loading?: boolean;
  emptyStateIcon?: React.ElementType;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  
  // Customization
  className?: string;
  rowClassName?: (item: T, index: number) => string;
}

export const DataTable = <T extends any>({
  data,
  columns,
  selectable = false,
  selectedItems = new Set(),
  onSelectionChange,
  getItemId = (item) => (item as any).id,
  searchable = false,
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters = [],
  activeFilter = '',
  onFilterChange,
  actions = [],
  bulkActions = [],
  primaryAction,
  paginated = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  loading = false,
  emptyStateIcon: EmptyIcon,
  emptyStateTitle = 'Nenhum item encontrado',
  emptyStateDescription = 'Não há dados para exibir',
  className = '',
  rowClassName
}: DataTableProps<T>) => {
  
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectedItems.size === data.length && data.length > 0) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map(item => getItemId(item))));
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (!onSelectionChange) return;
    
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    onSelectionChange(newSelected);
  };

  const getActionButtonClass = (variant: string = 'secondary') => {
    switch (variant) {
      case 'primary':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300';
    }
  };

  const FilterButtons: React.FC = () => {
    if (filters.length === 0) return null;

    return (
      <div className="flex items-center space-x-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange?.(filter.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === filter.key
                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {filter.label}
            {filter.count !== undefined && (
              <span className="ml-2 text-xs opacity-75">({filter.count})</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  const Pagination: React.FC = () => {
    if (!paginated || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {totalItems ? (
            `Mostrando ${(currentPage - 1) * (totalItems / totalPages) + 1} - ${Math.min(currentPage * (totalItems / totalPages), totalItems)} de ${totalItems} itens`
          ) : (
            `Página ${currentPage} de ${totalPages}`
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, currentPage - 2) + i;
            if (pageNum > totalPages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange?.(pageNum)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  currentPage === pageNum
                    ? 'bg-emerald-600 text-white'
                    : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header with filters and search */}
      {(searchable || filters.length > 0 || primaryAction) && (
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <FilterButtons />
            
            <div className="flex items-center gap-3">
              {searchable && (
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                  />
                </div>
              )}
              
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  className="flex items-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {primaryAction.label}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              {selectable && (
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-left py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.label}
                </th>
              ))}
              
              {actions.length > 0 && (
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} className="py-12 text-center">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-slate-400 animate-spin mr-2" />
                    <span className="text-slate-500 dark:text-slate-400">Carregando...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} className="py-12 text-center">
                  {EmptyIcon && <EmptyIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />}
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{emptyStateTitle}</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">{emptyStateDescription}</p>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const itemId = getItemId(item);
                const isSelected = selectedItems.has(itemId);
                
                return (
                  <tr
                    key={itemId}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                      rowClassName ? rowClassName(item, index) : ''
                    } ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                  >
                    {selectable && (
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(itemId)}
                          className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                    )}
                    
                    {columns.map((column) => (
                      <td key={column.key} className="py-4 px-4">
                        {column.render 
                          ? column.render((item as any)[column.key], item, index)
                          : (item as any)[column.key]
                        }
                      </td>
                    ))}
                    
                    {actions.length > 0 && (
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {actions.map((action) => {
                            if (action.showWhen && !action.showWhen(item)) return null;
                            
                            const Icon = action.icon;
                            
                            return (
                              <button
                                key={action.key}
                                onClick={() => action.onClick(item)}
                                className={`p-1 rounded transition-colors ${getActionButtonClass(action.variant)}`}
                                title={action.label}
                              >
                                <Icon className="h-4 w-4" />
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk actions */}
      {selectable && selectedItems.size > 0 && bulkActions.length > 0 && (
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {selectedItems.size} item(s) selecionado(s)
          </span>
          <div className="flex items-center space-x-2">
            {bulkActions.map((action) => {
              const Icon = action.icon;
              
              return (
                <button
                  key={action.key}
                  onClick={() => action.onClick(Array.from(selectedItems).map(id => data.find(item => getItemId(item) === id)).filter(Boolean))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${getActionButtonClass(action.variant)} ${
                    action.variant === 'primary' || action.variant === 'danger' ? '' : 'border border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4 mr-1" />}
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination />
    </div>
  );
};