import { ProspectListResponse, ProspectFilters, ProspectEditData, ProspectUpdatePayload } from '../types/prospects';

const API_BASE_URL = '/api';

export async function getProspects(filters?: ProspectFilters): Promise<ProspectListResponse> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.plano) params.append('plano', filters.plano);
    if (filters?.origem) params.append('origem', filters.origem);
    if (filters?.segmento) params.append('segmento', filters.segmento);
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
      throw new Error(`Erro ao buscar prospects: ${response.statusText}`);
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
      throw new Error(result.error || 'Erro ao buscar prospects');
    }
  } catch (error) {
    console.error('Erro na API de prospects:', error);
    throw error;
  }
}

export async function updateProspectStatus(id: string, status: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao atualizar status: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return result.success;
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return false;
  }
}

export async function deleteProspect(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao deletar prospect: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao deletar prospect');
    }
  } catch (error) {
    console.error('Erro ao deletar prospect:', error);
    throw error;
  }
}

export async function getProspectById(id: string): Promise<ProspectEditData> {
  try {
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar prospect: ${response.statusText}`);
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
      throw new Error(result.error || 'Erro ao buscar prospect');
    }
  } catch (error) {
    console.error('Erro na API ao buscar prospect:', error);
    throw error;
  }
}

export async function updateProspect(id: string, data: ProspectUpdatePayload): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao atualizar prospect: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return result.success;
  } catch (error) {
    console.error('Erro ao atualizar prospect:', error);
    return false;
  }
}