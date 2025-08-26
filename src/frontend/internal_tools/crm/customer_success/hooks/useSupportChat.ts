import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SupportChat,
  ChatMessage,
  ChatFilters,
  SendMessagePayload,
  UpdateChatPayload,
  SupportMetrics
} from '../types/support-chat';
import {
  getChats,
  getChatMessages,
  sendMessage,
  updateChat,
  getSupportMetrics,
  SupportChatWebSocket
} from '../services/support-chat.api';

export interface UseSupportChatReturn {
  // Chats
  chats: SupportChat[];
  chatsLoading: boolean;
  chatsError: string | null;
  chatFilters: ChatFilters;
  updateChatFilters: (filters: Partial<ChatFilters>) => void;
  refreshChats: () => Promise<void>;
  
  // Chat ativo
  activeChat: SupportChat | null;
  setActiveChat: (chat: SupportChat | null) => void;
  updateChatData: (chatId: string, data: UpdateChatPayload) => Promise<boolean>;
  
  // Mensagens
  messages: ChatMessage[];
  messagesLoading: boolean;
  messagesError: string | null;
  sendChatMessage: (message: SendMessagePayload) => Promise<boolean>;
  loadMessages: (chatId: string) => Promise<void>;
  
  // Métricas
  metrics: SupportMetrics | null;
  metricsLoading: boolean;
  refreshMetrics: () => Promise<void>;
  
  // WebSocket/Tempo real
  isConnected: boolean;
  unreadCount: number;
}

export function useSupportChat(): UseSupportChatReturn {
  // Estados dos chats
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [chatFilters, setChatFilters] = useState<ChatFilters>({});

  // Chat ativo
  const [activeChat, setActiveChat] = useState<SupportChat | null>(null);

  // Estados das mensagens
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // Métricas
  const [metrics, setMetrics] = useState<SupportMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // WebSocket
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef<SupportChatWebSocket | null>(null);

  // Carregar chats
  const loadChats = useCallback(async () => {
    try {
      setChatsLoading(true);
      setChatsError(null);
      
      const response = await getChats(chatFilters);
      setChats(response.data);
      
      // Calcular contagem de não lidas
      const totalUnread = response.data.reduce((sum, chat) => sum + chat.unread_count, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
      setChatsError('Erro ao carregar chats');
    } finally {
      setChatsLoading(false);
    }
  }, [chatFilters]);

  // Carregar mensagens
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      setMessagesLoading(true);
      setMessagesError(null);
      
      const response = await getChatMessages(chatId);
      setMessages(response.data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      setMessagesError('Erro ao carregar mensagens');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Carregar métricas
  const loadMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      const metricsData = await getSupportMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Carregar mensagens quando chat ativo muda
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
    }
  }, [activeChat, loadMessages]);

  // WebSocket para tempo real
  useEffect(() => {
    // Conectar WebSocket (temporariamente desabilitado para desenvolvimento)
    // wsRef.current = new SupportChatWebSocket();
    // wsRef.current.connect(
    //   (data) => {
    //     // Processar eventos em tempo real
    //     handleWebSocketMessage(data);
    //   },
    //   (error) => {
    //     console.error('WebSocket error:', error);
    //     setIsConnected(false);
    //   }
    // );

    // setIsConnected(true);

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, []);

  // Funções para atualizar filtros
  const updateChatFilters = useCallback((filters: Partial<ChatFilters>) => {
    setChatFilters(prev => ({ ...prev, ...filters }));
  }, []);

  // Função para enviar mensagem
  const sendChatMessage = useCallback(async (messageData: SendMessagePayload): Promise<boolean> => {
    if (!activeChat) {
      console.error('Nenhum chat ativo para enviar mensagem');
      return false;
    }

    try {
      const newMessage = await sendMessage(activeChat.id, messageData);
      
      if (newMessage) {
        // Adicionar mensagem localmente
        setMessages(prev => [...prev, newMessage]);
        
        // Atualizar última mensagem do chat
        setChats(prev => prev.map(chat => 
          chat.id === activeChat.id
            ? { ...chat, last_message: newMessage, updated_at: new Date().toISOString() }
            : chat
        ));
        
        console.log('✅ Mensagem enviada com sucesso');
        return true;
      } else {
        console.error('❌ Falha ao enviar mensagem');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  }, [activeChat]);

  // Função para atualizar dados do chat
  const updateChatData = useCallback(async (chatId: string, data: UpdateChatPayload): Promise<boolean> => {
    try {
      const success = await updateChat(chatId, data);
      
      if (success) {
        // Atualizar o chat local
        setChats(prev => prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, ...data, updated_at: new Date().toISOString() }
            : chat
        ));
        
        // Atualizar chat ativo se for o mesmo
        if (activeChat?.id === chatId) {
          setActiveChat(prev => prev ? { ...prev, ...data } : null);
        }
        
        console.log('✅ Chat atualizado com sucesso');
        return true;
      } else {
        console.error('❌ Falha ao atualizar chat');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar chat:', error);
      return false;
    }
  }, [activeChat]);

  // Funções para refresh
  const refreshChats = useCallback(async () => {
    await loadChats();
  }, [loadChats]);

  const refreshMetrics = useCallback(async () => {
    await loadMetrics();
  }, [loadMetrics]);

  return {
    // Chats
    chats,
    chatsLoading,
    chatsError,
    chatFilters,
    updateChatFilters,
    refreshChats,
    
    // Chat ativo
    activeChat,
    setActiveChat,
    updateChatData,
    
    // Mensagens
    messages,
    messagesLoading,
    messagesError,
    sendChatMessage,
    loadMessages,
    
    // Métricas
    metrics,
    metricsLoading,
    refreshMetrics,
    
    // WebSocket/Tempo real
    isConnected,
    unreadCount,
  };
}