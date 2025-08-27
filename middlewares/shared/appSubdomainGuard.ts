import { NextRequest, NextResponse } from 'next/server'

export interface AppSubdomainGuardConfig {
  requiredRole: string;
  publicRoutes: string[];
  loginUrl: string;
  accessDeniedUrl: string;
}

export function createAppSubdomainGuard(config: AppSubdomainGuardConfig) {
  return function appSubdomainGuard(request: NextRequest): NextResponse | null {
    const hostname = request.headers.get('host') || ''
    const pathname = request.nextUrl.pathname

    // 🚨 PORTARIA: Só aplicar no subdomínio app
    const isAppSubdomain = hostname.startsWith('app.')
    
    if (!isAppSubdomain) {
      return null // Não é subdomínio app, passar adiante
    }

    console.log(`🚨 APP SUBDOMAIN GUARD: ${pathname}`)

    // ✅ Rotas públicas que não precisam de autenticação
    const isPublicRoute = config.publicRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (isPublicRoute) {
      console.log(`✅ Public route allowed: ${pathname}`)
      return null
    }

    // 🔐 Verificar se usuário está logado
    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (!accessToken) {
      console.log(`🚫 No access token → login`)
      const loginUrl = new URL(config.loginUrl, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // 🎫 Verificar se tem role client_side
    try {
      const userRole = extractRoleFromJWT(accessToken)
      
      if (userRole !== config.requiredRole) {
        console.log(`🚫 Invalid role for app: ${userRole}, required: ${config.requiredRole}`)
        return NextResponse.redirect(new URL(config.accessDeniedUrl, request.url))
      }

      console.log(`✅ Valid ${config.requiredRole} user`)
      return null // Usuário autorizado

    } catch (error) {
      console.error(`❌ JWT validation error:`, error)
      return NextResponse.redirect(new URL(config.loginUrl, request.url))
    }
  }
}

/**
 * Extrai a role do JWT token
 */
function extractRoleFromJWT(token: string): string | null {
  try {
    // TODO: Implementar decodificação real do JWT
    // Por enquanto, vamos simular que existe um usuário válido
    
    // Decodificar JWT payload (base64)
    const payload = token.split('.')[1]
    if (!payload) return null
    
    const decoded = JSON.parse(atob(payload))
    console.log(`🎫 JWT Payload (parcial):`, {
      app_metadata: decoded.app_metadata,
      user_metadata: decoded.user_metadata,
      aud: decoded.aud
    })
    
    // A role vem do app_metadata como ID
    const roleId = decoded.app_metadata?.role
    
    if (!roleId) {
      console.log(`🚫 No role ID in app_metadata`)
      return null
    }

    // TODO: Aqui precisamos mapear o ID para o nome da role
    // Por enquanto vamos assumir que veio corretamente
    console.log(`🎫 Role ID from JWT: ${roleId}`)
    
    // Simular mapeamento (temporário)
    return mapRoleIdToName(roleId)
    
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
  console.log(`🗺️ App Role mapping: ${roleId} → ${roleName || 'unknown'}`)
  
  return roleName || null
}

// Configuração padrão para o subdomínio app
export const defaultAppGuardConfig: AppSubdomainGuardConfig = {
  requiredRole: 'client_side',
  publicRoutes: [
    '/auth',           // Páginas de login
    '/api/health',     // Health check
    '/_next',          // Assets do Next.js
    '/images',         // Imagens públicas
    '/favicon.ico'     // Favicon
  ],
  loginUrl: '/auth/login',
  accessDeniedUrl: '/auth/access-denied'
}