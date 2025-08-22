'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle, User, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  message: string;
  timestamp: Date;
}

interface AIChatProps {
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
  onComplete: () => void;
  ocrData: any;
}

export const AIChat: React.FC<AIChatProps> = ({ 
  messages, 
  onMessagesChange, 
  onComplete, 
  ocrData 
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [missingData, setMissingData] = useState<string[]>(['forma_pagamento', 'centro_custo']);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Detecta forma de pagamento
    if (message.includes('pix') || message.includes('à vista') || message.includes('parcelado') || 
        message.includes('cartão') || message.includes('dinheiro') || message.includes('boleto')) {
      
      if (missingData.includes('centro_custo')) {
        setMissingData(['centro_custo']);
        return `✅ Perfeito! Forma de pagamento registrada.

Agora preciso saber o **centro de custo** para este lançamento:

🏢 **Opções comuns:**
• Administrativo
• Operacional  
• Marketing
• Vendas
• Financeiro

Qual centro de custo devo usar?`;
      } else {
        return 'Ótimo! Todos os dados foram coletados. Vou finalizar o documento.';
      }
    }
    
    // Detecta centro de custo
    if (message.includes('administrativo') || message.includes('operacional') || 
        message.includes('marketing') || message.includes('vendas') || message.includes('financeiro')) {
      
      if (missingData.includes('forma_pagamento')) {
        setMissingData(['forma_pagamento']);
        return `✅ Centro de custo registrado!

Agora preciso saber a **forma de pagamento**:

💳 **Opções:**
• À vista
• PIX
• Cartão de crédito
• Cartão de débito
• Parcelado
• Boleto

Como foi realizado o pagamento?`;
      } else {
        setMissingData([]);
        return `🎉 **Excelente!** Todos os dados foram coletados com sucesso!

📋 **Resumo do documento:**
• Valor: ${ocrData?.valor}
• Data: ${ocrData?.data}
• Fornecedor: ${ocrData?.fornecedor}
• Forma de pagamento: Registrada
• Centro de custo: Registrado

Agora você pode finalizar o documento! ✅`;
      }
    }

    // Resposta padrão
    return `Entendi! Preciso que você seja mais específico sobre:

${missingData.includes('forma_pagamento') ? '💳 **Forma de pagamento**: PIX, cartão, à vista, etc.\n' : ''}${missingData.includes('centro_custo') ? '🏢 **Centro de custo**: Administrativo, operacional, etc.\n' : ''}

Pode me informar esses dados?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    onMessagesChange([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simula delay de resposta da IA
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: aiResponse,
        timestamp: new Date()
      };

      onMessagesChange([...messages, userMessage, aiMessage]);
      setIsTyping(false);

      // Se completou todos os dados, finaliza após 2 segundos
      if (missingData.length === 0 && aiResponse.includes('finalizar o documento')) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (message: string) => {
    return message.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < message.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[90%] sm:max-w-[80%] ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-emerald-100 dark:bg-emerald-900/50' 
                  : message.type === 'ai'
                  ? 'bg-blue-100 dark:bg-blue-900/50'
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}>
                {message.type === 'user' ? (
                  <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : message.type === 'ai' ? (
                  <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`rounded-lg px-3 sm:px-4 py-2 ${
                message.type === 'user'
                  ? 'bg-emerald-600 text-white'
                  : message.type === 'ai'
                  ? 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <div className="text-sm whitespace-pre-wrap">
                  {formatMessage(message.message)}
                </div>
                <div className={`text-xs mt-1 ${
                  message.type === 'user' 
                    ? 'text-emerald-100' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 dark:bg-blue-900/50">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-3 sm:p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua resposta..."
            rows={2}
            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white resize-none text-sm sm:text-base"
            disabled={isTyping || missingData.length === 0}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping || missingData.length === 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        
        {missingData.length === 0 && (
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Todos os dados coletados! Aguarde...
          </div>
        )}
      </div>
    </div>
  );
};