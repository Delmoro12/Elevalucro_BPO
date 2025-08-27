import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Detectar se é o subdomínio app
  const isAppSubdomain = hostname.startsWith('app.')

  // Se está no subdomínio app, redirecionar para as aplicações
  if (isAppSubdomain) {
    // Se acessar o subdomínio app na raiz, redirecionar para dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/elevalucro_bpo_app/dashboard', request.url))
    }
    // Se não for rota do sistema BPO ou internal_tools, redirecionar para dashboard
    if (!pathname.startsWith('/elevalucro_bpo_app') && !pathname.startsWith('/internal_tools') && !pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/elevalucro_bpo_app/dashboard', request.url))
    }
  }

  // Se está no domínio principal
  if (!isAppSubdomain) {
    // Bloquear acesso às aplicações pelo domínio principal
    if (pathname.startsWith('/elevalucro_bpo_app') || pathname.startsWith('/internal_tools')) {
      return NextResponse.redirect(new URL(`https://app.${hostname}${pathname}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}