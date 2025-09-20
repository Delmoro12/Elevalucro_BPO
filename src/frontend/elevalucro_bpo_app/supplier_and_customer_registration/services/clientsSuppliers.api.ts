import { 
  ClientSupplier, 
  ClientSupplierFormData, 
  ClientSupplierFilters 
} from '../types/clientsSuppliers';

export interface ClientSupplierListResponse {
  data: ClientSupplier[];
  total: number;
  success: boolean;
  error?: string;
}

export interface ClientSupplierResponse {
  data: ClientSupplier;
  success: boolean;
  error?: string;
}

export interface DeleteResponse {
  success: boolean;
  error?: string;
}

const BASE_URL = '/api/elevalucro-bpo-app/clients-suppliers';

export async function getClientsSuppliers(
  companyId: string, 
  filters: ClientSupplierFilters = {}
): Promise<ClientSupplierListResponse> {
  try {
    console.log('🏢 BPO-APP: Fetching clients/suppliers for company:', companyId);
    
    const params = new URLSearchParams({ company_id: companyId });
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    if (filters.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    
    if (filters.is_active !== undefined) {
      params.append('is_active', filters.is_active.toString());
    }
    
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    console.log('✅ BPO-APP: Clients/suppliers fetched:', data.data?.length || 0);
    return data;
  } catch (error) {
    console.error('❌ BPO-APP: Error fetching clients/suppliers:', error);
    throw error;
  }
}

export async function createClientSupplier(
  companyId: string,
  formData: ClientSupplierFormData
): Promise<ClientSupplier> {
  try {
    console.log('🏢 BPO-APP: Creating client/supplier for company:', companyId);
    
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_id: companyId,
        ...formData,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create client/supplier');
    }
    
    console.log('✅ BPO-APP: Client/supplier created:', data.data.id);
    return data.data;
  } catch (error) {
    console.error('❌ BPO-APP: Error creating client/supplier:', error);
    throw error;
  }
}

export async function updateClientSupplier(
  id: string,
  formData: Partial<ClientSupplierFormData>
): Promise<ClientSupplier> {
  try {
    console.log('🏢 BPO-APP: Updating client/supplier:', id);
    
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update client/supplier');
    }
    
    console.log('✅ BPO-APP: Client/supplier updated:', id);
    return data.data;
  } catch (error) {
    console.error('❌ BPO-APP: Error updating client/supplier:', error);
    throw error;
  }
}

export async function deleteClientSupplier(id: string): Promise<boolean> {
  try {
    console.log('🏢 BPO-APP: Deleting client/supplier:', id);
    
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete client/supplier');
    }
    
    console.log('✅ BPO-APP: Client/supplier deleted:', id);
    return true;
  } catch (error) {
    console.error('❌ BPO-APP: Error deleting client/supplier:', error);
    throw error;
  }
}

export async function getClientSupplierById(id: string): Promise<ClientSupplier> {
  try {
    console.log('🏢 BPO-APP: Fetching client/supplier by id:', id);
    
    const response = await fetch(`${BASE_URL}/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch client/supplier');
    }
    
    console.log('✅ BPO-APP: Client/supplier fetched:', id);
    return data.data;
  } catch (error) {
    console.error('❌ BPO-APP: Error fetching client/supplier:', error);
    throw error;
  }
}