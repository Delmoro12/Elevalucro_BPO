import { NextRequest, NextResponse } from 'next/server'

// Import shared middlewares
import { createDomainMiddleware, defaultDomainConfig } from './shared/domainMiddleware'
import { createAppSubdomainGuard, defaultAppGuardConfig } from './shared/appSubdomainGuard'
import { createToolsSubdomainGuard } from './shared/toolsSubdomainGuard'

// Import feature middlewares
import { authMiddleware } from './auth/middleware'
import { elevalucroBpoAppMiddleware } from './elevalucro_bpo_app/middleware'
import { internalToolsMiddleware } from './internal_tools/middleware'
import { apiMiddleware } from './api/middleware'

export interface MiddlewareConfig {
  domain: typeof defaultDomainConfig;
  appGuard: typeof defaultAppGuardConfig;
  enabledFeatures: {
    domain: boolean;
    appGuard: boolean;
    toolsGuard: boolean;
    auth: boolean;
    elevalucroBpoApp: boolean;
    internalTools: boolean;
    api: boolean;
  }
}

// Configuração padrão
const defaultConfig: MiddlewareConfig = {
  domain: defaultDomainConfig,
  appGuard: defaultAppGuardConfig,
  enabledFeatures: {
    domain: true,
    appGuard: true,      // 🚨 PORTARIA APP (client_side)
    toolsGuard: true,    // 🚨 PORTARIA TOOLS (bpo_side)
    auth: true,
    elevalucroBpoApp: true,
    internalTools: true,
    api: true
  }
}

export function createMiddlewareChain(config: MiddlewareConfig = defaultConfig) {
  // Criar instâncias dos middlewares
  const middlewares: Array<(request: NextRequest) => NextResponse | null> = []

  // Shared middlewares (sempre executam primeiro)
  if (config.enabledFeatures.domain) {
    middlewares.push(createDomainMiddleware(config.domain))
  }

  // Guards de segurança por subdomínio
  if (config.enabledFeatures.appGuard) {
    middlewares.push(createAppSubdomainGuard(config.appGuard))
  }

  if (config.enabledFeatures.toolsGuard) {
    middlewares.push(createToolsSubdomainGuard())
  }

  // Feature middlewares (executam por ordem de prioridade)
  if (config.enabledFeatures.api) {
    middlewares.push(apiMiddleware)
  }
  
  if (config.enabledFeatures.auth) {
    middlewares.push(authMiddleware)
  }
  
  if (config.enabledFeatures.internalTools) {
    middlewares.push(internalToolsMiddleware)
  }
  
  if (config.enabledFeatures.elevalucroBpoApp) {
    middlewares.push(elevalucroBpoAppMiddleware)
  }

  // Retornar função que executa todos os middlewares em sequência
  return function middlewareChain(request: NextRequest): NextResponse {
    const { method, nextUrl: { pathname } } = request
    console.log(`🔥 Middleware Chain: ${method} ${pathname}`)
    
    for (const middleware of middlewares) {
      const result = middleware(request)
      
      // Se algum middleware retornou uma resposta, usar ela
      if (result) {
        console.log(`🎯 Middleware returned response`)
        return result
      }
    }

    // Se chegou aqui, continuar processamento normal
    console.log(`✅ All middlewares passed, continuing...`)
    return NextResponse.next()
  }
}

// Export da função principal
export const middleware = createMiddlewareChain()

// Configurações personalizadas para diferentes ambientes
export const developmentMiddleware = createMiddlewareChain({
  ...defaultConfig,
  enabledFeatures: {
    ...defaultConfig.enabledFeatures,
    // No desenvolvimento, pode desabilitar algumas features
  }
})

export const productionMiddleware = createMiddlewareChain({
  ...defaultConfig,
  enabledFeatures: {
    ...defaultConfig.enabledFeatures,
    // Em produção, ativar todas as features
  }
})