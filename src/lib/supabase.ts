import { createClient } from '@supabase/supabase-js'

// Environment detection function
function getSupabaseConfig() {
  // Check if we're in development mode (both client and server)
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       process.env.NEXT_PUBLIC_APP_ENV === 'development'
  
  // Server-side: use development flag
  if (typeof window === 'undefined') {
    if (isDevelopment) {
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      }
    } else {
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      }
    }
  }
  
  // Client-side: detect based on hostname
  const hostname = window.location.hostname
  
  // Local development
  if (hostname === 'localhost' || hostname.includes('localhost')) {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    }
  }
  
  // Production
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  }
}

const config = getSupabaseConfig()

export const supabase = createClient(config.url, config.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// Cliente admin para operações server-side (API routes, middleware, etc)
// Não será usado no client-side para evitar erros de runtime
let supabaseAdminInstance: any = null

export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    console.warn('supabaseAdmin should not be used on client-side')
    return null
  }
  
  if (!supabaseAdminInstance) {
    const config = getSupabaseConfig()
    
    // Use local service role key if connecting to local Supabase
    const serviceKey = config.url.includes('127.0.0.1') || config.url.includes('localhost')
      ? process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
    }
    
    console.log('🔑 Using Supabase config:', { url: config.url, keyType: serviceKey.substring(0, 20) + '...' })
    
    supabaseAdminInstance = createClient(config.url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  
  return supabaseAdminInstance
}