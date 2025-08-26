import {
  SupportChat,
  ChatContact,
  ChatMessage,
  ChatListResponse,
  MessageListResponse,
  ChatFilters,
  SendMessagePayload,
  UpdateChatPayload,
  CreateContactPayload,
  SupportMetrics
} from '../types/support-chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Chats
export async function getChats(filters: ChatFilters = {}): Promise<ChatListResponse> {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.source) params.append('source', filters.source);
    if (filters.search) params.append('search', filters.search);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    const response = await fetch(`${API_BASE_URL}/api/support/chats?${params.toString()}`, {
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
    console.error('Erro ao buscar chats:', error);
    // Retornar dados mock para desenvolvimento
    return {
      data: [
        {
          id: '1',
          contact_id: '1',
          subject: 'Dúvida sobre relatório DRE',
          status: 'active',
          assigned_to: 'user1',
          assigned_to_name: 'Ana Silva',
          priority: 'high',
          tags: ['dre', 'relatorio'],
          unread_count: 3,
          created_at: '2024-01-20T10:30:00Z',
          updated_at: '2024-01-20T14:45:00Z',
          contact: {
            id: '1',
            name: 'João Santos',
            phone: '+5511999999999',
            email: 'joao@empresa.com',
            source: 'whatsapp',
            company: 'Empresa ABC',
            is_online: true,
            created_at: '2024-01-15T08:00:00Z'
          },
          last_message: {
            id: 'msg1',
            chat_id: '1',
            content: 'Preciso de ajuda com o relatório DRE, não está aparecendo os dados do mês atual',
            type: 'text',
            is_from_contact: true,
            timestamp: '2024-01-20T14:45:00Z',
            status: 'delivered'
          }
        },
        {
          id: '2',
          contact_id: '2',
          subject: 'Problema no sistema',
          status: 'waiting',
          priority: 'medium',
          tags: ['sistema', 'login'],
          unread_count: 1,
          created_at: '2024-01-20T09:15:00Z',
          updated_at: '2024-01-20T13:20:00Z',
          contact: {
            id: '2',
            name: 'Maria Oliveira',
            phone: '+5511888888888',
            source: 'website',
            company: 'Empresa XYZ',
            is_online: false,
            last_seen: '2024-01-20T12:00:00Z',
            created_at: '2024-01-18T14:30:00Z'
          },
          last_message: {
            id: 'msg2',
            chat_id: '2',
            content: 'Obrigada pelo retorno, vou aguardar.',
            type: 'text',
            is_from_contact: true,
            timestamp: '2024-01-20T13:20:00Z',
            status: 'read'
          }
        }
      ],
      total: 2,
      page: 1,
      limit: 50
    };
  }
}

export async function getChatMessages(chatId: string, page: number = 1): Promise<MessageListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/support/chats/${chatId}/messages?page=${page}`, {
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
    console.error('Erro ao buscar mensagens:', error);
    // Retornar dados mock para desenvolvimento
    return {
      data: [
        {
          id: 'msg1',
          chat_id: chatId,
          content: 'Olá! Como posso ajudá-lo hoje?',
          type: 'text',
          is_from_contact: false,
          sender_name: 'Ana Silva',
          timestamp: '2024-01-20T10:30:00Z',
          status: 'read'
        },
        {
          id: 'msg2',
          chat_id: chatId,
          content: 'Preciso de ajuda com o relatório DRE, não está aparecendo os dados do mês atual',
          type: 'text',
          is_from_contact: true,
          timestamp: '2024-01-20T14:45:00Z',
          status: 'delivered'
        }
      ],
      total: 2,
      page: 1,
      limit: 50
    };
  }
}

export async function sendMessage(chatId: string, message: SendMessagePayload): Promise<ChatMessage | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/support/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return null;
  }
}

export async function updateChat(chatId: string, data: UpdateChatPayload): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/support/chats/${chatId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao atualizar chat:', error);
    return false;
  }
}

export async function createContact(data: CreateContactPayload): Promise<ChatContact | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/support/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar contato:', error);
    return null;
  }
}

export async function getSupportMetrics(): Promise<SupportMetrics> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/support/metrics`, {
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
    console.error('Erro ao buscar métricas:', error);
    // Retornar dados mock para desenvolvimento
    return {
      total_chats: 45,
      active_chats: 12,
      waiting_chats: 5,
      avg_response_time: 3.5, // minutos
      avg_resolution_time: 25, // minutos
      satisfaction_score: 4.2,
      messages_today: 127,
      contacts_online: 8
    };
  }
}

// WebSocket para tempo real (implementação futura)
export class SupportChatWebSocket {
  private ws: WebSocket | null = null;
  private url: string;

  constructor(url: string = 'ws://localhost:3001/ws/support') {
    this.url = url;
  }

  connect(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        // Reconectar automaticamente após 5 segundos
        setTimeout(() => this.connect(onMessage, onError), 5000);
      };
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}