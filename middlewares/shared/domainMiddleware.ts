import { NextRequest, NextResponse } from 'next/server'

export interface DomainConfig {
  mainDomain: string;
  appSubdomain: string;
  toolsSubdomain: string;
}

export function createDomainMiddleware(config: DomainConfig) {
  return function domainMiddleware(request: NextRequest): NextResponse | null {
    const hostname = request.headers.get('host') || ''
    const pathname = request.nextUrl.pathname

    // Detectar tipo de domínio
    const isAppSubdomain = hostname.startsWith('app.')
    const isToolsSubdomain = hostname.startsWith('tools.')
    
    console.log(`🌐 Domain: ${hostname}${pathname}`)

    // SUBDOMÍNIO APP: Sistema BPO
    if (isAppSubdomain) {
      return handleAppSubdomain(request, pathname)
    }

    // SUBDOMÍNIO TOOLS: Ferramentas Internas
    if (isToolsSubdomain) {
      return handleToolsSubdomain(request, pathname)
    }

    // DOMÍNIO PRINCIPAL: Landing Page
    return handleMainDomain(request, pathname, hostname)
  }
}

function handleAppSubdomain(request: NextRequest, pathname: string): NextResponse | null {
  console.log(`💼 App Subdomain: ${pathname}`)
  
  // Se acessar o subdomínio app na raiz, redirecionar para dashboard
  if (pathname === '/') {
    console.log(`🔄 App root → dashboard`)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return null
}

function handleToolsSubdomain(request: NextRequest, pathname: string): NextResponse | null {
  console.log(`🔧 Tools Subdomain: ${pathname}`)
  
  // Se acessar o subdomínio tools na raiz, redirecionar para prospects
  if (pathname === '/') {
    console.log(`🔄 Tools root → prospects`)
    return NextResponse.redirect(new URL('/prospects', request.url))
  }

  return null
}

function handleMainDomain(request: NextRequest, pathname: string, hostname: string): NextResponse | null {
  console.log(`🏠 Main Domain: ${pathname}`)
  
  // Lista de rotas públicas permitidas no domínio principal
  const publicRoutes = [
    '/',                          // Landing page
    '/agencias',                  // Páginas de segmentos
    '/clinicas',
    '/geral', 
    '/hoteis',
    '/restaurantes',
    '/obrigado',                  // Página de obrigado
    '/pre-onboard-avancado',      // Formulários de pre-onboarding
    '/pre-onboard-controle',
    '/pre-onboard-gerencial',
    '/onboarding-avancado',       // Formulários de onboarding
    '/onboarding-controle',
    '/onboarding-gerencial',
    '/auth',                      // Páginas de autenticação (público)
    '/_next',                     // Assets do Next.js
    '/images',                    // Imagens públicas
    '/favicon.ico',               // Favicon
    '/api'                        // APIs públicas
  ]

  // Verificar se é uma rota pública permitida
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Redirecionar aplicações antigas para subdomínios corretos
  if (pathname.startsWith('/elevalucro_bpo_app')) {
    const newPath = pathname.replace('/elevalucro_bpo_app', '')
    const redirectUrl = `https://app.${hostname}${newPath}${request.nextUrl.search}`
    console.log(`🔄 Main → App subdomain`)
    return NextResponse.redirect(new URL(redirectUrl))
  }

  if (pathname.startsWith('/internal_tools')) {
    const newPath = pathname.replace('/internal_tools', '')
    const redirectUrl = `https://tools.${hostname}${newPath}${request.nextUrl.search}`
    console.log(`🔄 Main → Tools subdomain`)
    return NextResponse.redirect(new URL(redirectUrl))
  }

  // Se não for uma rota pública, bloquear acesso
  if (!isPublicRoute) {
    console.log(`🚫 Blocked access to protected/invalid route: ${pathname}`)
    return NextResponse.redirect(new URL('/', request.url))
  }

  return null
}

export const defaultDomainConfig: DomainConfig = {
  mainDomain: 'www.elevalucro.com.br',
  appSubdomain: 'app.elevalucro.com.br',
  toolsSubdomain: 'tools.elevalucro.com.br'
}