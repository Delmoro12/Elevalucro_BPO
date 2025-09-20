'use client';

import React, { ReactNode } from 'react';
import { Search, RotateCcw, Plus } from 'lucide-react';

interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'input';
  options?: { value: string; label: string; }[];
  placeholder?: string;
}

interface ViewButton {
  key: string;
  label: string;
  icon?: React.ComponentType<any>;
  active?: boolean;
  onClick: () => void;
}

interface ActionButton {
  label: string;
  icon?: React.ComponentType<any>;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface TableWithFiltersProps {
  // Search
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  
  // Filters
  filters?: Record<string, any>;
  filterFields?: FilterField[];
  onFilterChange?: (key: string, value: string) => void;
  
  // Actions
  onRefresh?: () => void;
  viewButtons?: ViewButton[];
  actionButtons?: ActionButton[];
  
  // Content
  children: ReactNode;
  
  // Style
  className?: string;
}

export const TableWithFilters: React.FC<TableWithFiltersProps> = ({
  searchValue = '',
  searchPlaceholder = 'Buscar...',
  onSearchChange,
  filters = {},
  filterFields = [],
  onFilterChange,
  onRefresh,
  viewButtons = [],
  actionButtons = [],
  children,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Filters Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Search and Filters */}
          <div className="flex items-center gap-3 flex-1">
            {/* Search */}
            {onSearchChange && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-10 pr-4 py-2 w-64 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            )}
            
            {/* Filter Fields */}
            {filterFields.map((field) => (
              <div key={field.key}>
                {field.type === 'select' && field.options ? (
                  <select
                    value={filters[field.key] || ''}
                    onChange={(e) => onFilterChange?.(field.key, e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">{field.label}</option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={filters[field.key] || ''}
                    onChange={(e) => onFilterChange?.(field.key, e.target.value)}
                    placeholder={field.placeholder || field.label}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                )}
              </div>
            ))}
            
            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Atualizar"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right side - View buttons and Actions */}
          <div className="flex items-center gap-3">
            {/* View Buttons */}
            {viewButtons.length > 0 && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                {viewButtons.map((button) => {
                  const IconComponent = button.icon;
                  return (
                    <button
                      key={button.key}
                      onClick={button.onClick}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        button.active
                          ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      {button.label}
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Action Buttons */}
            {actionButtons.map((button, index) => {
              const IconComponent = button.icon;
              const isPrimary = button.variant !== 'secondary';
              
              return (
                <button
                  key={index}
                  onClick={button.onClick}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isPrimary
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  {button.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {children}
      </div>
    </div>
  );
};