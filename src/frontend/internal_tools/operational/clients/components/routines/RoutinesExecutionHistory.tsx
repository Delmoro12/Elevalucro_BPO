'use client';

import React, { useState, useEffect } from 'react';
import { Clock, User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';

interface RoutineExecution {
  execution_id: string;
  executed_at: string;
  created_at: string;
  company_id: string;
  routine_name: string;
  routine_description: string;
  routine_instructions: string;
  executed_by_name: string | null;
}

interface RoutinesExecutionHistoryProps {
  clientId: string;
}

export const RoutinesExecutionHistory: React.FC<RoutinesExecutionHistoryProps> = ({ clientId }) => {
  const [executions, setExecutions] = useState<RoutineExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ITEMS_PER_PAGE = 25;

  const fetchExecutions = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * ITEMS_PER_PAGE;

      // Count total records
      const { count } = await supabase
        .from('routine_executions_history')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', clientId);

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
      setTotalPages(totalPages);

      // Fetch data with pagination
      const { data, error } = await supabase
        .from('routine_executions_history')
        .select('*')
        .eq('company_id', clientId)
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) {
        throw error;
      }

      setExecutions(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar histórico de execuções:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions(currentPage);
  }, [clientId, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-red-800 dark:text-red-200">
            <strong>Erro:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  if (executions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
        <Clock className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          Nenhuma execução encontrada
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Ainda não há histórico de execuções de rotinas para este cliente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Rotina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Instruções
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Executado por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Data Programada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Data de Execução
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {executions.map((execution) => (
                <tr key={execution.execution_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {execution.routine_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400" title={execution.routine_description}>
                      {truncateText(execution.routine_description, 80)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400" title={execution.routine_instructions}>
                      {truncateText(execution.routine_instructions, 100)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-slate-400 mr-2" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {execution.executed_by_name || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(execution.executed_at)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDateTime(execution.created_at)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700 dark:text-slate-300">
              Mostrando <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> até{' '}
              <span className="font-medium">
                {Math.min(currentPage * ITEMS_PER_PAGE, executions.length + ((currentPage - 1) * ITEMS_PER_PAGE))}
              </span>{' '}
              de <span className="font-medium">{totalPages * ITEMS_PER_PAGE}</span> resultados
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                    page === currentPage
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};