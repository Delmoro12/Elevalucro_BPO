// Tipos para sistema de atendimento/chat
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type ChatStatus = 'active' | 'waiting' | 'closed';
export type ContactSource = 'whatsapp' | 'website' | 'email' | 'phone';

export interface ChatContact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  source: ContactSource;
  client_id?: string; // Se for um cliente existente
  company?: string;
  last_seen?: string;
  is_online: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  content: string;
  type: MessageType;
  is_from_contact: boolean; // true = mensagem do contato, false = mensagem do atendente
  sender_name?: string;
  timestamp: string;
  status: MessageStatus;
  metadata?: {
    file_url?: string;
    file_name?: string;
    file_size?: number;
    thumbnail_url?: string;
    duration?: number; // para áudio/vídeo
  };
}

export interface SupportChat {
  id: string;
  contact_id: string;
  subject?: string;
  status: ChatStatus;
  assigned_to?: string; // ID do atendente
  assigned_to_name?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  last_message?: ChatMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  
  // Dados do contato (para exibição)
  contact?: ChatContact;
}

export interface ChatFilters {
  status?: ChatStatus;
  assigned_to?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  source?: ContactSource;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface ChatListResponse {
  data: SupportChat[];
  total: number;
  page: number;
  limit: number;
}

export interface MessageListResponse {
  data: ChatMessage[];
  total: number;
  page: number;
  limit: number;
}

// Tipos para ações
export interface SendMessagePayload {
  content: string;
  type: MessageType;
  metadata?: {
    file_url?: string;
    file_name?: string;
    file_size?: number;
  };
}

export interface UpdateChatPayload {
  status?: ChatStatus;
  assigned_to?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  subject?: string;
}

export interface CreateContactPayload {
  name: string;
  phone?: string;
  email?: string;
  source: ContactSource;
  company?: string;
}

// Tipos para eventos em tempo real (WebSocket)
export interface ChatEvent {
  type: 'new_message' | 'message_status_update' | 'chat_assigned' | 'contact_typing' | 'contact_online_status';
  chat_id?: string;
  contact_id?: string;
  data: any;
  timestamp: string;
}

// Tipos para métricas de atendimento
export interface SupportMetrics {
  total_chats: number;
  active_chats: number;
  waiting_chats: number;
  avg_response_time: number; // em minutos
  avg_resolution_time: number; // em minutos
  satisfaction_score: number; // 1-5
  messages_today: number;
  contacts_online: number;
}