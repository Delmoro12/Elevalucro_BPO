'use client';

import React from 'react';
import { Clock, User, AlertCircle, CheckCircle, Calendar, FileText } from 'lucide-react';
import { CompanyRoutineDetail } from '../../types/routines';

interface RoutinesKanbanCardProps {
  routine: CompanyRoutineDetail;
  onClick?: (routine: CompanyRoutineDetail) => void;
}

export const RoutinesKanbanCard: React.FC<RoutinesKanbanCardProps> = ({ 
  routine, 
  onClick 
}) => {
  const getStatusColor = (status: string) => {
    const colors = {
      'overdue': 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
      'due_soon': 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
      'upcoming': 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
      'scheduled': 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50',
      'not_scheduled': 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20',
      'inactive': 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700/50',
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'due_soon':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'upcoming':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'scheduled':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      'overdue': 'Atrasada',
      'due_soon': 'Vence em breve',
      'upcoming': 'Próxima',
      'scheduled': 'Agendada',
      'not_scheduled': 'Não agendada',
      'inactive': 'Inativa',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDaysText = (days: number | null, type: 'until' | 'since') => {
    if (days === null) return null;
    
    if (type === 'until') {
      if (days < 0) return `${Math.abs(days)} dias atrasada`;
      if (days === 0) return 'Vence hoje';
      if (days === 1) return 'Vence amanhã';
      return `${days} dias para vencer`;
    } else {
      if (days === 0) return 'Executada hoje';
      if (days === 1) return 'Executada ontem';
      return `${days} dias atrás`;
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getStatusColor(routine.routine_status)}`}
      onClick={() => onClick?.(routine)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {getStatusIcon(routine.routine_status)}
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {routine.routine_title}
          </h4>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 whitespace-nowrap ml-2">
          {getStatusText(routine.routine_status)}
        </span>
      </div>

      {/* Description */}
      {routine.routine_description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {routine.routine_description}
        </p>
      )}

      {/* Next execution */}
      {routine.routine_next_execution && (
        <div className="flex items-center space-x-1 mb-2">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Próxima: {formatDate(routine.routine_next_execution)}
          </span>
        </div>
      )}

      {/* Days info */}
      {routine.days_until_next_execution !== null && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {formatDaysText(routine.days_until_next_execution, 'until')}
        </div>
      )}

      {/* Assigned user */}
      {routine.assigned_to_name && (
        <div className="flex items-center space-x-1 mb-2">
          <User className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {routine.assigned_to_name}
          </span>
        </div>
      )}

      {/* Last execution */}
      {routine.days_since_last_execution !== null && (
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-2 mt-2">
          Última execução: {formatDaysText(routine.days_since_last_execution, 'since')}
        </div>
      )}

      {/* Success rate */}
      {routine.execution_stats && routine.execution_stats.success_rate_30_days > 0 && (
        <div className="text-xs text-green-600 dark:text-green-400">
          {routine.execution_stats.success_rate_30_days.toFixed(0)}% sucesso (30 dias)
        </div>
      )}
    </div>
  );
};