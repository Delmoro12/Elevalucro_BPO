'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video,
  MoreVertical,
  Search,
  Filter,
  Circle,
  CheckCircle,
  CheckCircle2
} from 'lucide-react';
import { useSupportChat } from '../hooks/useSupportChat';
import { SupportChat, ChatMessage } from '../types/support-chat';

export const SupportChatPage: React.FC = () => {
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    chats,
    chatsLoading,
    activeChat,
    setActiveChat,
    messages,
    messagesLoading,
    sendChatMessage,
    metrics
  } = useSupportChat();

  // Scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filtrar chats por busca
  const filteredChats = chats.filter(chat => 
    chat.contact?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.contact?.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChat) return;

    const success = await sendChatMessage({
      content: messageInput.trim(),
      type: 'text'
    });

    if (success) {
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-3 h-3 text-slate-400" />;
      case 'delivered':
        return <CheckCircle2 className="w-3 h-3 text-slate-400" />;
      case 'read':
        return <CheckCircle2 className="w-3 h-3 text-blue-500" />;
      default:
        return <Circle className="w-3 h-3 text-slate-300" />;
    }
  };

  const getOnlineStatus = (contact: any) => {
    if (contact?.is_online) {
      return (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Sidebar de Chats */}
      <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Atendimento
            </h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" />
              <MoreVertical className="w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" />
            </div>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Métricas Rápidas */}
          {metrics && (
            <div className="flex gap-3 mt-3 text-xs">
              <div className="text-emerald-600 font-medium">
                {metrics.active_chats} ativos
              </div>
              <div className="text-amber-600 font-medium">
                {metrics.waiting_chats} aguardando
              </div>
              <div className="text-slate-500">
                {metrics.contacts_online} online
              </div>
            </div>
          )}
        </div>

        {/* Lista de Chats */}
        <div className="flex-1 overflow-y-auto">
          {chatsLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Carregando conversas...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-4 text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-slate-400 mb-2" />
              <p className="text-slate-600 dark:text-slate-400">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`
                  p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors
                  ${activeChat?.id === chat.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-r-2 border-r-emerald-500' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      {chat.contact?.name.charAt(0).toUpperCase()}
                    </div>
                    {getOnlineStatus(chat.contact)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-slate-900 dark:text-white truncate">
                        {chat.contact?.name}
                      </h4>
                      <div className="flex items-center gap-1">
                        {chat.last_message && (
                          <span className="text-xs text-slate-500">
                            {formatTime(chat.last_message.timestamp)}
                          </span>
                        )}
                        {chat.unread_count > 0 && (
                          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {chat.unread_count}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Fonte do contato */}
                      <div className={`
                        px-1.5 py-0.5 rounded text-xs font-medium
                        ${chat.contact?.source === 'whatsapp' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${chat.contact?.source === 'website' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        ${chat.contact?.source === 'email' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                        ${chat.contact?.source === 'phone' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                      `}>
                        {chat.contact?.source === 'whatsapp' && 'WhatsApp'}
                        {chat.contact?.source === 'website' && 'Site'}
                        {chat.contact?.source === 'email' && 'Email'}
                        {chat.contact?.source === 'phone' && 'Telefone'}
                      </div>

                      {/* Prioridade */}
                      <div className={`
                        w-2 h-2 rounded-full
                        ${chat.priority === 'urgent' ? 'bg-red-500' : ''}
                        ${chat.priority === 'high' ? 'bg-orange-500' : ''}
                        ${chat.priority === 'medium' ? 'bg-yellow-500' : ''}
                        ${chat.priority === 'low' ? 'bg-green-500' : ''}
                      `} />
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1">
                      {chat.last_message?.content || 'Sem mensagens'}
                    </p>
                    
                    {chat.contact?.company && (
                      <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
                        {chat.contact.company}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Header do Chat */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      {activeChat.contact?.name.charAt(0).toUpperCase()}
                    </div>
                    {getOnlineStatus(activeChat.contact)}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      {activeChat.contact?.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeChat.contact?.is_online ? 'Online' : activeChat.contact?.last_seen ? 
                        `Visto por último ${new Date(activeChat.contact.last_seen).toLocaleString('pt-BR')}` : 
                        'Offline'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-25 dark:bg-slate-900/50">
              {messagesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Carregando mensagens...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.is_from_contact ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`
                          max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                          ${message.is_from_contact 
                            ? 'bg-white dark:bg-slate-800 shadow-sm' 
                            : 'bg-emerald-500 text-white'
                          }
                        `}
                      >
                        <p className={`text-sm ${message.is_from_contact ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
                          {message.content}
                        </p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${message.is_from_contact ? 'text-slate-500' : 'text-emerald-100'}`}>
                          <span className="text-xs">
                            {formatTime(message.timestamp)}
                          </span>
                          {!message.is_from_contact && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input de Mensagem */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="w-full p-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                  <button className="absolute right-2 top-2 p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50">
            <div className="text-center">
              <MessageCircle className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Escolha uma conversa da lista para começar o atendimento
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};