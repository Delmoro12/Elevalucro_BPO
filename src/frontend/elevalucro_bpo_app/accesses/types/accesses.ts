export interface ClientAccess {
  id: string;
  company_id: string;
  description: string;
  login: string;
  password: string;
  url?: string;
  created_by?: string;
  created_at: string;
  updated_by?: string;
  updated_at: string;
  
  // Campos computados
  created_by_name?: string;
  updated_by_name?: string;
}

export interface ClientAccessFormData {
  description: string;
  login: string;
  password: string;
  url?: string;
}

export interface ClientAccessFilters {
  search?: string;
  created_by?: string;
}

export interface ClientAccessListResponse {
  data: ClientAccess[];
  total: number;
  page: number;
  limit: number;
}

export interface ClientAccessCreatePayload {
  company_id: string;
  description: string;
  login: string;
  password: string;
  url?: string;
}

export interface ClientAccessUpdatePayload {
  description?: string;
  login?: string;
  password?: string;
  url?: string;
}