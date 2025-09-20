'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  User,
  CheckCircle2,
  Circle,
  AlertCircle,
  RefreshCw,
  Plus,
  Search,
  Edit3,
  Trash2,
  RotateCcw,
  History,
} from 'lucide-react';
import { useRoutines } from '../../hooks/useRoutines';
import { useRoutineExecutions } from '../../hooks/useRoutineExecutions';
import { useRoutineCRUD } from '../../hooks/useRoutineCRUD';
import { CompanyRoutineDetail } from '../../types/routines';
import { RoutinesSidebarModal } from './RoutinesSidebarModal';
import { RoutinesExecutionHistory } from './RoutinesExecutionHistory';
import { ConfirmationModal } from '@/src/frontend/shared/components/ConfirmationModal';

interface RoutinesTableProps {
  clientId: string;
}

type ViewMode = 'active' | 'history';

type FrequencyType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

interface PeriodColumn {
  id: string;
  label: string;
  date: Date;
  frequency: FrequencyType;
}

export const RoutinesTable: React.FC<RoutinesTableProps> = ({ clientId }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [selectedPeriod, setSelectedPeriod] = useState<FrequencyType>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<{ assigned_to?: string; status?: string }>({});

  const { routines, loading, error, refetch } = useRoutines(clientId);
  const { executeRoutine, isExecuting } = useRoutineExecutions();
  const routineCRUD = useRoutineCRUD();

  // Gera colunas do período com base na frequência selecionada
  const periodColumns = useMemo(() => {
    const columns: PeriodColumn[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    switch (selectedPeriod) {
      case 'daily': {
        // Últimos 7 e próximos 7 dias com base em currentDate
        for (let i = -7; i <= 7; i++) {
          const date = new Date(currentDate);
          date.setDate(currentDate.getDate() + i);
          columns.push({
            id: `daily-${i}`,
            label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            date,
            frequency: 'daily',
          });
        }
        break;
      }

      case 'weekly': {
        // 8 semanas (4 passadas, atual, 3 futuras)
        for (let i = -4; i <= 3; i++) {
          const base = new Date(currentDate);
          base.setDate(currentDate.getDate() + i * 7);

          // Segunda-feira como início da semana
          const day = base.getDay() === 0 ? 7 : base.getDay(); // 1..7 (segunda..domingo)
          const startWeek = new Date(base);
          startWeek.setDate(base.getDate() - day + 1);

          columns.push({
            id: `weekly-${i}`,
            label: `Sem ${startWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`,
            date: startWeek,
            frequency: 'weekly',
          });
        }
        break;
      }

      case 'biweekly': {
        // 6 quinzenas (3 passadas, atual, 2 futuras)
        for (let i = -3; i <= 2; i++) {
          const date = new Date(currentDate);
          date.setDate(currentDate.getDate() + i * 14);
          columns.push({
            id: `biweekly-${i}`,
            label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            date,
            frequency: 'biweekly',
          });
        }
        break;
      }

      case 'monthly': {
        // 12 meses do ano atual
        for (let i = 0; i < 12; i++) {
          const date = new Date(year, i, 1);
          columns.push({
            id: `monthly-${i}`,
            label: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
            date,
            frequency: 'monthly',
          });
        }
        break;
      }

      case 'quarterly': {
        // 4 trimestres
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        for (let i = 0; i < 4; i++) {
          const date = new Date(year, i * 3, 1);
          columns.push({
            id: `quarterly-${i}`,
            label: quarters[i],
            date,
            frequency: 'quarterly',
          });
        }
        break;
      }

      case 'yearly': {
        // 3 anos (passado, atual, futuro)
        for (let i = -1; i <= 1; i++) {
          const date = new Date(year + i, 0, 1);
          columns.push({
            id: `yearly-${i}`,
            label: (year + i).toString(),
            date,
            frequency: 'yearly',
          });
        }
        break;
      }
    }

    return columns;
  }, [selectedPeriod, currentDate]);

  const getRoutineFrequency = (routine: CompanyRoutineDetail): FrequencyType => {
    const customFreq = routine.routine_custom_schedule?.toLowerCase();
    if (customFreq === 'daily') return 'daily';
    if (customFreq === 'weekly') return 'weekly';
    if (customFreq === 'biweekly') return 'biweekly';
    if (customFreq === 'monthly') return 'monthly';
    if (customFreq === 'quarterly') return 'quarterly';
    if (customFreq === 'yearly') return 'yearly';
    return 'monthly';
  };

  // Filtro por busca e filtros + frequência selecionada
  const filteredRoutines = useMemo(() => {
    let filtered = routines;

    filtered = filtered.filter((routine) => getRoutineFrequency(routine) === selectedPeriod);

    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (routine) =>
          routine.routine_title.toLowerCase().includes(searchLower) ||
          routine.routine_description?.toLowerCase().includes(searchLower) ||
          routine.assigned_to_name?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.assigned_to) {
      filtered = filtered.filter((routine) => routine.routine_assigned_to === filters.assigned_to);
    }

    return filtered;
  }, [routines, searchValue, filters, selectedPeriod]);

  const handleExecuteRoutine = async (routine: CompanyRoutineDetail, period: PeriodColumn) => {
    try {
      await executeRoutine({
        company_routine_id: routine.company_routine_id,
        executed_at: period.date.toISOString(),
        status: 'completed',
      });
      refetch();
    } catch (error) {
      console.error('Error executing routine:', error);
    }
  };

  const isExecutedInPeriod = (routine: CompanyRoutineDetail, period: PeriodColumn): boolean => {
    if (!routine.execution_history) return false;

    return routine.execution_history.some((execution) => {
      const executionDate = new Date(execution.executed_at);
      const periodStart = new Date(period.date);
      const periodEnd = new Date(period.date);

      switch (period.frequency) {
        case 'daily':
          return executionDate.toDateString() === period.date.toDateString();
        case 'weekly':
          periodEnd.setDate(periodStart.getDate() + 6);
          break;
        case 'biweekly':
          periodEnd.setDate(periodStart.getDate() + 13);
          break;
        case 'monthly':
          periodEnd.setMonth(periodStart.getMonth() + 1);
          periodEnd.setDate(0);
          break;
        case 'quarterly':
          periodEnd.setMonth(periodStart.getMonth() + 3);
          periodEnd.setDate(0);
          break;
        case 'yearly':
          periodEnd.setFullYear(periodStart.getFullYear() + 1);
          periodEnd.setDate(0);
          break;
      }

      return executionDate >= periodStart && executionDate <= periodEnd;
    });
  };

  const getScheduleTags = (routine: CompanyRoutineDetail): React.ReactNode[] => {
    const tags: React.ReactNode[] = [];
    const frequency = getRoutineFrequency(routine);

    const frequencyLabels: Record<FrequencyType, string> = {
      daily: 'Diário',
      weekly: 'Semanal',
      biweekly: 'Quinzenal',
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      yearly: 'Anual',
    };

    tags.push(
      <span
        key="frequency"
        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded"
      >
        {frequencyLabels[frequency]}
      </span>
    );

    if (routine.day_of_week && (frequency === 'weekly' || frequency === 'biweekly')) {
      const weekDays = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
      tags.push(
        <span
          key="dayweek"
          className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded"
        >
          {weekDays[routine.day_of_week]}
        </span>
      );
    }

    if (routine.day_of_month && frequency === 'monthly') {
      tags.push(
        <span
          key="daymonth"
          className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded"
        >
          Dia {routine.day_of_month}
        </span>
      );
    }

    if (routine.month_of_year && frequency === 'yearly') {
      const months = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      tags.push(
        <span
          key="month"
          className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded"
        >
          {months[routine.month_of_year]}
        </span>
      );
    }

    return tags;
  };

  const shouldShowCheckbox = (routine: CompanyRoutineDetail, period: PeriodColumn): boolean => {
    const routineFreq = getRoutineFrequency(routine);
    return routineFreq === period.frequency;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">Carregando rotinas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-800 dark:text-red-200 font-medium">Erro ao carregar rotinas</span>
        </div>
        <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-3 py-1 text-sm bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      {/* Header com controles */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Campo de busca */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar rotinas..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Seletor de periodicidade */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as FrequencyType)}
              className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quinzenal</option>
              <option value="monthly">Mensal</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
        </div>

        {/* Botões de ação e tabs */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => refetch()}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            title="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Toggle de visualização */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('active')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'active'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Rotinas</span>
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'history'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </button>
          </div>

          <button
            onClick={routineCRUD.openCreateModal}
            className="flex items-center space-x-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Rotina</span>
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      {viewMode === 'history' ? (
        <RoutinesExecutionHistory clientId={clientId} />
      ) : (
        // Tabela de rotinas
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100 w-[400px] min-w-[400px] max-w-[400px] sticky left-0 bg-white dark:bg-slate-800 z-10">
                  Rotina
                </th>
                <th className="text-center py-3 px-2 font-medium text-slate-900 dark:text-slate-100 w-[120px]">
                  Responsável
                </th>
                {periodColumns.map((period) => (
                  <th
                    key={period.id}
                    className="text-center py-3 px-2 font-medium text-slate-900 dark:text-slate-100 w-[90px]"
                  >
                    {period.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRoutines.map((routine) => (
                <tr
                  key={routine.company_routine_id}
                  className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  {/* Routine Info */}
                  <td className="py-3 px-4 w-[400px] min-w-[400px] max-w-[400px] sticky left-0 bg-white dark:bg-slate-800 z-10">
                    <div className="flex flex-col w-full max-w-[400px]">
                      <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {routine.routine_title}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {routine.routine_description}
                      </span>
                      <div className="flex flex-col gap-1 mt-1">
                        {/* Tags line with edit and delete icons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">{getScheduleTags(routine)}</div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                routineCRUD.openEditModal(routine.company_routine_id);
                              }}
                              className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                              title="Editar rotina"
                            >
                              <Edit3 className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                            </button>
                            <button
                              onClick={() => {
                                routineCRUD.openDeleteModal(
                                  routine.company_routine_id,
                                  routine.routine_title
                                );
                              }}
                              className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Excluir rotina"
                            >
                              <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-600 dark:hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Assigned To */}
                  <td className="py-3 px-2 text-center">
                    <div className="flex flex-col items-center">
                      <User className="h-4 w-4 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {routine.assigned_to_name || 'Não atribuído'}
                      </span>
                    </div>
                  </td>

                  {/* Period Columns */}
                  {periodColumns.map((period) => (
                    <td key={period.id} className="py-3 px-2 text-center">
                      {shouldShowCheckbox(routine, period) ? (
                        <button
                          onClick={() => handleExecuteRoutine(routine, period)}
                          disabled={isExecuting}
                          className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                          title={`Marcar como executado em ${period.label}`}
                        >
                          {isExecutedInPeriod(routine, period) ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                          )}
                        </button>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredRoutines.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Nenhuma rotina encontrada
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                {routines.length === 0
                  ? 'Esta empresa ainda não possui rotinas configuradas.'
                  : 'Tente ajustar os filtros para ver mais resultados.'}
              </p>
            </div>
          )}
        </div>
      )} {/* <-- fecha o ternário exatamente aqui */}

      {/* Modais FORA do ternário */}
      <RoutinesSidebarModal
        isOpen={routineCRUD.isOpen}
        onClose={routineCRUD.closeModal}
        onSave={async (data) => {
          const success = await routineCRUD.saveRoutine(data);
          if (success) {
            setTimeout(() => {
              refetch();
            }, 500);
          }
          return success;
        }}
        mode={routineCRUD.mode}
        companyId={clientId}
        routineData={routineCRUD.routineData}
        templates={routineCRUD.templates}
        users={routineCRUD.users}
        loading={routineCRUD.loading}
        saving={routineCRUD.saving}
        error={routineCRUD.error}
      />

      <ConfirmationModal
        isOpen={routineCRUD.deleteModalOpen}
        onClose={routineCRUD.closeDeleteModal}
        onConfirm={async () => {
          const success = await routineCRUD.confirmDelete();
          if (success) {
            setTimeout(() => {
              refetch();
            }, 500);
          }
        }}
        title="Excluir Rotina"
        message={`Tem certeza que deseja excluir a rotina "${routineCRUD.routineToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={routineCRUD.deleting}
        variant="danger"
      />
    </div>
  );
};

