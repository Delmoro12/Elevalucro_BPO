# ElevaLucro BPO

Sistema de gestão financeira BPO com dashboards, aprovações e integração com ERPs.

## Funcionalidades Principais

- **Formulários de Pre-Onboarding** para os 3 planos (Controle, Gerencial, Avançado)
- **Integração com Asaas** para pagamentos e assinaturas
- **Integração com D4Sign** para contratos automáticos
- **Páginas de vendas** responsivas para cada segmento
- **Sistema de planos configurável** com áreas específicas por plano

## Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Configurar variáveis de ambiente no .env

# Rodar em desenvolvimento
npm run dev
```

## Estrutura

- `src/frontend/` - Aplicação Next.js com features-first
- `src/backend/` - API Node.js/Supabase com edge functions
- `src/shared/` - Código compartilhado entre front e back

## Scripts

- `npm run dev` - Desenvolvimento com Turbopack
- `npm run build` - Build de produção
- `npm run start` - Rodar build de produção
- `npm run lint` - Verificar linting