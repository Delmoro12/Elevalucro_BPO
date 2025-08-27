import { NextRequest, NextResponse } from 'next/server'

export function authMiddleware(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname

  // Só processar rotas da feature auth
  if (!pathname.startsWith('/auth')) {
    return null
  }

  console.log(`🔐 Auth Feature: ${pathname}`)

  // Lógica específica da feature auth
  if (pathname === '/auth' || pathname === '/auth/') {
    // Redirecionar /auth para /auth/login
    console.log(`🔄 /auth → /auth/login`)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Se já está logado e tentando acessar login, redirecionar para dashboard
  const authToken = request.cookies.get('sb-access-token')?.value
  const isLoginPage = pathname === '/auth/login'

  if (authToken && isLoginPage) {
    console.log(`🔄 Already authenticated → dashboard`)
    return NextResponse.redirect(new URL('/elevalucro_bpo_app/dashboard', request.url))
  }

  return null
}