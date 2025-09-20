'use client';

import React from 'react';
import { Calendar, Clock, User, Building2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { CompanyRoutine } from '../types/routines';

interface RoutinesTableViewProps {
  routines: CompanyRoutine[];
  loading: boolean;
}

export const RoutinesTableView: React.FC<RoutinesTableViewProps> = ({
  routines,
  loading
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      overdue: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Atrasada' },
      due_soon: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', label: 'Próxima' },
      upcoming: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Agendada' },
      scheduled: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', label: 'Programada' },
      not_scheduled: { bg: 'bg-slate-100 dark:bg-slate-900/30', text: 'text-slate-700 dark:text-slate-300', label: 'Não agendada' },
      inactive: { bg: 'bg-slate-100 dark:bg-slate-900/30', text: 'text-slate-500 dark:text-slate-400', label: 'Inativa' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_scheduled;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getFrequencyLabel = (frequency: string | null) => {
    const frequencyMap: Record<string, string> = {
      daily: 'Diário',
      weekly: 'Semanal',
      biweekly: 'Quinzenal',
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      yearly: 'Anual'
    };
    return frequency ? frequencyMap[frequency] || frequency : '-';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSuccessRateBadge = (rate: number) => {
    let colorClass = '';
    let icon = null;
    
    if (rate >= 80) {
      colorClass = 'text-emerald-600 dark:text-emerald-400';
      icon = <CheckCircle className="h-4 w-4" />;
    } else if (rate >= 60) {
      colorClass = 'text-amber-600 dark:text-amber-400';
      icon = <AlertCircle className="h-4 w-4" />;
    } else {
      colorClass = 'text-red-600 dark:text-red-400';
      icon = <XCircle className="h-4 w-4" />;
    }

    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        {icon}
        <span className="font-medium">{rate.toFixed(0)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Carregando rotinas...</p>
        </div>
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
            Nenhuma rotina encontrada
          </h3>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Ajuste os filtros ou aguarde novas rotinas serem cadastradas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Rotina
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Frequência
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Responsável
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Próxima Execução
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Última Execução
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Taxa de Sucesso (30d)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {routines.map((routine) => (
              <tr key={routine.company_routine_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-slate-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {routine.company_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {routine.routine_title}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                      {routine.routine_description}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-slate-400 mr-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {getFrequencyLabel(routine.routine_custom_schedule)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {routine.assigned_to_name ? (
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-slate-400 mr-2" />
                      <div>
                        <div className="text-sm text-slate-900 dark:text-white">
                          {routine.assigned_to_name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {routine.assigned_to_email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Não atribuído</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900 dark:text-white">
                    {formatDate(routine.routine_next_execution)}
                  </div>
                  {routine.days_until_next_execution !== null && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {routine.days_until_next_execution === 0 
                        ? 'Hoje'
                        : routine.days_until_next_execution === 1
                        ? 'Amanhã'
                        : routine.days_until_next_execution < 0
                        ? `${Math.abs(routine.days_until_next_execution)} dias atrás`
                        : `Em ${routine.days_until_next_execution} dias`
                      }
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900 dark:text-white">
                    {formatDate(routine.routine_last_execution)}
                  </div>
                  {routine.days_since_last_execution !== null && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {routine.days_since_last_execution === 0
                        ? 'Hoje'
                        : routine.days_since_last_execution === 1
                        ? 'Ontem'
                        : `${routine.days_since_last_execution} dias atrás`
                      }
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {getSuccessRateBadge(routine.execution_stats.success_rate_30_days)}
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {routine.execution_stats.last_30_days_executions} execuções
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};