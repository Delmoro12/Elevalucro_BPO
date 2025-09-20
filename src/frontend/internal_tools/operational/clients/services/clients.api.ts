import { 
  OperationalClient, 
  ClientListResponse, 
  ClientFilters,
  ClientUpdatePayload,
  ClientPlan 
} from '../types/clients';
import { supabase } from '@/src/lib/supabase';

export interface CompanyWithAdmin {
  id: string;
  name: string;
  cnpj?: string;
  cnpj_raw?: string;
  phone?: string;
  email?: string;
  website?: string;
  segment?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zipcode?: string;
  subscription_plan: string;
  subscription_status: string;
  lifecycle_stage: string;
  onboarding_progress: number;
  created_at: string;
  admin_user?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    whatsapp?: string;
  };
  bpo_operator?: {
    id: string;
    full_name: string;
    email: string;
  };
  analyst_bpo?: {
    id: string;
    full_name: string;
    email: string;
  };
}

// Buscar clientes operacionais da tabela companies
export async function getOperationalClients(filters: ClientFilters = {}): Promise<ClientListResponse> {
  try {
    console.log('🏢 Fetching operational clients from companies table...');
    
    // Construir query base
    let query = supabase
      .from('companies')
      .select('*');
    
    // Aplicar filtros
    if (filters.status) {
      // Mapear status para is_active
      const isActive = filters.status === 'ativo';
      query = query.eq('is_active', isActive);
    }
    
    if (filters.search) {
      // Buscar por nome da empresa, email ou CNPJ
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,cnpj.ilike.%${filters.search}%`);
    }
    
    // Ordenar por data de criação mais recente
    query = query.order('created_at', { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('❌ Error fetching operational clients:', error);
      throw new Error(`Failed to fetch operational clients: ${error.message}`);
    }
    
    console.log('✅ Operational clients fetched:', data?.length || 0);
    
    // Mapear dados de companies para o formato OperationalClient
    const clients: OperationalClient[] = (data || []).map(company => ({
      id: company.id,
      company_id: company.id,
      nome_empresa: company.name,
      nome_contato: '', // Não temos na tabela companies
      email_contato: company.email || '',
      telefone_contato: company.phone || '',
      cpf_contato: '', // Não aplicável para companies
      cnpj: company.cnpj || '',
      plano: 'controle' as ClientPlan, // Valor padrão, pode ser ajustado
      valor_mensal: 0, // Não temos na tabela companies
      status: company.is_active ? 'ativo' : 'inativo',
      data_inicio: company.created_at ? new Date(company.created_at).toISOString().split('T')[0] : '',
      created_at: company.created_at,
      updated_at: company.updated_at,
      responsavel_operacional: '', // Campo operacional, não está na tabela
      ultimo_contato: company.updated_at,
      proxima_acao: '', // Campo operacional, não está na tabela
      tags: [], // Pode ser expandido futuramente
    }));
    
    return {
      data: clients,
      total: count || clients.length,
      page: 1,
      limit: 50
    };
  } catch (error) {
    console.error('Erro ao buscar clientes operacionais:', error);
    throw error;
  }
}

// Buscar company com dados do admin
export const getCompanyWithAdmin = async (companyId: string): Promise<CompanyWithAdmin | null> => {
  try {
    // Buscar dados da company com operadores BPO
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        *,
        bpo_operator:bpo_operator_id(
          id,
          full_name,
          email
        ),
        analyst_bpo:analyst_bpo_id(
          id,
          full_name,
          email
        )
      `)
      .eq('id', companyId)
      .single();

    if (companyError) {
      console.error('Error fetching company:', companyError);
      return null;
    }

    // Buscar o usuário admin da company
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        phone,
        whatsapp,
        role_id,
        roles:role_id(name)
      `)
      .eq('company_id', companyId);

    if (adminError) {
      console.error('Error fetching admin user:', adminError);
    }

    // Encontrar o admin (assumindo que tem role client_admin)
    const adminUser = adminUsers?.find(user => 
      user.roles?.name === 'client_admin' || 
      user.roles?.name === 'client_user'
    ) || adminUsers?.[0];

    return {
      ...company,
      admin_user: adminUser ? {
        id: adminUser.id,
        full_name: adminUser.full_name,
        email: adminUser.email,
        phone: adminUser.phone,
        whatsapp: adminUser.whatsapp
      } : undefined
    };
  } catch (error) {
    console.error('Error in getCompanyWithAdmin:', error);
    return null;
  }
};

// Buscar cliente operacional com dados reais
export const getOperationalClientById = async (companyId: string): Promise<OperationalClient | null> => {
  try {
    const companyData = await getCompanyWithAdmin(companyId);
    
    if (!companyData) {
      return null;
    }

    // Mapear para o formato OperationalClient
    return {
      id: companyData.id,
      company_id: companyData.id,
      nome_empresa: companyData.name,
      nome_contato: companyData.admin_user?.full_name || 'Não informado',
      email_contato: companyData.admin_user?.email || companyData.email || 'Não informado',
      telefone_contato: companyData.admin_user?.phone || companyData.phone,
      cpf_contato: undefined,
      cnpj: companyData.cnpj,
      plano: (companyData.subscription_plan || 'controle') as ClientPlan,
      valor_mensal: getPlanPrice(companyData.subscription_plan),
      status: mapSubscriptionStatusToClientStatus(companyData.subscription_status),
      data_inicio: companyData.created_at,
      created_at: companyData.created_at,
      updated_at: companyData.created_at,
      responsavel_operacional: companyData.bpo_operator?.full_name,
      ultimo_contato: undefined,
      proxima_acao: undefined,
      tags: []
    };
  } catch (error) {
    console.error('Error in getOperationalClientById:', error);
    return null;
  }
};

const getPlanPrice = (plan: string): number => {
  const prices: Record<string, number> = {
    controle: 1200,
    gerencial: 1500,
    avancado: 1900
  };
  return prices[plan] || 1200;
};

const mapSubscriptionStatusToClientStatus = (status: string): 'ativo' | 'suspenso' | 'cancelado' | 'pendente' => {
  const statusMap: Record<string, 'ativo' | 'suspenso' | 'cancelado' | 'pendente'> = {
    active: 'ativo',
    suspended: 'suspenso',
    cancelled: 'cancelado'
  };
  return statusMap[status] || 'pendente';
};

export async function updateOperationalClient(clientId: string, data: ClientUpdatePayload): Promise<boolean> {
  try {
    // Atualizar diretamente no Supabase
    const { error } = await supabase
      .from('companies')
      .update({
        name: data.nome_empresa,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);

    return !error;
  } catch (error) {
    console.error('Erro ao atualizar cliente operacional:', error);
    return false;
  }
}

export async function deleteOperationalClient(clientId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('companies')
      .update({ is_active: false })
      .eq('id', clientId);

    return !error;
  } catch (error) {
    console.error('Erro ao deletar cliente operacional:', error);
    return false;
  }
}