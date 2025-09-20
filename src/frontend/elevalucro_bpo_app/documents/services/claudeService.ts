import Anthropic from '@anthropic-ai/sdk';

// Configuração do cliente Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true // Para uso no frontend
});

export interface DocumentData {
  tipo: 'fiscal' | 'nao_fiscal';
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
- Data da transação/vencimento
- Fornecedor/Cliente

REGRAS PARA FORMA DE PAGAMENTO:
- Se for boleto: extrair 'Boleto' e a data de vencimento
- Se for NFe com forma de pagamento visível: extrair a forma (PIX, cartão, etc)
- Se tiver código de barras de boleto: é 'Boleto'
- Se tiver QR code PIX: é 'PIX'
- Só perguntar se realmente não conseguir identificar

CAMPOS OPCIONAIS:
- CNPJ
- Número da nota
- Descrição adicional

OBSERVAÇÃO: NÃO pergunte sobre categoria de conta ou centro de custo - isso é definido internamente.`;

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
  "descricao": "descrição dos produtos/serviços",
  "formaPagamento": "forma de pagamento SE VISÍVEL (Boleto, PIX, Cartão, etc)",
  "dataVencimento": "data de vencimento SE for boleto",
  "confianca": "nível de confiança na extração (0-100)"
}

IMPORTANTE: 
- Leia TODO o conteúdo do documento
- Se for BOLETO, sempre extraia 'Boleto' como formaPagamento
- Se tiver código de barras, é provavelmente um boleto
- Extraia a data de vencimento em boletos
- Seja muito preciso com valores e datas
- NÃO tente extrair números de documento/nota - foque nos dados essenciais`
              },
              {
                type: file.type === 'application/pdf' ? 'document' as any : 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType as any,
                  data: base64
                }
              }
            ]
          }
        ]
      });

      const content = (response.content[0] as any)?.text || '{}';
      console.log('📄 Resposta do Claude:', content);
      
      // Extrair JSON da resposta
      let extractedData;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch?.[0] || '{}';
        console.log('🔍 JSON extraído:', jsonString);
        extractedData = JSON.parse(jsonString);
        console.log('✅ Dados parseados:', extractedData);
      } catch (parseError) {
        console.error('❌ Erro ao parsear JSON:', parseError);
        extractedData = {};
      }

      // Identificar campos faltantes
      const camposFaltantes: string[] = [];
      if (!extractedData.valor) camposFaltantes.push('valor');
      if (!extractedData.data && !extractedData.dataVencimento) camposFaltantes.push('data');
      if (!extractedData.fornecedor && !extractedData.cliente) camposFaltantes.push('fornecedor_cliente');
      
      // Detectar forma de pagamento automaticamente para boletos
      let formaPagamentoDetectada = extractedData.formaPagamento || '';
      if (extractedData.tipo === 'boleto' && !formaPagamentoDetectada) {
        formaPagamentoDetectada = 'Boleto';
      }
      
      // Só solicita forma de pagamento se realmente não foi detectada
      if (!formaPagamentoDetectada) {
        camposFaltantes.push('forma_pagamento');
      }

      const result = {
        tipo: extractedData.tipo || 'outro',
        valor: extractedData.valor || '',
        data: extractedData.data || extractedData.dataVencimento || '',
        fornecedor: extractedData.fornecedor || '',
        cliente: extractedData.cliente || '',
        cnpj: extractedData.cnpj || '',
        descricao: extractedData.descricao || '',
        formaPagamento: formaPagamentoDetectada,
        dadosCompletos: camposFaltantes.length === 0,
        camposFaltantes,
        confianca: extractedData.confianca || 0
      };
      
      console.log('📦 Resultado final do processamento:', result);
      return result;

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

      return (response.content[0] as any)?.text || 'Desculpe, não consegui processar sua mensagem.';

    } catch (error) {
      console.error('Erro no chat com Claude:', error);
      return 'Ocorreu um erro. Tente novamente.';
    }
  }

  // Valida se documento está completo
  validateDocument(data: DocumentData): boolean {
    const required = ['valor', 'data'];
    const fornecedorOuCliente = data.fornecedor || data.cliente;
    
    return required.every(field => data[field as keyof DocumentData]) && !!fornecedorOuCliente;
  }
}

export const claudeService = new ClaudeService();