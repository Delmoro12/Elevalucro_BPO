import { useMemo } from 'react';
import { CompanyRoutineDetail } from '../types/routines';

interface RoutinesIndicators {
  total: number;
  overdue: number;
  dueSoon: number;
  upcoming: number;
  successRate30Days: number;
  avgExecutionTime: number;
  activeRoutines: number;
}

export const useRoutinesIndicators = (routines: CompanyRoutineDetail[]): RoutinesIndicators => {
  return useMemo(() => {
    const total = routines.length;
    const overdue = routines.filter(r => r.routine_status === 'overdue').length;
    const dueSoon = routines.filter(r => r.routine_status === 'due_soon').length;
    const upcoming = routines.filter(r => r.routine_status === 'upcoming').length;
    const activeRoutines = routines.filter(r => r.routine_is_active).length;

    // Calculate success rate (average across all routines)
    const routinesWithStats = routines.filter(r => r.execution_stats && r.execution_stats.last_30_days_executions > 0);
    const successRate30Days = routinesWithStats.length > 0
      ? routinesWithStats.reduce((sum, r) => sum + (r.execution_stats?.success_rate_30_days || 0), 0) / routinesWithStats.length
      : 0;

    // Calculate average execution time
    const routinesWithTime = routines.filter(r => r.execution_stats && r.execution_stats.avg_duration_minutes);
    const avgExecutionTime = routinesWithTime.length > 0
      ? routinesWithTime.reduce((sum, r) => sum + (r.execution_stats?.avg_duration_minutes || 0), 0) / routinesWithTime.length
      : 0;

    return {
      total,
      overdue,
      dueSoon,
      upcoming,
      successRate30Days,
      avgExecutionTime,
      activeRoutines,
    };
  }, [routines]);
};