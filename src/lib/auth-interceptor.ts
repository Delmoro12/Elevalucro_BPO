'use client';

/**
 * Interceptor para adicionar token de autenticação nos headers
 * quando cookies não estão disponíveis (problema com subdomínios localhost)
 */

let interceptorSetup = false;

export function setupAuthInterceptor() {
  if (interceptorSetup || typeof window === 'undefined') {
    return;
  }

  // Override fetch to add auth header
  const originalFetch = window.fetch;
  
  window.fetch = function(...args) {
    const [url, options = {}] = args;
    
    // Só interceptar requisições para o mesmo domínio
    if (typeof url === 'string' && url.startsWith('/')) {
      const token = sessionStorage.getItem('supabase-auth-token');
      
      if (token) {
        const headers = new Headers(options.headers);
        headers.set('x-supabase-auth-token', token);
        
        return originalFetch(url, {
          ...options,
          headers
        });
      }
    }
    
    return originalFetch.apply(this, args);
  };
  
  interceptorSetup = true;
  console.log('🔧 Auth interceptor setuped for sessionStorage token');
}