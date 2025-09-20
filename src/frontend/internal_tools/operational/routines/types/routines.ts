export interface CompanyRoutine {
  company_routine_id: string;
  company_id: string;
  company_name: string;
  routine_id: string | null;
  routine_title: string;
  routine_description: string;
  routine_custom_schedule: string | null;
  routine_next_execution: string | null;
  routine_last_execution: string | null;
  routine_is_active: boolean;
  assigned_to: string | null;
  assigned_to_name: string | null;
  assigned_to_email: string | null;
  day_of_week: number | null;
  day_of_month: number | null;
  month_of_year: number | null;
  start_date: string | null;
  routine_status: 'inactive' | 'not_scheduled' | 'overdue' | 'due_soon' | 'upcoming' | 'scheduled';
  days_until_next_execution: number | null;
  days_since_last_execution: number | null;
  execution_stats: {
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    last_30_days_executions: number;
    success_rate_30_days: number;
  };
}

export interface RoutineFilters {
  company_id?: string;
  date_filter?: 'today' | 'this_week' | 'this_month' | 'custom';
  start_date?: string;
  end_date?: string;
  status?: string;
  assigned_to?: string;
  search?: string;
}

export interface Company {
  id: string;
  name: string;
}