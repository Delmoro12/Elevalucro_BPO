export interface ExecutionHistory {
  id: string;
  executed_at: string;
  status: 'completed' | 'partially_completed' | 'failed';
  duration_minutes: number | null;
  executed_by_name: string | null;
  executed_by_email: string | null;
  observations: string | null;
  attachments: string[] | null;
}

export interface ExecutionStats {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_duration_minutes: number | null;
  last_30_days_executions: number;
  success_rate_30_days: number;
}

export interface CompanyRoutineDetail {
  company_id: string;
  nome_empresa: string;
  email: string;
  telefone: string;
  segmento: string;
  plano: string;
  
  // Routine info
  routine_id: string;
  routine_title: string;
  routine_description: string;
  
  // Company routine assignment
  company_routine_id: string;
  routine_is_active: boolean;
  routine_custom_schedule: string | null;
  routine_next_execution: string | null;
  routine_last_execution: string | null;
  routine_assigned_to: string | null;
  routine_notes: string | null;
  routine_added_at: string;
  
  // Schedule settings
  day_of_week: number | null;
  day_of_month: number | null;
  month_of_year: number | null;
  start_date: string | null;
  
  // Assigned user info
  assigned_to_name: string | null;
  assigned_to_email: string | null;
  
  // Execution data
  execution_history: ExecutionHistory[] | null;
  execution_stats: ExecutionStats | null;
  
  // Calculated status
  routine_status: 'inactive' | 'not_scheduled' | 'overdue' | 'due_soon' | 'upcoming' | 'scheduled';
  days_until_next_execution: number | null;
  days_since_last_execution: number | null;
}

export interface RoutineFilters {
  status?: 'inactive' | 'not_scheduled' | 'overdue' | 'due_soon' | 'upcoming' | 'scheduled';
  assigned_to?: string;
  search?: string;
}

export interface RoutineKanbanColumn {
  id: string;
  title: string;
  status: string[];
  color: string;
  count: number;
}