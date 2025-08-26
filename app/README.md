# 📁 Estrutura de Roteamento - `/app`

Esta pasta contém **APENAS** roteamento do Next.js App Router. **NÃO** colocar lógica de negócio aqui.

## 🗂️ Organização

```
app/
├── layout.tsx              # Layout raiz da aplicação
├── 
├── api/                    # API Routes do Next.js
│   ├── customers/         # Endpoints de clientes
│   ├── prospects/         # Endpoints de prospects
│   └── subscriptions/     # Endpoints de assinaturas
│
├── auth/                   # Rotas de autenticação
│   ├── callback/          # Callback do magic link
│   └── page.tsx           # Página de login
│
├── elevalucro_bpo_app/     # Rotas da aplicação principal
│   ├── layout.tsx         # Layout com AuthProvider + ThemeProvider
│   ├── page.tsx           # Página inicial (/elevalucro_bpo_app)
│   └── [...slug]/         # Catch-all para rotas dinâmicas
│       └── page.tsx       # Renderiza <MainPage />
│
└── internal_tools/         # Rotas das ferramentas internas
    ├── layout.tsx         # Layout específico das tools
    ├── analytics/         # Ferramentas de analytics
    ├── leads/             # Gestão de leads
    ├── prospects/         # Gestão de prospects
    └── settings/          # Configurações
```

## 🎯 Princípios

### ✅ O que vai na `/app`
- **Roteamento**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **API Routes**: `route.ts` para endpoints
- **Metadata**: Configurações de SEO e meta tags

### ❌ O que NÃO vai na `/app`
- **Componentes**: Vão em `/src/components` ou `/src/features`
- **Hooks**: Vão em `/src/hooks`
- **Utils**: Vão em `/src/utils`
- **Services**: Vão em `/src/services`
- **Lógica de negócio**: Fica em `/src/features/[feature-name]`

## 🔄 Como funciona o roteamento

### Aplicação Principal (`/elevalucro_bpo_app/*`)
1. Usuário acessa `/elevalucro_bpo_app/documentos`
2. Next.js chama `elevalucro_bpo_app/[...slug]/page.tsx`
3. Componente renderiza `<MainPage />` do `/src/frontend`
4. `MainPage` lê a URL e renderiza o componente correto

### Ferramentas Internas (`/internal_tools/*`)
1. Usuário acessa `/internal_tools/analytics` 
2. Next.js chama `internal_tools/analytics/page.tsx`
3. Layout aplica tema e renderiza `<MainPage />` das tools

## 🚨 IMPORTANTE

- **Nunca** coloque componentes React complexos diretamente nos `page.tsx`
- **Sempre** importe de `/src/frontend/` 
- **Mantenha** apenas roteamento e configuração aqui

## 📝 Exemplos de uso correto

```tsx
// ✅ CORRETO - app/elevalucro_bpo_app/[...slug]/page.tsx
import { MainPage } from '../../../src/frontend/elevalucro_bpo_app/layouts/MainPage'

export default function AppCatchAll() {
  return <MainPage />
}
```

```tsx
// ❌ ERRADO - Não faça isso
export default function AppCatchAll() {
  return (
    <div>
      {/* Centenas de linhas de código aqui */}
    </div>
  )
}
```