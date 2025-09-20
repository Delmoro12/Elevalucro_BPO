import { 
  ClientSupplier, 
  ClientSupplierFormData, 
  ClientSupplierFilters 
} from '../types/clientsSuppliers';
import { supabase } from '@/src/lib/supabase';

export interface ClientSupplierListResponse {
  data: ClientSupplier[];
  total: number;
  page: number;
  limit: number;
}

export async function getClientsSuppliers(
  companyId: string, 
  filters: ClientSupplierFilters = {}
): Promise<ClientSupplierListResponse> {
  try {
    console.log('🏢 Fetching clients/suppliers for company:', companyId);
    
    let query = supabase
      .from('companies_clients_suppliers')
      .select('*')
      .eq('company_id', companyId);
    
    // Aplicar filtros
    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }
    
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    } else {
      // Por padrão, mostrar apenas ativos
      query = query.eq('is_active', true);
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,cnpj.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%,email_billing.ilike.%${filters.search}%`);
    }
    
    // Ordenar por nome
    query = query.order('name', { ascending: true });
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('❌ Error fetching clients/suppliers:', error);
      throw new Error(`Failed to fetch clients/suppliers: ${error.message}`);
    }
    
    console.log('✅ Clients/suppliers fetched:', data?.length || 0);
    
    return {
      data: data || [],
      total: count || (data?.length || 0),
      page: 1,
      limit: 50
    };
  } catch (error) {
    console.error('Erro ao buscar clientes/fornecedores:', error);
    throw error;
  }
}

export async function createClientSupplier(
  companyId: string, 
  data: ClientSupplierFormData
): Promise<ClientSupplier> {
  try {
    console.log('🆕 Creating client/supplier for company:', companyId);
    
    const { data: result, error } = await supabase
      .from('companies_clients_suppliers')
      .insert({
        company_id: companyId,
        ...data,
        is_active: data.is_active ?? true
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating client/supplier:', error);
      throw new Error(`Failed to create client/supplier: ${error.message}`);
    }
    
    console.log('✅ Client/supplier created:', result.id);
    return result;
  } catch (error) {
    console.error('Erro ao criar cliente/fornecedor:', error);
    throw error;
  }
}

export async function updateClientSupplier(
  id: string, 
  data: Partial<ClientSupplierFormData>
): Promise<ClientSupplier> {
  try {
    console.log('📝 Updating client/supplier:', id);
    
    const { data: result, error } = await supabase
      .from('companies_clients_suppliers')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating client/supplier:', error);
      throw new Error(`Failed to update client/supplier: ${error.message}`);
    }
    
    console.log('✅ Client/supplier updated:', result.id);
    return result;
  } catch (error) {
    console.error('Erro ao atualizar cliente/fornecedor:', error);
    throw error;
  }
}

export async function deleteClientSupplier(id: string): Promise<boolean> {
  try {
    console.log('🗑️ Deleting client/supplier:', id);
    
    // Soft delete - marcar como inativo ao invés de deletar
    const { error } = await supabase
      .from('companies_clients_suppliers')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) {
      console.error('❌ Error deleting client/supplier:', error);
      throw new Error(`Failed to delete client/supplier: ${error.message}`);
    }
    
    console.log('✅ Client/supplier deleted:', id);
    return true;
  } catch (error) {
    console.error('Erro ao deletar cliente/fornecedor:', error);
    return false;
  }
}

export async function getClientSupplierById(id: string): Promise<ClientSupplier | null> {
  try {
    console.log('🔍 Fetching client/supplier by ID:', id);
    
    const { data, error } = await supabase
      .from('companies_clients_suppliers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('❌ Error fetching client/supplier by ID:', error);
      return null;
    }
    
    console.log('✅ Client/supplier found:', data.id);
    return data;
  } catch (error) {
    console.error('Erro ao buscar cliente/fornecedor por ID:', error);
    return null;
  }
}