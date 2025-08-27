import { NextRequest, NextResponse } from 'next/server'

export function apiMiddleware(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname

  // Só processar rotas da feature api
  if (!pathname.startsWith('/api')) {
    return null
  }

  console.log(`🔌 API Feature: ${request.method} ${pathname}`)

  // Rate limiting simples para APIs
  const clientId = getClientId(request)
  
  // TODO: Implementar rate limiting mais sofisticado
  // TODO: Validar API keys para rotas públicas
  // TODO: Verificar CORS para requests cross-origin

  // Headers de segurança para APIs
  const response = NextResponse.next()
  
  // CORS básico
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Segurança
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return `${ip}-${request.headers.get('user-agent')?.slice(0, 50) || 'unknown'}`
}