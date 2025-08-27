import { NextRequest, NextResponse } from 'next/server'

export function createToolsSubdomainGuard() {
  return function toolsSubdomainGuard(request: NextRequest): NextResponse | null {
    const hostname = request.headers.get('host') || ''
    const pathname = request.nextUrl.pathname

    // 🚨 PORTARIA: Só aplicar no subdomínio tools
    const isToolsSubdomain = hostname.startsWith('tools.')
    
    if (!isToolsSubdomain) {
      return null // Não é subdomínio tools, passar adiante
    }

    console.log(`🔧 TOOLS SUBDOMAIN GUARD: ${pathname}`)

    // ✅ Rotas públicas que não precisam de autenticação
    const publicRoutes = ['/auth', '/api/health', '/_next', '/images', '/favicon.ico']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    if (isPublicRoute) {
      console.log(`✅ Public route allowed: ${pathname}`)
      return null
    }

    // 🔐 Verificar se usuário está logado
    const accessToken = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value
    
    console.log(`🍪 Tools Debug - Access token exists: ${!!accessToken}`)
    console.log(`🍪 Tools Debug - Refresh token exists: ${!!refreshToken}`)
    
    if (!accessToken) {
      console.log(`🚫 No access token → login`)
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    console.log(`🎫 Tools Debug - Token preview: ${accessToken.substring(0, 50)}...`)

    // 🎫 Verificar se tem role bpo_side
    try {
      const userRole = extractRoleFromJWT(accessToken)
      
      if (userRole !== 'bpo_side') {
        console.log(`🚫 Invalid role for tools: ${userRole}, required: bpo_side`)
        return NextResponse.redirect(new URL('/auth/access-denied', request.url))
      }

      console.log(`✅ Valid bpo_side user`)
      return null // Usuário autorizado para internal tools

    } catch (error) {
      console.error(`❌ JWT validation error:`, error)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }
}

/**
 * Extrai a role do JWT token
 * TODO: Implementar decodificação real do JWT
 */
function extractRoleFromJWT(token: string): string | null {
  try {
    console.log(`🔍 Tools Debug - Extracting role from JWT...`)
    const payload = token.split('.')[1]
    if (!payload) {
      console.log(`🚫 Tools Debug - No payload in JWT`)
      return null
    }
    
    const decoded = JSON.parse(atob(payload))
    console.log(`🎭 Tools Debug - Full JWT payload:`, decoded)
    console.log(`🎭 Tools Debug - App metadata:`, decoded.app_metadata)
    console.log(`👤 Tools Debug - User metadata:`, decoded.user_metadata)
    
    const roleId = decoded.app_metadata?.role
    console.log(`🎯 Tools Debug - Role ID from app_metadata:`, roleId)
    
    if (!roleId) {
      console.log(`🚫 No role ID in app_metadata`)
      return null
    }

    const mappedRole = mapRoleIdToName(roleId)
    console.log(`🗺️ Tools Debug - Final mapped role:`, mappedRole)
    return mappedRole
    
  } catch (error) {
    console.error(`❌ Error extracting role from JWT:`, error)
    return null
  }
}

/**
 * Mapeia ID da role para nome da role
 * Usando os IDs reais do banco de produção
 */
function mapRoleIdToName(roleId: string): string | null {
  const roleMap: Record<string, string> = {
    '3e979a41-1ddb-452a-a6f8-7053b894856c': 'bpo_side',      // Equipe interna (produção)
    '6da20e26-30a0-43a6-a9c7-287841b61e31': 'client_side',   // Clientes (produção)
    // Legacy mapping for development
    '1': 'bpo_side',
    '2': 'client_side', 
    '3': 'admin',
  }

  const roleName = roleMap[roleId]
  console.log(`🗺️ Tools Role mapping: ${roleId} → ${roleName || 'unknown'}`)
  
  return roleName || null
}