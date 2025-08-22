import OpenAI from 'openai';

// Configuração do cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Para uso no frontend (não recomendado em produção)
});

export interface DocumentData {
  tipo: 'nfe' | 'cupom_fiscal' | 'recibo' | 'boleto' | 'extrato' | 'outro';
  valor?: string;
  data?: string;
  fornecedor?: string;
  cliente?: string;
  cnpj?: string;
  numeroNota?: string;
  formaPagamento?: string;
  centroCusto?: string;
  descricao?: string;
  dadosCompletos: boolean;
  camposFaltantes: string[];
  confianca: number; // 0-100%
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url' | 'file';
    text?: string;
    image_url?: {
      url: string;
      detail?: 'low' | 'high' | 'auto';
    };
    file?: {
      file_id: string;
    };
  }>;
}

class OpenAIService {
  private systemPrompt = `Você é um assistente especializado em processamento de documentos fiscais brasileiros.

Sua função é:
1. Analisar documentos (NFe, cupons fiscais, recibos, boletos, extratos)
2. Extrair dados estruturados
3. Identificar campos faltantes
4. Conversar com o usuário para completar informações

REGRAS IMPORTANTES:
- Sempre responda em português brasileiro
- Seja preciso na extração de valores e datas
- Use formato de data DD/MM/AAAA
- Use formato de valor R$ X.XXX,XX
- CNPJ no formato XX.XXX.XXX/XXXX-XX
- Seja educado e profissional
- Se não conseguir ler algo, peça confirmação

DADOS OBRIGATÓRIOS:
- Valor do documento
- Data da transação
- Fornecedor/Cliente
- Forma de pagamento
- Centro de custo

CAMPOS OPCIONAIS:
- CNPJ
- Número da nota
- Descrição adicional`;

  // Converte arquivo para base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove o prefixo data:image/jpeg;base64,
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Processa documento com GPT-5 Nano (método 2025 - sem simulações)
  async processDocument(file: File): Promise<DocumentData> {
    try {
      console.log('🔍 Processando documento:', file.name, 'Tipo:', file.type);
      
      let messages: ChatMessage[];
      
      if (file.type === 'application/pdf') {
        // Para PDFs: Upload correto com purpose "assistants" (conforme documentação)
        console.log('📄 Processando PDF com GPT-5...');
        const uploadedFile = await openai.files.create({
          file: file,
          purpose: 'assistants' // Purpose correto para PDFs
        });
        console.log('✅ PDF enviado, File ID:', uploadedFile.id);
        
        // Usar Assistants API para processar o PDF
        const assistant = await openai.beta.assistants.create({
          name: "Processador de Documentos",
          instructions: this.systemPrompt,
          model: "gpt-4o",
          tools: [{ type: "file_search" }],
          tool_resources: {
            file_search: {
              vector_stores: [{
                file_ids: [uploadedFile.id]
              }]
            }
          }
        });

        const thread = await openai.beta.threads.create({
          messages: [{
            role: "user",
            content: `Analise este documento PDF e extraia TODAS as informações disponíveis em formato JSON:

{
  "tipo": "nfe, cupom_fiscal, recibo, boleto, extrato, ou outro",
  "valor": "valor em formato R$ X.XXX,XX", 
  "data": "data no formato DD/MM/AAAA",
  "fornecedor": "nome completo do fornecedor/emissor",
  "cliente": "nome completo do cliente/destinatário",
  "cnpj": "CNPJ no formato XX.XXX.XXX/XXXX-XX",
  "numeroNota": "número da nota/documento",
  "descricao": "descrição dos produtos/serviços",
  "confianca": "nível de confiança na extração (0-100)"
}

IMPORTANTE: Use file_search para ler TODO o conteúdo do PDF e extrair todas as informações.`,
            attachments: [{
              file_id: uploadedFile.id,
              tools: [{ type: "file_search" }]
            }]
          }]
        });

        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: assistant.id
        });

        // Aguardar conclusão
        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, { run_id: run.id });
        while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(thread.id, { run_id: run.id });
        }

        // Obter resposta
        const threadMessages = await openai.beta.threads.messages.list(thread.id);
        const content = threadMessages.data[0]?.content[0]?.text?.value || '{}';
        console.log('📄 Resposta da API:', content);

        // Cleanup
        await openai.files.delete(uploadedFile.id);
        await openai.beta.assistants.delete(assistant.id);

        // Simular a estrutura de messages para compatibilidade
        const response = { choices: [{ message: { content } }] };
        
        // Processar resposta normalmente
        let extractedData;
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          extractedData = JSON.parse(jsonMatch?.[0] || '{}');
        } catch {
          extractedData = {};
        }

        const camposFaltantes: string[] = [];
        if (!extractedData.valor) camposFaltantes.push('valor');
        if (!extractedData.data) camposFaltantes.push('data');
        if (!extractedData.fornecedor && !extractedData.cliente) camposFaltantes.push('fornecedor_cliente');
        camposFaltantes.push('forma_pagamento', 'centro_custo');

        return {
          tipo: extractedData.tipo || 'outro',
          valor: extractedData.valor || '',
          data: extractedData.data || '',
          fornecedor: extractedData.fornecedor || '',
          cliente: extractedData.cliente || '',
          cnpj: extractedData.cnpj || '',
          numeroNota: extractedData.numeroNota || '',
          descricao: extractedData.descricao || '',
          formaPagamento: '',
          centroCusto: '',
          dadosCompletos: camposFaltantes.filter(c => !['forma_pagamento', 'centro_custo'].includes(c)).length === 0,
          camposFaltantes,
          confianca: extractedData.confianca || 0
        };
      } else {
        // Para imagens: Vision API com base64
        console.log('🖼️ Processando imagem com GPT-5 Vision...');
        const base64 = await this.fileToBase64(file);
        const mimeType = file.type;

        messages = [
          {
            role: 'system',
            content: this.systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analise este documento e extraia TODAS as informações em formato JSON:

{
  "tipo": "nfe, cupom_fiscal, recibo, boleto, extrato, ou outro",
  "valor": "valor em formato R$ X.XXX,XX",
  "data": "data no formato DD/MM/AAAA",
  "fornecedor": "nome completo do fornecedor/emissor",
  "cliente": "nome completo do cliente/destinatário", 
  "cnpj": "CNPJ no formato XX.XXX.XXX/XXXX-XX",
  "numeroNota": "número da nota/documento",
  "descricao": "descrição dos produtos/serviços",
  "confianca": "nível de confiança na extração (0-100)"
}

IMPORTANTE: Leia TODO o texto visível na imagem e extraia todas as informações disponíveis.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                  detail: 'high' // Alta resolução para melhor OCR
                }
              }
            ]
          }
        ];

        // Processar com GPT-4o (imagens)
        console.log('🤖 Enviando para GPT-4o...');
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.1
        });

        const content = response.choices[0]?.message?.content || '{}';
        console.log('📄 Resposta da API:', content);
        
        // Tenta extrair JSON da resposta
        let extractedData;
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          extractedData = JSON.parse(jsonMatch?.[0] || '{}');
        } catch {
          extractedData = {};
        }

        // Identifica campos faltantes
        const camposFaltantes: string[] = [];
        if (!extractedData.valor) camposFaltantes.push('valor');
        if (!extractedData.data) camposFaltantes.push('data');
        if (!extractedData.fornecedor && !extractedData.cliente) camposFaltantes.push('fornecedor_cliente');
        
        // Sempre solicita forma de pagamento e centro de custo (não detectáveis)
        camposFaltantes.push('forma_pagamento', 'centro_custo');

        return {
          tipo: extractedData.tipo || 'outro',
          valor: extractedData.valor || '',
          data: extractedData.data || '',
          fornecedor: extractedData.fornecedor || '',
          cliente: extractedData.cliente || '',
          cnpj: extractedData.cnpj || '',
          numeroNota: extractedData.numeroNota || '',
          descricao: extractedData.descricao || '',
          formaPagamento: '',
          centroCusto: '',
          dadosCompletos: camposFaltantes.filter(c => !['forma_pagamento', 'centro_custo'].includes(c)).length === 0,
          camposFaltantes,
          confianca: extractedData.confianca || 0
        };
      }

    } catch (error) {
      console.error('❌ Erro ao processar documento:', error);
      throw new Error('Falha ao processar documento com IA');
    }
  }

  // Chat para completar informações (SEM MEMÓRIA - cada sessão é independente)
  async chatCompletion(
    messages: ChatMessage[],
    documentData: DocumentData
  ): Promise<string> {
    try {
      const contextualMessages: ChatMessage[] = [
        {
          role: 'system',
          content: `${this.systemPrompt}

CONTEXTO ATUAL DO DOCUMENTO:
- Tipo: ${documentData.tipo}
- Valor: ${documentData.valor || 'NÃO IDENTIFICADO'}
- Data: ${documentData.data || 'NÃO IDENTIFICADA'}
- Fornecedor: ${documentData.fornecedor || 'NÃO IDENTIFICADO'}
- Campos faltantes: ${documentData.camposFaltantes.join(', ')}

Converse com o usuário para completar as informações faltantes. Seja específico sobre o que precisa.
IMPORTANTE: Esta conversa NÃO tem memória - trate cada mensagem como independente.`
        },
        ...messages
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: contextualMessages,
        max_tokens: 500,
        temperature: 0.3
      });

      return response.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    } catch (error) {
      console.error('Erro no chat:', error);
      return 'Ocorreu um erro. Tente novamente.';
    }
  }

  // Valida se documento está completo
  validateDocument(data: DocumentData): boolean {
    const required = ['valor', 'data', 'formaPagamento', 'centroCusto'];
    const fornecedorOuCliente = data.fornecedor || data.cliente;
    
    return required.every(field => data[field as keyof DocumentData]) && !!fornecedorOuCliente;
  }
}

export const openaiService = new OpenAIService();