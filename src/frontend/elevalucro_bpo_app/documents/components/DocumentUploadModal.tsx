'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Bot, Send, AlertCircle, CheckSquare, ArrowLeft } from 'lucide-react';
import { AIChat } from './AIChat';
import { claudeService, DocumentData } from '../services/claudeService';
import { useDocumentsService } from '../services/documentsService';
import { documentDataToCreateRequest } from '../types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DocumentInfo {
  file: File | null;
  categoria: 'entrada' | 'saida' | '';
  tipoFiscal: 'fiscal' | 'nao_fiscal' | '';
  descricao: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  message: string;
  timestamp: Date;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ isOpen, onClose }) => {
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo>({
    file: null,
    categoria: '',
    tipoFiscal: '',
    descricao: ''
  });
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrData, setOcrData] = useState<DocumentData | null>(null);
  const [finalData, setFinalData] = useState<DocumentData | null>(null);
  const [error, setError] = useState<string>('');
  const [isDataComplete, setIsDataComplete] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentsService = useDocumentsService();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentInfo(prev => ({ ...prev, file }));
    }
  };

  const validateFile = (file: File): boolean => {
    // Validação de tipo (GPT-5 Mini aceita imagens e PDFs)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Use JPG, PNG ou PDF.');
      return false;
    }

    // Validação de tamanho (20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Máximo 20MB.');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!documentInfo.file || !documentInfo.categoria || !documentInfo.tipoFiscal) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    if (!validateFile(documentInfo.file)) {
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Verifica se a API key está configurada
      if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
        throw new Error('API Key da Anthropic não configurada. Configure NEXT_PUBLIC_ANTHROPIC_API_KEY no .env.local');
      }

      // Processa documento com Claude
      const ocrResult = await claudeService.processDocument(documentInfo.file);
      setOcrData(ocrResult);

      // Inicia chat se dados incompletos
      if (ocrResult.camposFaltantes.length > 0) {
        setShowChat(true);
        
        const dadosExtraidos = [
          ocrResult.valor && `• Valor: ${ocrResult.valor}`,
          ocrResult.data && `• Data: ${ocrResult.data}`,
          ocrResult.fornecedor && `• Fornecedor: ${ocrResult.fornecedor}`,
          ocrResult.cliente && `• Cliente: ${ocrResult.cliente}`,
          ocrResult.cnpj && `• CNPJ: ${ocrResult.cnpj}`,
          ocrResult.numeroNota && `• Nota: ${ocrResult.numeroNota}`
        ].filter(Boolean).join('\n');

        const camposFaltantes = ocrResult.camposFaltantes
          .map(campo => {
            switch (campo) {
              case 'valor': return '• Valor do documento';
              case 'data': return '• Data da transação';
              case 'fornecedor_cliente': return '• Nome do fornecedor/cliente';
              case 'forma_pagamento': return '• Forma de pagamento (PIX, cartão, etc.)';
              case 'centro_custo': return '• Centro de custo (Administrativo, Operacional, etc.)';
              default: return `• ${campo}`;
            }
          })
          .join('\n');

        setChatMessages([
          {
            id: '1',
            type: 'system',
            message: `Documento processado com ${ocrResult.confianca}% de confiança! ✅`,
            timestamp: new Date()
          },
          {
            id: '2',
            type: 'ai',
            message: `Olá! Analisei seu documento ${ocrResult.tipo.toUpperCase()} e extraí as seguintes informações:

📄 **Dados encontrados:**
${dadosExtraidos || 'Nenhum dado foi extraído automaticamente'}

❓ **Preciso das seguintes informações para completar:**
${camposFaltantes}

Por favor, me informe esses dados para que eu possa finalizar o processamento do documento.`,
            timestamp: new Date()
          }
        ]);
      } else {
        // Se dados completos, salva diretamente
        handleSaveDocument();
      }

    } catch (error: any) {
      console.error('Erro ao processar documento:', error);
      setError(error.message || 'Erro ao processar documento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChatComplete = () => {
    // Quando o chat coleta todos os dados, esconde o chat e mostra botão de salvar
    setIsDataComplete(true);
  };

  const handleDataComplete = (completedData: DocumentData) => {
    console.log('✅ Dados completos recebidos do chat:', completedData);
    setFinalData(completedData);
    setShowSaveButton(true);
  };

  const handleSaveDocument = async () => {
    if (!finalData || !documentInfo.file) {
      setError('Dados do documento não encontrados.');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('💾 Salvando documento no banco:', documentInfo.file.name);
      
      // Converte DocumentData para CreateDocumentRequest
      const createRequest = documentDataToCreateRequest(
        finalData,
        documentInfo,
        documentInfo.file.name,
        documentInfo.file.size
      );
      
      // Salva no banco de dados
      const savedDocument = await documentsService.createDocument(createRequest);
      
      console.log('✅ Documento salvo com sucesso:', savedDocument.id);
      
      // Mensagem de sucesso
      // Removido alert de debug
      console.log(`Documento "${savedDocument.nome}" salvo com sucesso! ✅`);
      
      // Reset form
      setDocumentInfo({
        file: null,
        categoria: '',
        tipoFiscal: '',
        descricao: ''
      });
      setOcrData(null);
      setShowChat(false);
      setChatMessages([]);
      setIsDataComplete(false);
      setError('');
      
      // Fecha modal
      onClose();
      
    } catch (error: any) {
      console.error('❌ Erro ao salvar documento:', error);
      setError(error.message || 'Erro ao salvar documento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl min-h-0 max-h-none sm:max-h-[90vh] my-4 sm:my-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg mr-3">
              <Upload className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              Adicionar Documento
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row min-h-0 max-h-none sm:h-[calc(90vh-120px)]">
          {/* Formulário de Upload */}
          <div className={`${showChat ? 'lg:w-1/2 hidden lg:block' : 'w-full'} p-4 sm:p-6 ${showChat ? 'lg:border-r border-b lg:border-b-0' : ''} border-slate-200 dark:border-slate-700 lg:overflow-y-auto`}>
            <div className="space-y-6">
              {/* Upload de Arquivo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Arquivo do Documento *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors"
                >
                  {documentInfo.file ? (
                    <div className="flex items-center justify-center">
                      <FileText className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mr-2" />
                      <span className="text-slate-700 dark:text-slate-300">
                        {documentInfo.file.name}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 dark:text-slate-400">
                        Clique para selecionar ou arraste o arquivo
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        PDF, JPG, PNG até 20MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Categoria *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDocumentInfo(prev => ({ ...prev, categoria: 'entrada' }))}
                    className={`p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                      documentInfo.categoria === 'entrada'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    📥 Entrada
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">
                      Receitas, vendas, recebimentos
                    </p>
                  </button>
                  <button
                    onClick={() => setDocumentInfo(prev => ({ ...prev, categoria: 'saida' }))}
                    className={`p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                      documentInfo.categoria === 'saida'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    📤 Saída
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">
                      Despesas, compras, pagamentos
                    </p>
                  </button>
                </div>
              </div>

              {/* Tipo Fiscal */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tipo Fiscal *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDocumentInfo(prev => ({ ...prev, tipoFiscal: 'fiscal' }))}
                    className={`p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                      documentInfo.tipoFiscal === 'fiscal'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    🧾 Fiscal
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">
                      Nota fiscal, cupom fiscal
                    </p>
                  </button>
                  <button
                    onClick={() => setDocumentInfo(prev => ({ ...prev, tipoFiscal: 'nao_fiscal' }))}
                    className={`p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                      documentInfo.tipoFiscal === 'nao_fiscal'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    📄 Não Fiscal
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">
                      Recibo, boleto, extrato
                    </p>
                  </button>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={documentInfo.descricao}
                  onChange={(e) => setDocumentInfo(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Adicione uma descrição ou observação sobre este documento..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
                />
              </div>

              {/* Exibição de Erro - apenas na fase de upload/processamento */}
              {error && !showSaveButton && (
                <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
                  <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                </div>
              )}

              {/* Aviso sobre API Key */}
              {!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY && (
                <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    <strong>Modo Demo:</strong> Configure NEXT_PUBLIC_ANTHROPIC_API_KEY no arquivo .env.local para ativar o processamento real com Claude.
                  </div>
                </div>
              )}

              {/* Botão de Processar - esconde quando chat estiver ativo */}
              {!showChat && (
                <button
                  onClick={handleSubmit}
                  disabled={!documentInfo.file || !documentInfo.categoria || !documentInfo.tipoFiscal || isProcessing}
                  className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando com IA...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      {process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ? 'Processar com Claude' : 'Testar Processamento (Demo)'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Chat com IA ou Botão de Salvar */}
          {showChat && (
            <div className="lg:w-1/2 w-full flex flex-col">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center">
                  {/* Botão Voltar - apenas mobile */}
                  {!isDataComplete && (
                    <button
                      onClick={() => setShowChat(false)}
                      className="lg:hidden p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md mr-2 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </button>
                  )}
                  <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-2" />
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    {isDataComplete ? 'Dados Completos' : 'Assistente IA'}
                  </h3>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    isDataComplete 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                      : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {isDataComplete ? 'Pronto' : 'Online'}
                  </span>
                </div>
              </div>
              
              {!showSaveButton ? (
                <AIChat
                  messages={chatMessages}
                  onMessagesChange={setChatMessages}
                  onComplete={handleChatComplete}
                  onDataComplete={handleDataComplete}
                  ocrData={ocrData}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 space-y-4 sm:space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Documento Pronto!
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                      Todos os dados foram coletados com sucesso. O documento está pronto para ser salvo na central de documentos.
                    </p>
                    
                    {/* Resumo dos dados */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 sm:p-4 text-left space-y-2 mb-4 sm:mb-6">
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm">Resumo Final:</h4>
                      <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                        <div>📄 Tipo: {finalData?.tipo?.toUpperCase()}</div>
                        <div>💰 Valor: {finalData?.valor || 'N/A'}</div>
                        <div>📅 Data: {finalData?.data || 'N/A'}</div>
                        <div>🏢 Fornecedor: {finalData?.fornecedor || finalData?.cliente || 'N/A'}</div>
                        <div>💳 Forma de Pagamento: {finalData?.formaPagamento || 'N/A'}</div>
                        <div>🎯 Centro de Custo: {finalData?.centroCusto || 'N/A'}</div>
                        <div>📋 Categoria: {documentInfo.categoria}</div>
                        <div>🧾 Tipo Fiscal: {documentInfo.tipoFiscal}</div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSaveDocument}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-5 w-5 mr-2" />
                        Enviar Registro
                      </>
                    )}
                  </button>
                  
                  {/* Erro específico do envio */}
                  {error && showSaveButton && (
                    <div className="mt-3 flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};