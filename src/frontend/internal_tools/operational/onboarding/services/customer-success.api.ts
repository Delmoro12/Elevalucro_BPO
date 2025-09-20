import { 
  Client, 
  SupportTicket, 
  ClientListResponse, 
  TicketListResponse,
  CustomerSuccessFilters,
  TicketFilters,
  TicketUpdatePayload,
  ClientUpdatePayload 
} from '../types/customer-success';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Clientes
export async function getClients(filters: CustomerSuccessFilters = {}): Promise<ClientListResponse> {
  try {
    const params = new URLSearchParams();
    
    if (filters.health_status) params.append('health_status', filters.health_status);
    if (filters.plano) params.append('plano', filters.plano);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const response = await fetch(`${API_BASE_URL}/api/customer-success/clients?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    // Retornar dados mock para desenvolvimento
    return {
      data: [
        {
          id: '1',
          nome_empresa: 'Empresa Demo 1',
          nome_contato: 'João Silva',
          email_contato: 'joao@empresa1.com',
          telefone_contato: '(11) 99999-1111',
          plano: 'gerencial',
          valor_mensal: 1300,
          data_assinatura: '2024-01-15',
          status: 'ativo',
          health_status: 'healthy',
          ultimo_login: '2024-01-20T10:30:00Z',
          created_at: '2024-01-15T08:00:00Z',
          updated_at: '2024-01-20T10:30:00Z',
        },
        {
          id: '2',
          nome_empresa: 'Empresa Demo 2',
          nome_contato: 'Maria Santos',
          email_contato: 'maria@empresa2.com',
          plano: 'avancado',
          valor_mensal: 1700,
          data_assinatura: '2023-12-10',
          status: 'ativo',
          health_status: 'at_risk',
          ultimo_login: '2024-01-18T15:45:00Z',
          created_at: '2023-12-10T09:00:00Z',
          updated_at: '2024-01-18T15:45:00Z',
        }
      ],
      total: 2,
      page: 1,
      limit: 50
    };
  }
}

export async function updateClientHealth(clientId: string, data: ClientUpdatePayload): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/customer-success/clients/${clientId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao atualizar saúde do cliente:', error);
    return false;
  }
}

// Tickets de Suporte
export async function getTickets(filters: TicketFilters = {}): Promise<TicketListResponse> {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.prioridade) params.append('prioridade', filters.prioridade);
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.assignee) params.append('assignee', filters.assignee);
    if (filters.search) params.append('search', filters.search);

    const response = await fetch(`${API_BASE_URL}/api/customer-success/tickets?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    // Retornar dados mock para desenvolvimento
    return {
      data: [
        {
          id: '1',
          client_id: '1',
          titulo: 'Problema no relatório DRE',
          descricao: 'O relatório DRE não está carregando os dados do último mês',
          categoria: 'tecnico',
          prioridade: 'high',
          status: 'open',
          assignee: 'Suporte Técnico',
          created_at: '2024-01-20T09:30:00Z',
          updated_at: '2024-01-20T09:30:00Z',
          cliente_nome: 'Empresa Demo 1',
          cliente_email: 'joao@empresa1.com',
          cliente_plano: 'gerencial'
        },
        {
          id: '2',
          client_id: '2',
          titulo: 'Dúvida sobre funcionalidade',
          descricao: 'Como configurar os indicadores personalizados?',
          categoria: 'treinamento',
          prioridade: 'medium',
          status: 'in_progress',
          assignee: 'Customer Success',
          created_at: '2024-01-19T14:20:00Z',
          updated_at: '2024-01-20T08:15:00Z',
          cliente_nome: 'Empresa Demo 2',
          cliente_email: 'maria@empresa2.com',
          cliente_plano: 'avancado'
        }
      ],
      total: 2,
      page: 1,
      limit: 50
    };
  }
}

export async function updateTicket(ticketId: string, data: TicketUpdatePayload): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/customer-success/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao atualizar ticket:', error);
    return false;
  }
}

export async function deleteTicket(ticketId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/customer-success/tickets/${ticketId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao deletar ticket:', error);
    return false;
  }
}