import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware principal do sistema ElevaLucro BPO
 * Responsável por:
 * 1. Roteamento por subdomínio
 * 2. Redirects de páginas
 * 3. Proteção de rotas (futuro)
 * 4. Validação de roles (futuro)
 */
export function middleware(request: NextRequest) {
  // ============================================
  // 1. CAPTURA DE INFORMAÇÕES DA REQUISIÇÃO
  // ============================================
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  const { method } = request
  
  // Log para debug
  console.log(`🔥 Middleware: ${method} ${hostname}${pathname}`)
  
  // ============================================
  // 2. DETECÇÃO DO TIPO DE DOMÍNIO
  // ============================================
  const isAppSubdomain = hostname.startsWith('app.')     // app.elevalucro.com.br
  const isToolsSubdomain = hostname.startsWith('tools.') // tools.elevalucro.com.br
  const isMainDomain = !isAppSubdomain && !isToolsSubdomain // elevalucro.com.br
  
  // ============================================
  // 3. ROTEAMENTO DO DOMÍNIO PRINCIPAL
  // ============================================
  if (isMainDomain) {
    console.log(`🏠 Main Domain: ${pathname}`)
    
    // Redirect da homepage para landing page geral
    if (pathname === '/') {
      console.log(`🔄 Homepage → /geral`)
      return NextResponse.redirect(new URL('/geral', request.url))
    }
    
    // ============================================
    // REDIRECTS DOS FORMULÁRIOS
    // Não precisa mais de redirects - as rotas existem diretamente
    // ============================================
    // Comentado: Os redirects não são mais necessários
    // As rotas /pre-onboard-* e /onboarding-* existem diretamente em app/
    // const formRedirects: Record<string, string> = {}
    // if (formRedirects[pathname]) {
    //   return NextResponse.redirect(new URL(formRedirects[pathname], request.url))
    // }
    
    // Lista de rotas públicas permitidas no domínio principal
    const publicRoutes = [
      '/agencias',           // Landing pages
      '/clinicas',
      '/geral',
      '/hoteis',
      '/restaurantes',
      '/pre-onboard-avancado',  // Formulário pré-onboarding avançado
      '/pre-onboard-controle',  // Formulário pré-onboarding controle
      '/pre-onboard-gerencial', // Formulário pré-onboarding gerencial
      '/onboarding-avancado',   // Formulário onboarding avançado
      '/onboarding-controle',   // Formulário onboarding controle
      '/onboarding-gerencial',  // Formulário onboarding gerencial
      '/obrigado',           // Página de obrigado
      '/_next',              // Assets do Next.js
      '/images',             // Imagens públicas
      '/favicon.ico',        // Favicon
      '/api'                 // APIs públicas
    ]
    
    // Verifica se é uma rota pública
    const isPublicRoute = publicRoutes.some(route => 
      pathname.startsWith(route)
    )
    
    // Se não for rota pública, redireciona para homepage
    if (!isPublicRoute) {
      console.log(`🚫 Rota não permitida no domínio principal: ${pathname}`)
      return NextResponse.redirect(new URL('/geral', request.url))
    }
  }
  
  // ============================================
  // 4. ROTEAMENTO DO SUBDOMÍNIO APP (CLIENTES)
  // ============================================
  if (isAppSubdomain) {
    console.log(`💼 App Subdomain: ${pathname}`)
    
    // Redirect da raiz para dashboard
    if (pathname === '/') {
      console.log(`🔄 App root → /dashboard`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Lista de rotas públicas (que não precisam de autenticação)
    const publicRoutes = [
      '/auth/login',               // Página de login
      '/auth/forgot-password',     // Página de recuperação de senha
      '/auth/reset-password',      // Página de redefinição de senha
      '/auth/set-password',        // Página de definir senha
      '/auth/callback',            // Callback de autenticação
      '/api/auth',                 // API routes de autenticação
      '/_next',                    // Assets do Next.js
      '/images',                   // Imagens públicas
      '/favicon.ico'               // Favicon
    ]
    
    // Verifica se é uma rota pública
    const isPublicRoute = publicRoutes.some(route => 
      pathname.startsWith(route)
    )
    
    // Se é rota pública, permitir acesso
    if (isPublicRoute) {
      console.log(`✅ App public route allowed: ${pathname}`)
      // Continue processamento normal
    }
    
    // Lista de rotas exclusivas do tools (não permitidas no app)
    const toolsOnlyRoutes = [
      '/prospects',
      '/customer-success',
      '/funcionarios',
      '/tools-auth'
    ]
    
    // Bloquear rotas exclusivas do tools
    const isToolsOnlyRoute = toolsOnlyRoutes.some(route => 
      pathname.startsWith(route)
    )
    
    if (isToolsOnlyRoute) {
      console.log(`🚫 App: Route '${pathname}' does not exist in app subdomain → 404`)
      // Return 404 for routes that don't exist in this subdomain
      return NextResponse.rewrite(new URL('/404', request.url), {
        status: 404
      })
    }
    
    // Se não é rota pública, verificar autenticação
    if (!isPublicRoute) {
      console.log(`🔒 App: Protected route '${pathname}' - checking authentication`)
      
      // Verificar se usuário está logado (cookie simples)
      const accessToken = request.cookies.get('sb-access-token')?.value
      
      if (!accessToken) {
        console.log(`🚫 App: No access token found → redirecting to login`)
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      console.log(`✅ App: Access token found, allowing access`)
    }
  }
  
  // ============================================
  // 5. ROTEAMENTO DO SUBDOMÍNIO TOOLS (FUNCIONÁRIOS)
  // ============================================
  if (isToolsSubdomain) {
    console.log(`🔧 Tools Subdomain: ${pathname}`)
    
    // Redirect da raiz para prospects
    if (pathname === '/') {
      console.log(`🔄 Tools root → /prospects`)
      return NextResponse.redirect(new URL('/prospects', request.url))
    }
    
    // ============================================
    // VERIFICAÇÃO DE AUTENTICAÇÃO E ROLE
    // ============================================
    
    // Lista de rotas públicas (que não precisam de autenticação)
    const publicRoutes = [
      '/tools-auth/login',         // Página de login
      '/tools-auth/signup',        // Página de signup para operadores BPO
      '/tools-auth/callback',      // Callback de autenticação
      '/api/auth',           // API routes de autenticação
      '/_next',              // Assets do Next.js
      '/images',             // Imagens públicas
      '/favicon.ico'         // Favicon
    ]
    
    // Lista de rotas exclusivas do app (não permitidas no tools)
    const appOnlyRoutes = [
      '/dashboard',
      '/my-finance',
      '/documents',
      '/approvals',
      '/actions',
      '/tickets',
      '/integrations',
      '/auth'  // Auth de clientes (diferente de tools-auth)
    ]
    
    // Bloquear rotas exclusivas do app
    const isAppOnlyRoute = appOnlyRoutes.some(route => 
      pathname.startsWith(route)
    )
    
    if (isAppOnlyRoute) {
      console.log(`🚫 Tools: Route '${pathname}' does not exist in tools subdomain → 404`)
      // Return 404 for routes that don't exist in this subdomain
      return NextResponse.rewrite(new URL('/404', request.url), {
        status: 404
      })
    }
    
    // Lista de rotas que precisam de autenticação (mas são permitidas se autenticado)
    const protectedRoutes = [
      '/api',                // API routes protegidas
      '/prospects',          // Páginas internas
      '/customer-success',   // Página de sucesso do cliente
      '/onboarding',
      '/funcionarios'
    ]
    
    // Verifica se é uma rota pública
    const isPublicRoute = publicRoutes.some(route => 
      pathname.startsWith(route)
    )
    
    // Verifica se é uma rota protegida
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    )
    
    // Se é rota pública, permitir acesso
    if (isPublicRoute) {
      console.log(`✅ Tools public route allowed: ${pathname}`)
      return null // Continuar processamento
    }
    
    // Se não é uma rota protegida nem pública, redirecionar para login
    if (!isProtectedRoute) {
      console.log(`🚫 Tools: Unknown route '${pathname}' → login`)
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // ============================================
    // VERIFICAÇÃO DE TOKEN E ROLE
    // Para rotas protegidas, verificar autenticação
    // ============================================
    
    // Verificar se usuário está logado
    // Supabase usa padrão sb-{project-ref}-auth-token para cookies
    let accessToken = request.cookies.get('sb-access-token')?.value
    
    // Tentar outros formatos possíveis de cookies do Supabase
    if (!accessToken) {
      // Padrão completo com project ref - verificar todos os cookies
      const allCookies = request.cookies.getAll()
      for (const cookie of allCookies) {
        if (cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')) {
          accessToken = cookie.value
          break
        }
      }
    }
    
    // Cookie padrão do browser storage do Supabase
    if (!accessToken) {
      accessToken = request.cookies.get('supabase.auth.token')?.value
    }
    
    let tokenSource = accessToken ? 'cookie' : 'none'
    
    // Se não há cookie, verificar se há token no header (enviado via sessionStorage)
    if (!accessToken) {
      const headerToken = request.headers.get('x-supabase-auth-token')
      accessToken = headerToken || undefined
      tokenSource = accessToken ? 'header' : 'none'
    }
    
    if (!accessToken) {
      console.log(`🚫 Tools: No access token found → redirecting to login`)
      console.log(`🚫 Checked cookies: sb-access-token, supabase.auth.token, sb-*-auth-token patterns`)
      const loginUrl = new URL('/tools-auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Log todos os cookies para debug
    const allCookiesDebug: string[] = []
    const cookiesList = request.cookies.getAll()
    for (const cookie of cookiesList) {
      allCookiesDebug.push(`${cookie.name}=${cookie.value.substring(0, 20)}...`)
    }
    console.log(`🍪 All cookies:`, allCookiesDebug)
    
    console.log(`🎫 Tools: Token found via ${tokenSource}`)
    
    // Verificar se tem role bpo_side
    try {
      // Log do token para debug (primeiros 50 caracteres)
      console.log(`🔍 Tools: Token to validate: ${accessToken.substring(0, 50)}...`)
      
      const userRole = extractRoleFromJWT(accessToken)
      
      console.log(`🎯 Tools: Extracted role: '${userRole}'`)
      
      if (userRole !== 'bpo_side') {
        console.log(`🚫 Tools: Invalid role '${userRole}', required 'bpo_side' → login`)
        console.log(`🚫 Tools: Role comparison failed: '${userRole}' !== 'bpo_side'`)
        const loginUrl = new URL('/tools-auth/login', request.url)
        loginUrl.searchParams.set('error', 'insufficient_permissions')
        return NextResponse.redirect(loginUrl)
      }
      
      console.log(`✅ Tools: Valid bpo_side user authenticated`)
      
    } catch (error) {
      console.error(`❌ Tools: JWT validation error:`, error)
      const loginUrl = new URL('/tools-auth/login', request.url)
      loginUrl.searchParams.set('error', 'invalid_token')
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // ============================================
  // 6. CONTINUA O PROCESSAMENTO NORMAL
  // ============================================
  console.log(`✅ Middleware passed, continuing...`)
  return NextResponse.next()
}

// ============================================
// FUNÇÃO AUXILIAR PARA JWT
// ============================================

/**
 * Extrai a role do JWT token
 */
function extractRoleFromJWT(token: string): string | null {
  try {
    // Decodificar JWT payload (base64)
    const payload = token.split('.')[1]
    if (!payload) {
      console.log(`🚫 JWT: No payload found`)
      return null
    }
    
    const decoded = JSON.parse(atob(payload))
    console.log(`🎫 JWT Payload - user_metadata:`, decoded.user_metadata)
    console.log(`🎫 JWT Payload - app_metadata:`, decoded.app_metadata)
    
    // Tentar buscar role tanto do user_metadata quanto app_metadata
    const roleName = decoded.user_metadata?.role || decoded.app_metadata?.role
    
    // Log detalhado para debug
    console.log(`🔍 JWT: Looking for role in metadata`)
    console.log(`🔍 JWT: user_metadata.role = '${decoded.user_metadata?.role}'`)
    console.log(`🔍 JWT: app_metadata.role = '${decoded.app_metadata?.role}'`)
    
    if (!roleName) {
      console.log(`🚫 JWT: No role found in either user_metadata or app_metadata`)
      return null
    }

    console.log(`🎫 JWT: Role from token: ${roleName}`)
    
    return roleName
    
  } catch (error) {
    console.error(`❌ JWT: Error extracting role:`, error)
    return null
  }
}

/**
 * Mapeia ID da role para nome da role
 * Usando os IDs reais do banco de produção
 */
function mapRoleIdToName(roleId: string): string | null {
  const roleMap: Record<string, string> = {
    'a3ac4409-99ab-4b01-936b-d3ef18be0a3f': 'bpo_side',      // Equipe interna (produção)
    '55252fe8-6968-470e-87ec-f2ad79e49782': 'client_side',   // Clientes (produção)
    // Legacy mapping for development
    '1': 'bpo_side',
    '2': 'client_side', 
    '3': 'admin',
  }

  const roleName = roleMap[roleId]
  console.log(`🗺️ Role mapping: ${roleId} → ${roleName || 'unknown'}`)
  
  return roleName || null
}

// ============================================
// CONFIGURAÇÃO DO MATCHER
// Define quais rotas o middleware processa
// ============================================
export const config = {
  matcher: [
    /*
     * Processa todas as rotas EXCETO:
     * - api (API routes - já tem /api no matcher acima, mas deixamos excluído aqui por segurança)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone do site)
     * - arquivos estáticos na raiz (logo.png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}