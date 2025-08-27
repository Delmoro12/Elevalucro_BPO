import { NextRequest, NextResponse } from 'next/server'

export function elevalucroBpoAppMiddleware(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname

  // Só processar rotas da feature elevalucro_bpo_app
  if (!pathname.startsWith('/elevalucro_bpo_app')) {
    return null
  }

  console.log(`💼 BPO App Feature: ${pathname}`)

  // Verificar autenticação para acessar o sistema BPO
  const authToken = request.cookies.get('sb-access-token')?.value

  if (!authToken) {
    console.log(`🚫 No auth token → login`)
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirecionar /elevalucro_bpo_app para /elevalucro_bpo_app/dashboard
  if (pathname === '/elevalucro_bpo_app' || pathname === '/elevalucro_bpo_app/') {
    console.log(`🔄 BPO root → dashboard`)
    return NextResponse.redirect(new URL('/elevalucro_bpo_app/dashboard', request.url))
  }

  // TODO: Verificar permissões específicas do usuário
  // TODO: Validar se o token JWT é válido
  // TODO: Verificar se usuário tem acesso a esta empresa/módulo

  return null
}