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
    return NextResponse.redirect(new URL('/elevalucro_bpo_app/dashboard', request.url))
  }

  // Bloquear internal_tools no subdomínio app
  if (pathname.startsWith('/internal_tools')) {
    const redirectUrl = `https://tools.elevalucro.com.br${pathname}${request.nextUrl.search}`
    console.log(`🔄 App subdomain internal_tools → tools subdomain`)
    return NextResponse.redirect(new URL(redirectUrl))
  }

  return null
}

function handleToolsSubdomain(request: NextRequest, pathname: string): NextResponse | null {
  console.log(`🔧 Tools Subdomain: ${pathname}`)
  
  // Se acessar o subdomínio tools na raiz, redirecionar para prospects
  if (pathname === '/') {
    console.log(`🔄 Tools root → internal_tools/prospects`)
    return NextResponse.redirect(new URL('/internal_tools/prospects', request.url))
  }

  // Bloquear elevalucro_bpo_app no subdomínio tools
  if (pathname.startsWith('/elevalucro_bpo_app')) {
    const redirectUrl = `https://app.elevalucro.com.br${pathname}${request.nextUrl.search}`
    console.log(`🔄 Tools subdomain bpo_app → app subdomain`)
    return NextResponse.redirect(new URL(redirectUrl))
  }

  return null
}

function handleMainDomain(request: NextRequest, pathname: string, hostname: string): NextResponse | null {
  console.log(`🏠 Main Domain: ${pathname}`)
  
  // Redirecionar aplicações para subdomínios corretos
  if (pathname.startsWith('/elevalucro_bpo_app')) {
    const redirectUrl = `https://app.${hostname}${pathname}${request.nextUrl.search}`
    console.log(`🔄 Main → App subdomain`)
    return NextResponse.redirect(new URL(redirectUrl))
  }

  if (pathname.startsWith('/internal_tools')) {
    const redirectUrl = `https://tools.${hostname}${pathname}${request.nextUrl.search}`
    console.log(`🔄 Main → Tools subdomain`)
    return NextResponse.redirect(new URL(redirectUrl))
  }

  return null
}

export const defaultDomainConfig: DomainConfig = {
  mainDomain: 'www.elevalucro.com.br',
  appSubdomain: 'app.elevalucro.com.br',
  toolsSubdomain: 'tools.elevalucro.com.br'
}