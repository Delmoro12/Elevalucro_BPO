import { LeadListResponse, LeadFilters, LeadEditData, LeadUpdatePayload, LeadCreatePayload, LeadKanbanStage } from '../types/leads';

const API_BASE_URL = '/api';

export async function getLeads(filters?: LeadFilters): Promise<LeadListResponse> {
  try {
    const params = new URLSearchParams();
    
    // Sempre filtrar apenas leads
    params.append('status', 'lead');
    
    if (filters?.plan) params.append('plan', filters.plan);
    if (filters?.lead_source) params.append('lead_source', filters.lead_source);
    if (filters?.segment) params.append('segment', filters.segment);
    if (filters?.temperature) params.append('temperature', filters.temperature);
    if (filters?.assigned_salesperson_id) params.append('assigned_salesperson_id', filters.assigned_salesperson_id);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/prospects${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar leads: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      return {
        data: result.data || [],
        total: result.total || 0,
        page: 1,
        limit: 50,
      };
    } else {
      throw new Error(result.error || 'Erro ao buscar leads');
    }
  } catch (error) {
    console.error('Erro na API de leads:', error);
    throw error;
  }
}

export async function updateLeadKanbanStage(id: string, kanban_stage: LeadKanbanStage): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ kanban_stage }),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao atualizar estágio: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return result.success;
  } catch (error) {
    console.error('Erro ao atualizar estágio:', error);
    return false;
  }
}

export async function deleteLead(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao deletar lead: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao deletar lead');
    }
  } catch (error) {
    console.error('Erro ao deletar lead:', error);
    throw error;
  }
}

export async function getLeadById(id: string): Promise<LeadEditData> {
  try {
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar lead: ${response.statusText}`);
    }
    
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta:', parseError);
      const responseText = await response.text();
      console.error('Resposta recebida:', responseText.substring(0, 200));
      throw new Error('Resposta inválida do servidor (não é JSON)');
    }
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Erro ao buscar lead');
    }
  } catch (error) {
    console.error('Erro na API ao buscar lead:', error);
    throw error;
  }
}

export async function updateLead(id: string, data: LeadUpdatePayload): Promise<boolean> {
  try {
    // Limpar campos UUID vazios (converter string vazia para null)
    const cleanData = { ...data };
    
    // Campos que são UUIDs e devem ser null se estiverem vazios
    const uuidFields = ['assigned_salesperson_id'];
    
    uuidFields.forEach(field => {
      if (cleanData[field as keyof LeadUpdatePayload] === '' || cleanData[field as keyof LeadUpdatePayload] === undefined) {
        (cleanData as any)[field] = null;
      }
    });
    
    console.log('🔄 Enviando dados limpos para atualização:', cleanData);
    
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanData),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao atualizar lead: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return result.success;
  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
    return false;
  }
}

export async function createLead(data: LeadCreatePayload): Promise<boolean> {
  try {
    // Preparar dados garantindo que será criado como lead
    const leadData = {
      ...data,
      status: 'lead',
      kanban_stage: 'new', // Novo lead sempre começa no estágio "Oportunidades"
      temperature: data.temperature || 'cold', // Padrão para cold se não especificado
    };
    
    // Limpar campos UUID vazios (converter string vazia para null)
    const uuidFields = ['assigned_salesperson_id'];
    
    uuidFields.forEach(field => {
      if (leadData[field as keyof typeof leadData] === '' || leadData[field as keyof typeof leadData] === undefined) {
        (leadData as any)[field] = null;
      }
    });
    
    console.log('🔄 Enviando dados limpos para criação:', leadData);

    const response = await fetch(`${API_BASE_URL}/prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao criar lead: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return result.success;
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    return false;
  }
}

export async function convertLeadToProspect(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        status: 'prospect',
        kanban_stage: 'pending' // Reset para o primeiro estágio de prospects
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao converter lead: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return result.success;
  } catch (error) {
    console.error('Erro ao converter lead:', error);
    return false;
  }
}