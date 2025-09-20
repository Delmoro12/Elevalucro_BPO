import { supabase } from '../../../../../lib/supabase';

export interface CreateRoutineData {
  company_id: string;
  routine_id?: string;
  custom_name?: string;
  custom_description?: string;
  custom_instructions?: string;
  custom_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  assigned_to?: string;
  start_date?: string;
  day_of_week?: number;
  day_of_month?: number;
  month_of_year?: number;
}

export interface UpdateRoutineData extends Partial<CreateRoutineData> {
  id: string;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  description: string;
  instructions: string;
  is_active: boolean;
  created_at: string;
}

const API_BASE_URL = '/api';

/**
 * Busca todas as rotinas template disponíveis
 */
export async function getRoutineTemplates(): Promise<RoutineTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('routines')
      .select('id, name, description, instructions, is_active, created_at')
      .eq('is_template', true)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Erro ao buscar templates de rotinas:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Erro na busca de templates:', error);
    throw error;
  }
}

/**
 * Cria uma nova rotina para uma empresa
 */
export async function createCompanyRoutine(data: CreateRoutineData): Promise<string> {
  try {
    // Get session token for API call
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${API_BASE_URL}/companies-routines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar rotina');
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Erro ao criar rotina:', error);
    throw error;
  }
}

/**
 * Atualiza uma rotina existente
 */
export async function updateCompanyRoutine(data: UpdateRoutineData): Promise<boolean> {
  try {
    // Get session token for API call
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${API_BASE_URL}/companies-routines/${data.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar rotina');
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar rotina:', error);
    throw error;
  }
}

/**
 * Deleta uma rotina
 */
export async function deleteCompanyRoutine(routineId: string): Promise<boolean> {
  try {
    console.log('🗑️ Iniciando delete da rotina:', routineId);
    
    // Get session token for API call
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Usuário não autenticado');
    }

    const url = `${API_BASE_URL}/companies-routines/${routineId}`;
    console.log('🗑️ DELETE URL:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    console.log('🗑️ Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('🗑️ Delete error response:', errorData);
      throw new Error(errorData.error || 'Erro ao deletar rotina');
    }

    const result = await response.json();
    console.log('🗑️ Delete success:', result);
    return true;
  } catch (error) {
    console.error('🗑️ Erro ao deletar rotina:', error);
    throw error;
  }
}

/**
 * Busca uma rotina específica por ID
 */
export async function getCompanyRoutineById(routineId: string): Promise<any> {
  try {
    // Get session token for API call
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${API_BASE_URL}/companies-routines/${routineId}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar rotina');
    }

    const result = await response.json();
    return result.routine;
  } catch (error) {
    console.error('Erro ao buscar rotina:', error);
    throw error;
  }
}

/**
 * Busca usuários disponíveis para atribuição
 */
export async function getAvailableUsers(): Promise<Array<{id: string, name: string, email: string}>> {
  try {
    // Primeiro buscar o role_id para bpo_side
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'bpo_side')
      .single();

    if (roleError || !roleData) {
      console.error('Erro ao buscar role bpo_side:', roleError);
      throw new Error('Role bpo_side não encontrada');
    }

    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email
      `)
      .eq('is_active', true)
      .eq('role_id', roleData.id)
      .order('full_name');

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      throw new Error(error.message);
    }

    // Mapear full_name para name
    const users = data?.map(user => ({
      id: user.id,
      name: user.full_name,
      email: user.email
    })) || [];
    
    return users;
  } catch (error) {
    console.error('Erro na busca de usuários:', error);
    throw error;
  }
}