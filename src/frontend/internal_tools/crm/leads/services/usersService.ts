import { supabase } from '@/src/lib/supabase';
import { User } from '../types/leads';

export const getUsersByRole = async (roleName: string): Promise<User[]> => {
  try {
    console.log(`🔍 Service: Buscando usuários com role '${roleName}'...`);
    
    // Usar a mesma query que funciona na feature users
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        roles!inner(id, name)
      `)
      .eq('roles.name', roleName)
      .eq('is_active', true)
      .is('company_id', null)  // BPO users não têm company_id
      .order('full_name');

    if (error) {
      console.error('❌ Service: Erro ao buscar usuários:', error);
      return [];
    }

    console.log(`📊 Service: Dados retornados do Supabase:`, data);

    // Mapear os dados para o formato esperado
    const users: User[] = (data || []).map(user => ({
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: roleName
    }));

    console.log(`✅ Service: Usuários mapeados (${users.length}):`, users);
    return users;
  } catch (error) {
    console.error('❌ Service: Erro ao buscar usuários:', error);
    return [];
  }
};

export const getBpoSideUsers = async (): Promise<User[]> => {
  return getUsersByRole('bpo_side');
};