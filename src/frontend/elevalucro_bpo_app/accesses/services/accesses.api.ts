import { supabase } from '@/src/lib/supabase';
import { 
  ClientAccess, 
  ClientAccessFormData, 
  ClientAccessListResponse,
  ClientAccessFilters 
} from '../types/accesses';

const API_BASE_URL = '/api/elevalucro-bpo-app/accesses';

// Helper para obter token de autorização
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Listar acessos
export const listAccesses = async (filters?: ClientAccessFilters): Promise<ClientAccessListResponse> => {
  try {
    console.log('📡 [API] Listing accesses with filters:', filters);

    const headers = await getAuthHeaders();
    
    // Construir query params
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    
    const url = `${API_BASE_URL}?${params.toString()}`;
    console.log('📡 [API] Request URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [API] Accesses listed successfully:', data.total);
    return data;
  } catch (error) {
    console.error('❌ [API] Error listing accesses:', error);
    throw error;
  }
};

// Buscar acesso por ID
export const getAccessById = async (id: string): Promise<ClientAccess> => {
  try {
    console.log('📡 [API] Getting access by ID:', id);

    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [API] Access retrieved successfully:', id);
    return data;
  } catch (error) {
    console.error('❌ [API] Error getting access:', error);
    throw error;
  }
};

// Criar acesso
export const createAccess = async (accessData: ClientAccessFormData): Promise<ClientAccess> => {
  try {
    console.log('📡 [API] Creating access:', { 
      description: accessData.description,
      login: accessData.login,
      hasPassword: !!accessData.password,
      hasUrl: !!accessData.url 
    });

    const headers = await getAuthHeaders();

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(accessData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [API] Access created successfully:', data.id);
    return data;
  } catch (error) {
    console.error('❌ [API] Error creating access:', error);
    throw error;
  }
};

// Atualizar acesso
export const updateAccess = async (id: string, accessData: Partial<ClientAccessFormData>): Promise<ClientAccess> => {
  try {
    console.log('📡 [API] Updating access:', id, { 
      description: accessData.description,
      login: accessData.login,
      hasPassword: !!accessData.password,
      hasUrl: !!accessData.url 
    });

    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(accessData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [API] Access updated successfully:', id);
    return data;
  } catch (error) {
    console.error('❌ [API] Error updating access:', error);
    throw error;
  }
};

// Deletar acesso
export const deleteAccess = async (id: string): Promise<void> => {
  try {
    console.log('📡 [API] Deleting access:', id);

    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    console.log('✅ [API] Access deleted successfully:', id);
  } catch (error) {
    console.error('❌ [API] Error deleting access:', error);
    throw error;
  }
};