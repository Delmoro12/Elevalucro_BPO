import { NextRequest, NextResponse } from 'next/server'

export function internalToolsMiddleware(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname

  // Só processar rotas da feature internal_tools
  if (!pathname.startsWith('/internal_tools')) {
    return null
  }

  console.log(`🔧 Internal Tools Feature: ${pathname}`)

  // Verificar autenticação para acessar ferramentas internas
  const authToken = request.cookies.get('sb-access-token')?.value

  if (!authToken) {
    console.log(`🚫 No auth token → login`)
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // TODO: Verificar se usuário tem permissões de ADMIN/INTERNAL
  // const userRole = getUserRoleFromToken(authToken)
  // if (userRole !== 'admin' && userRole !== 'internal') {
  //   return NextResponse.redirect(new URL('/access-denied', request.url))
  // }

  // Redirecionar /internal_tools para /internal_tools/prospects (padrão)
  if (pathname === '/internal_tools' || pathname === '/internal_tools/') {
    console.log(`🔄 Internal tools root → prospects`)
    return NextResponse.redirect(new URL('/internal_tools/prospects', request.url))
  }

  return null
}