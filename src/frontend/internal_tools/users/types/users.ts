// Tipos para gestão de usuários BPO
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type UserProfileType = 'BPO Operator' | 'Vendedor' | 'Customer Success' | 'Analista' | 'Admin';

export interface BpoUser {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  whatsapp?: string;
  is_active: boolean;
  is_verified: boolean;
  verification_level: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  role_id: string;
  profile_id?: string;
  company_id?: string; // NULL para usuários BPO
  
  // Dados do perfil
  profile_name?: string;
  role_name?: string;
  
  // Campos calculados
  status: UserStatus;
  profile_type: UserProfileType;
  
  // Dados operacionais
  last_login_at?: string;
  companies_managed?: number; // Quantas empresas ele gerencia
}

export interface UserFilters {
  status?: UserStatus;
  profile_type?: UserProfileType;
  search?: string;
  is_verified?: boolean;
  created_from?: string;
  created_to?: string;
}

export interface UserListResponse {
  data: BpoUser[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserPayload {
  email: string;
  full_name: string;
  phone?: string;
  profile_id: string;
  is_active?: boolean;
  temporary_password?: string;
}

export interface UpdateUserPayload {
  full_name?: string;
  phone?: string;
  whatsapp?: string;
  profile_id?: string;
  is_active?: boolean;
}