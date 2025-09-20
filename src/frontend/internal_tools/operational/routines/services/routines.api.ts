import { supabase } from '@/src/lib/supabase';
import { CompanyRoutine, RoutineFilters } from '../types/routines';

export async function fetchAllRoutines(filters?: RoutineFilters): Promise<CompanyRoutine[]> {
  try {
    let query = supabase
      .from('company_routines_details')
      .select('*')
      .eq('routine_is_active', true);

    // Filtro por empresa
    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }

    // Filtro por responsável
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    // Filtro por status
    if (filters?.status) {
      query = query.eq('routine_status', filters.status);
    }

    // Filtro por busca (nome da rotina ou empresa)
    if (filters?.search) {
      query = query.or(`routine_title.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
    }

    // Filtros de data
    if (filters?.date_filter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let startDate: Date;
      let endDate: Date;

      switch (filters.date_filter) {
        case 'today':
          startDate = today;
          endDate = new Date(today);
          endDate.setDate(endDate.getDate() + 1);
          break;
        
        case 'this_week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay()); // Início da semana (domingo)
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 7);
          break;
        
        case 'this_month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          break;
        
        case 'custom':
          if (filters.start_date) {
            startDate = new Date(filters.start_date);
          } else {
            startDate = today;
          }
          
          if (filters.end_date) {
            endDate = new Date(filters.end_date);
            endDate.setDate(endDate.getDate() + 1); // Incluir o dia final
          } else {
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
          }
          break;
        
        default:
          startDate = today;
          endDate = new Date(today);
          endDate.setDate(endDate.getDate() + 1);
      }

      // Filtrar por próxima execução
      query = query.gte('routine_next_execution', startDate.toISOString().split('T')[0])
                   .lt('routine_next_execution', endDate.toISOString().split('T')[0]);
    }

    // Ordenação
    query = query.order('company_name', { ascending: true })
                 .order('routine_next_execution', { ascending: true, nullsFirst: false });

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar rotinas:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error: any) {
    console.error('Erro ao buscar rotinas:', error);
    throw error;
  }
}

export async function fetchCompanies(): Promise<Array<{id: string, name: string}>> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Erro ao buscar empresas:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error: any) {
    console.error('Erro ao buscar empresas:', error);
    throw error;
  }
}