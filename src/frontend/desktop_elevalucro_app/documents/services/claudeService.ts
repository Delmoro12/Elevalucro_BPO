import Anthropic from '@anthropic-ai/sdk';

// Configuração do cliente Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true // Para uso no frontend
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

class ClaudeService {
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
        resolve(result.split(',')[1]); // Remove o prefixo data:application/pdf;base64,
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Processa documento com Claude (suporta PDFs nativamente)
  async processDocument(file: File): Promise<DocumentData> {
    try {
      console.log('🔍 Processando documento com Claude:', file.name, 'Tipo:', file.type);
      
      const base64 = await this.fileToBase64(file);
      const mediaType = file.type === 'application/pdf' ? 'application/pdf' : file.type;
      
      console.log('📄 Enviando para Claude...');
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        temperature: 0.1,
        system: this.systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analise este documento e extraia TODAS as informações disponíveis em formato JSON:

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

IMPORTANTE: Leia TODO o conteúdo do documento e extraia todas as informações visíveis. Seja muito preciso com valores e datas.`
              },
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64
                }
              }
            ]
          }
        ]
      });

      const content = response.content[0]?.text || '{}';
      console.log('📄 Resposta do Claude:', content);
      
      // Extrair JSON da resposta
      let extractedData;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        extractedData = JSON.parse(jsonMatch?.[0] || '{}');
      } catch {
        extractedData = {};
      }

      // Identificar campos faltantes
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

    } catch (error) {
      console.error('❌ Erro ao processar documento com Claude:', error);
      throw new Error('Falha ao processar documento com IA');
    }
  }

  // Chat para completar informações (SEM MEMÓRIA - cada sessão é independente)
  async chatCompletion(
    messages: { role: 'user' | 'assistant'; content: string }[],
    documentData: DocumentData
  ): Promise<string> {
    try {
      // Converter mensagens para formato Claude
      const claudeMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        temperature: 0.3,
        system: `${this.systemPrompt}

CONTEXTO ATUAL DO DOCUMENTO:
- Tipo: ${documentData.tipo}
- Valor: ${documentData.valor || 'NÃO IDENTIFICADO'}
- Data: ${documentData.data || 'NÃO IDENTIFICADA'}
- Fornecedor: ${documentData.fornecedor || 'NÃO IDENTIFICADO'}
- Campos faltantes: ${documentData.camposFaltantes.join(', ')}

Converse com o usuário para completar as informações faltantes. Seja específico sobre o que precisa.
IMPORTANTE: Esta conversa NÃO tem memória - trate cada mensagem como independente.`,
        messages: claudeMessages
      });

      return response.content[0]?.text || 'Desculpe, não consegui processar sua mensagem.';

    } catch (error) {
      console.error('Erro no chat com Claude:', error);
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

export const claudeService = new ClaudeService();