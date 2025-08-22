# 🤖 Configuração OpenAI GPT-4o para Processamento de Documentos

## 📋 Pré-requisitos

1. **Conta OpenAI**: Criar conta em [platform.openai.com](https://platform.openai.com)
2. **Créditos**: Adicionar créditos à conta (mínimo $5)
3. **API Key**: Gerar chave de API

## 🔧 Configuração Passo a Passo

### 1. Criar API Key na OpenAI

1. Acesse [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Clique em "Create new secret key"
3. Nomeie como "ElevaLucro-BPO"
4. Copie a chave (ex: `sk-proj-abc123...`)

### 2. Configurar no Projeto

1. Copie o arquivo de exemplo:
```bash
cp .env.local.example .env.local
```

2. Edite `.env.local` e adicione sua API key:
```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-sua-chave-aqui
```

### 3. Reiniciar o Servidor

```bash
npm run dev
```

## 💰 Custos Estimados

### GPT-5 Nano (2025)
- **Imagem baixa resolução**: ~$0.00002 por documento (75% mais barato!)
- **Imagem alta resolução**: ~$0.0003 por documento  
- **PDF (por página)**: ~$0.00005-0.0001 por página
- **Chat completion**: ~$0.00001-0.00003 por pergunta/resposta
- **Ultra-low latency**: Resposta 3x mais rápida que GPT-4o

### Estimativa Mensal (100 documentos/dia)
- **3.000 documentos/mês**: ~$1-3/mês (economia de 95%!)
- **Volume baixo (300 docs)**: ~$0.10-0.30/mês
- **Volume alto (10.000 docs)**: ~$3-10/mês

## 🚀 Funcionalidades Ativadas com GPT-5 Nano

✅ **OCR Ultra-Rápido**: Extração automática 3x mais rápida de dados de NFe, cupons, recibos
✅ **Chat Inteligente**: Conversa contextual para completar informações faltantes  
✅ **Formatos Suportados**: JPG, PNG até 20MB (GPT-5 Nano não processa PDFs)
✅ **Validação com Reasoning**: Detecta campos obrigatórios com capacidades de raciocínio
✅ **Classificação Automática**: Identifica tipo de documento automaticamente
✅ **Economia de 95%**: Custo ultra-baixo para processamento em massa

## 🛡️ Segurança

- ✅ API Key configurada como variável de ambiente
- ✅ Validação de tipos de arquivo
- ✅ Limite de tamanho (20MB)
- ✅ Rate limiting automático da OpenAI
- ⚠️ **Não committar** arquivos `.env.local` no Git

## 🔧 Troubleshooting

### Erro: "API Key não configurada"
- Verifique se `.env.local` existe
- Confirme que `NEXT_PUBLIC_OPENAI_API_KEY` está definida
- Reinicie o servidor (`npm run dev`)

### Erro: "Invalid API Key"
- Verifique se a chave está correta
- Confirme que tem créditos na conta OpenAI
- Teste a chave em [platform.openai.com/playground](https://platform.openai.com/playground)

### Erro: "Rate limit exceeded"
- Aguarde alguns minutos
- Considere upgrade do plano OpenAI para limits maiores

### Erro: "File too large"
- Comprima a imagem/PDF
- Máximo 20MB por arquivo
- Para PDFs grandes, considere dividir em páginas

## 📊 Monitoramento de Uso

1. Acesse [platform.openai.com/usage](https://platform.openai.com/usage)
2. Monitore custos em tempo real
3. Configure alertas de uso
4. Analise padrões de consumo

## 🎯 Otimizações de Custo

1. **Use resolução baixa** quando possível (85 tokens vs 1.100)
2. **Prompts concisos** reduzem tokens de entrada
3. **Cache resultados** para documentos similares
4. **Batch processing** para múltiplos documentos

## 📈 Próximos Passos

1. **Teste com documentos reais** da empresa
2. **Ajuste prompts** para melhor precisão
3. **Implemente cache** para otimizar custos
4. **Configure alertas** de uso/custo
5. **Integre com Conta Azul** para lançamentos automáticos

---

🔥 **Pronto!** Sua feature de documentos com **GPT-5 Nano** está configurada e funcional!

## 🆕 Vantagens do GPT-5 Nano

- ⚡ **3x mais rápido** que GPT-4o
- 💰 **95% mais barato** ($0.05/1M vs $2.50/1M)
- 🧠 **Reasoning capabilities** para análise contextual
- 🖼️ **Suporte nativo a imagens** para OCR
- 🎯 **Ultra-low latency** ideal para BPO