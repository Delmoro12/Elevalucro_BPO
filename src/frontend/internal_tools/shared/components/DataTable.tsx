import React, { ReactNode } from 'react';
import { Building2 } from 'lucide-react';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  width?: string;
  className?: string;
  render?: (value: any, record: T, index: number) => ReactNode;
}

export interface TableAction<T = any> {
  key: string;
  icon: React.ComponentType<any>;
  title: string;
  onClick: (record: T) => void;
  color?: string;
  show?: (record: T) => boolean;
}

interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<any>;
  className?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  onRowClick?: (record: T, index: number) => void;
}

export function DataTable<T = any>({
  data,
  columns,
  actions = [],
  loading = false,
  emptyMessage = "Nenhum registro encontrado",
  emptyIcon: EmptyIcon = Building2,
  className = "",
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  
  const getRowClassName = (record: T, index: number): string => {
    let baseClassName = "hover:bg-slate-50 dark:hover:bg-slate-700/50";
    
    if (onRowClick) {
      baseClassName += " cursor-pointer";
    }
    
    if (typeof rowClassName === 'string') {
      baseClassName += ` ${rowClassName}`;
    } else if (typeof rowClassName === 'function') {
      baseClassName += ` ${rowClassName(record, index)}`;
    }
    
    return baseClassName;
  };

  const getActionColor = (color?: string): string => {
    switch (color) {
      case 'red':
        return 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300';
      case 'emerald':
        return 'text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300';
      case 'blue':
        return 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300';
      default:
        return 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col flex-1 ${className}`}>
        <div className="p-8 text-center flex-1 flex flex-col justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col flex-1 ${className}`}>
        <div className="p-8 text-center flex-1 flex flex-col justify-center">
          <EmptyIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col flex-1 ${className}`}>
      <div className="overflow-auto flex-1">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ${column.className || ''}`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.title}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {data.map((record, index) => (
              <tr 
                key={index} 
                className={getRowClassName(record, index)}
                onClick={() => onRowClick?.(record, index)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render 
                      ? column.render((record as any)[column.key], record, index)
                      : (record as any)[column.key]
                    }
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-2">
                      {actions.map((action) => {
                        if (action.show && !action.show(record)) {
                          return null;
                        }
                        
                        const ActionIcon = action.icon;
                        return (
                          <button
                            key={action.key}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(record);
                            }}
                            className={getActionColor(action.color)}
                            title={action.title}
                          >
                            <ActionIcon className="h-4 w-4" />
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}