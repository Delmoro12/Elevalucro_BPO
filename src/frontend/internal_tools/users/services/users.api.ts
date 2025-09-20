import { 
  BpoUser, 
  UserListResponse, 
  UserFilters,
  UpdateUserPayload 
} from '../types/users';
import { supabase } from '@/src/lib/supabase';
// Interface simples para dados do formulário
interface UserFormData {
  email: string;
  full_name: string;
  phone?: string;
}

// Buscar usuários BPO (role = 'bpo_side')
export async function getBpoUsers(filters: UserFilters = {}): Promise<UserListResponse> {
  try {
    console.log('👥 Fetching BPO users...');
    
    // Construir query base com JOIN para roles e profiles
    let query = supabase
      .from('users')
      .select(`
        *,
        roles!inner(id, name),
        profiles(id, name)
      `)
      .eq('roles.name', 'bpo_side')  // Apenas usuários BPO
      .is('company_id', null);       // BPO users não têm company_id
    
    // Aplicar filtros
    if (filters.status) {
      const isActive = filters.status === 'active';
      query = query.eq('is_active', isActive);
    }
    
    if (filters.profile_type) {
      query = query.eq('profiles.name', filters.profile_type);
    }
    
    if (filters.search) {
      // Buscar por nome, email
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    
    if (filters.is_verified !== undefined) {
      query = query.eq('is_verified', filters.is_verified);
    }
    
    if (filters.created_from) {
      query = query.gte('created_at', filters.created_from);
    }
    
    if (filters.created_to) {
      query = query.lte('created_at', filters.created_to);
    }
    
    // Ordenar por data de criação mais recente
    query = query.order('created_at', { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('❌ Error fetching BPO users:', error);
      throw new Error(`Failed to fetch BPO users: ${error.message}`);
    }
    
    console.log('✅ BPO users fetched:', data?.length || 0);
    
    // Mapear dados para o formato BpoUser
    const users: BpoUser[] = (data || []).map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      whatsapp: user.whatsapp,
      is_active: user.is_active,
      is_verified: user.is_verified,
      verification_level: user.verification_level,
      created_at: user.created_at,
      updated_at: user.updated_at,
      
      // Relacionamentos
      role_id: user.role_id,
      profile_id: user.profile_id,
      company_id: user.company_id,
      
      // Dados do perfil
      profile_name: user.profiles?.name,
      role_name: user.roles?.name,
      
      // Campos calculados
      status: user.is_active ? 'active' : 'inactive',
      profile_type: user.profiles?.name || 'Admin',
      
      // Dados operacionais (podem ser expandidos)
      last_login_at: user.updated_at, // Placeholder
      companies_managed: 0, // TODO: calcular via query
    }));
    
    return {
      data: users,
      total: count || users.length,
      page: 1,
      limit: 50
    };
  } catch (error) {
    console.error('Erro ao buscar usuários BPO:', error);
    throw error;
  }
}

// Atualizar usuário BPO
export async function updateBpoUser(userId: string, data: UpdateUserPayload): Promise<boolean> {
  try {
    console.log('✏️ Updating BPO user:', userId);
    
    const { error } = await supabase
      .from('users')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('❌ Error updating BPO user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
    
    console.log('✅ BPO user updated successfully');
    return true;
  } catch (error) {
    console.error('Erro ao atualizar usuário BPO:', error);
    return false;
  }
}

// Deletar usuário BPO (soft delete)
export async function deleteBpoUser(userId: string): Promise<boolean> {
  try {
    console.log('🗑️ Deleting BPO user:', userId);
    
    const { error } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('❌ Error deleting BPO user:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
    
    console.log('✅ BPO user deleted successfully');
    return true;
  } catch (error) {
    console.error('Erro ao deletar usuário BPO:', error);
    return false;
  }
}

// Criar ou atualizar usuário BPO via edge function
export async function upsertBpoUser(userData: UserFormData): Promise<any> {
  try {
    console.log('💫 Upserting BPO user:', userData.email);
    
    const { data, error } = await supabase.functions.invoke('bpo-user-upsert', {
      body: userData
    });
    
    if (error) {
      console.error('❌ Error upserting BPO user:', error);
      throw new Error(`Failed to upsert user: ${error.message}`);
    }
    
    if (data?.error) {
      console.error('❌ Edge function error:', data.error);
      throw new Error(data.error);
    }
    
    console.log('✅ BPO user upserted successfully');
    return data;
  } catch (error) {
    console.error('Erro ao criar/atualizar usuário BPO:', error);
    throw error;
  }
}

// Buscar perfis disponíveis para usuários BPO
export async function getBpoProfiles() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('role_id', (
        await supabase
          .from('roles')
          .select('id')
          .eq('name', 'bpo_side')
          .single()
      ).data?.id)
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('❌ Error fetching BPO profiles:', error);
      throw new Error(`Failed to fetch profiles: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar perfis BPO:', error);
    return [];
  }
}