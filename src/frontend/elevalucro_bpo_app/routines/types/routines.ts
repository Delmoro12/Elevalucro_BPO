export interface RoutineExecution {
  execution_id: string;
  executed_at: string;        // Data programada
  created_at: string;         // Data real de execução
  company_id: string;
  routine_name: string;
  routine_description: string;
  routine_instructions: string;
  executed_by_name: string | null;
  // Campos formatados para exibição
  executed_at_formatted?: string;
  created_at_formatted?: string;
  search_text?: string;       // Para busca
}

export interface RoutinesHistoryFilters {
  search?: string;           // Busca por nome da rotina
  start_date?: string;       // Filtro de data inicial
  end_date?: string;         // Filtro de data final
}

export interface RoutinesHistoryResponse {
  data: RoutineExecution[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UseRoutinesHistoryReturn {
  routines: RoutineExecution[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  fetchRoutines: (companyId: string, filters?: RoutinesHistoryFilters, page?: number) => Promise<void>;
  refreshRoutines: () => Promise<void>;
}